/**
 * @license
 * Copyright (c) 2014, 2021, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/**
 * Copyright (c) 2021, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 */
define(['ojs/ojcore', 'knockout', 'ojs/ojmodule-element-utils', 'ojs/ojlogger', 'ojs/ojmoduleanimations'],
  function (oj, ko, moduleUtils, Logger) {
    function getDefault(routerConfig) {
      for (var key in routerConfig) {
        var val = routerConfig[key];
        if (val.isDefault)
          return key;
      }
    }

    function setupModuleCaching(viewModel) {
      viewModel.cache = {};
      viewModel.viewDisconnected = function(event) {
        if (!event.detail.viewModel)
          return;

        var name = event.detail.viewModel.constructor.name;
        viewModel.cache[name] = {'view':event.detail.view,'viewModel':event.detail.viewModel};
      };
    }

    function setupModuleWithObservable(viewModel, moduleConfigName, viewNameObservable, moduleParams, cleanupMode) {
      viewModel[moduleConfigName] = ko.observable({'view':[], 'viewModel':null});
      viewModel.moduleComputed = ko.computed(function() {
        if (!viewNameObservable())
          return;

        // Set up busyContext before creating the viewModel
        var busyContext = oj.Context.getPageContext().getBusyContext();
        var options = { "description" : "Module helper loading '" + viewNameObservable()
                        + "' VM and invoking prefetch which may fetch data from REST end points" };
        var busyResolve = busyContext.addBusyState(options);
        Logger.info("[FIF App] " + options.description);

        var name = viewNameObservable();
        var viewPath = 'views/' + name + '.html';
        var modelPath = 'viewModels/' + name;
        var masterPromise;

        var cachedData = viewModel.cache ? viewModel.cache[name] : undefined;
        if (cachedData) {
          masterPromise = Promise.resolve([cachedData.view, cachedData.viewModel, true]);
        } else {
          masterPromise = Promise.all([
            moduleUtils.createView({'viewPath':viewPath}),
            moduleUtils.createViewModel({'viewModelPath':modelPath})
          ]);
        }

        masterPromise.then(function(values) {
          if (!values[0])
            throw "View is expected to render an ojModule";

          var config = {};
          // By default cleanupMode is 'onDisconnect'. So only value we need to set is 'none'
          if (cleanupMode && cleanupMode === 'none') {
            config['cleanupMode'] = cleanupMode;
          }

          config.view = values[0]

          // Handle view only ojModules.
          if (!values[1]) {
            viewModel[moduleConfigName](config);
            resolveBusyContext(options, busyResolve);
            return;
          }

          if (values[2])
            config.viewModel = values[1];
          else
            config.viewModel = new values[1](moduleParams);

          if (!config.viewModel.prefetch) {
            viewModel[moduleConfigName](config);
            resolveBusyContext(options, busyResolve);
            return;
          }

          var couldBePromise = config.viewModel.prefetch();

          if (!couldBePromise || !couldBePromise.then) {
            viewModel[moduleConfigName](config);
            resolveBusyContext(options, busyResolve);
            return;
          }

          couldBePromise.then(function() {
            viewModel[moduleConfigName](config);
          }).finally(function() {
            resolveBusyContext(options, busyResolve);
          });
        });
      });
    }

    function resolveBusyContext(options, context) {
      Logger.info("[FIF App] Resolved: " + options.description);
      context();
    }

    function setupModuleAnimations(viewModel, animationOptions, viewNameObservable, defaultModule) {
      var intialTransition = true;
      viewModel.switcher = function (context) {
        if (!viewNameObservable())
          return null;

        if (defaultModule && intialTransition && viewNameObservable() === defaultModule)
          return null;

        if (context.newViewModel && context.oldViewModel &&
            context.newViewModel.constructor == context.oldViewModel.constructor)
          return null;

        intialTransition = false;
        var animation = animationOptions[viewNameObservable()];
        if (ko.isObservable(animation))
          return animation();

        return animation;
      };

      viewModel.moduleAnimation = oj.ModuleAnimations.switcher(viewModel.switcher);
    }

    function setupStaticModule(viewModel, moduleConfigName, moduleName, params) {
      var name = ko.isObservable(moduleName) ? moduleName() : moduleName;
      viewModel[moduleConfigName] = ko.observable({'view':[], 'viewModel':null});
      viewModel[moduleConfigName + 'Computed'] = ko.computed(function() {
        var masterPromise = Promise.all([
          moduleUtils.createView({'viewPath': 'views/' + name + '.html'}),
          moduleUtils.createViewModel({'viewModelPath': 'viewModels/' + name})
        ]);
        masterPromise.then(
          function(values){
            var model = new values[1](params);
            viewModel[moduleConfigName]({'view':values[0],'viewModel':model});
          }
        );
      });
    };

    return {
      setupStaticModule: setupStaticModule,
      setupModuleWithObservable: setupModuleWithObservable,
      setupModuleAnimations: setupModuleAnimations,
      setupModuleCaching: setupModuleCaching
    };
  }
);
