"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataScope = exports.DEFAULT_SLOT_PROP = exports.PROPERTY_CHANGED = exports.CANCELABLE_ACTION = exports.ACTION = exports.CHILDREN_TYPE = exports.DYNAMIC_TEMPLATE_SLOT_TYPE = exports.DYNAMIC_SLOT_TYPE = exports.TEMPLATE_SLOT_TYPE = exports.SLOT_TYPE = void 0;
exports.SLOT_TYPE = "Slot";
exports.TEMPLATE_SLOT_TYPE = "TemplateSlot";
exports.DYNAMIC_SLOT_TYPE = "DynamicSlots";
exports.DYNAMIC_TEMPLATE_SLOT_TYPE = "DynamicTemplateSlots";
exports.CHILDREN_TYPE = "Children";
exports.ACTION = "Action";
exports.CANCELABLE_ACTION = "CancelableAction";
exports.PROPERTY_CHANGED = "PropertyChanged";
exports.DEFAULT_SLOT_PROP = "children";
var MetadataScope;
(function (MetadataScope) {
    MetadataScope[MetadataScope["RT_EXTENDED"] = -1] = "RT_EXTENDED";
    MetadataScope[MetadataScope["RT"] = 0] = "RT";
    MetadataScope[MetadataScope["DT"] = 1] = "DT";
})(MetadataScope = exports.MetadataScope || (exports.MetadataScope = {}));
