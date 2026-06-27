#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/ajv/dist/runtime/ucs2length.js
var require_ucs2length = __commonJS({
  "../../node_modules/ajv/dist/runtime/ucs2length.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function ucs2length(str) {
      const len = str.length;
      let length = 0;
      let pos = 0;
      let value;
      while (pos < len) {
        length++;
        value = str.charCodeAt(pos++);
        if (value >= 55296 && value <= 56319 && pos < len) {
          value = str.charCodeAt(pos);
          if ((value & 64512) === 56320)
            pos++;
        }
      }
      return length;
    }
    exports.default = ucs2length;
    ucs2length.code = 'require("ajv/dist/runtime/ucs2length").default';
  }
});

// ../../node_modules/fast-deep-equal/index.js
var require_fast_deep_equal = __commonJS({
  "../../node_modules/fast-deep-equal/index.js"(exports, module) {
    "use strict";
    module.exports = function equal(a, b) {
      if (a === b) return true;
      if (a && b && typeof a == "object" && typeof b == "object") {
        if (a.constructor !== b.constructor) return false;
        var length, i, keys;
        if (Array.isArray(a)) {
          length = a.length;
          if (length != b.length) return false;
          for (i = length; i-- !== 0; )
            if (!equal(a[i], b[i])) return false;
          return true;
        }
        if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
        if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
        if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
        keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length) return false;
        for (i = length; i-- !== 0; )
          if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
        for (i = length; i-- !== 0; ) {
          var key = keys[i];
          if (!equal(a[key], b[key])) return false;
        }
        return true;
      }
      return a !== a && b !== b;
    };
  }
});

// ../../node_modules/ajv/dist/runtime/equal.js
var require_equal = __commonJS({
  "../../node_modules/ajv/dist/runtime/equal.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var equal = require_fast_deep_equal();
    equal.code = 'require("ajv/dist/runtime/equal").default';
    exports.default = equal;
  }
});

// src/cli-integrity.ts
import { readFileSync as readFileSync2 } from "node:fs";
import process from "node:process";

// src/integrity.ts
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

// ../shared/src/spec-validator.generated.js
var import_ucs2length = __toESM(require_ucs2length(), 1);
var import_equal = __toESM(require_equal(), 1);
var schema31 = { "$schema": "https://json-schema.org/draft/2020-12/schema", "$id": "https://schemas.toranoai.com/spec/v0.1.json", "title": "Tora-Deployer project specification", "type": "object", "additionalProperties": false, "required": ["version", "name", "description", "entities", "roles", "pages", "auth"], "properties": { "$schema": { "type": "string" }, "version": { "const": "0.1" }, "name": { "type": "string", "pattern": "^[a-z][a-z0-9-]{2,}$" }, "description": { "type": "string", "minLength": 10 }, "entities": { "type": "array", "minItems": 1, "items": { "type": "object", "additionalProperties": false, "required": ["name", "fields"], "properties": { "name": { "type": "string", "pattern": "^[A-Z][A-Za-z0-9]+$" }, "description": { "type": "string" }, "fields": { "type": "array", "minItems": 2, "items": { "type": "object", "additionalProperties": false, "required": ["name", "type"], "properties": { "name": { "type": "string", "pattern": "^[a-z][a-z0-9_]*$", "not": { "enum": ["id", "created_at"], "$comment": "Auto-generated columns \u2014 a field with the same name would duplicate them (#84)" } }, "type": { "enum": ["text", "integer", "boolean", "datetime", "reference"] }, "required": { "type": "boolean", "default": false }, "references": { "type": "string", "pattern": "^[A-Z][A-Za-z0-9]+$" } }, "allOf": [{ "if": { "properties": { "type": { "const": "reference" } }, "required": ["type"] }, "then": { "required": ["references"] }, "else": { "not": { "required": ["references"] } } }] } } } } }, "roles": { "type": "array", "minItems": 1, "items": { "type": "object", "additionalProperties": false, "required": ["name", "permissions"], "properties": { "name": { "type": "string", "pattern": "^[a-z][a-z0-9_-]*$" }, "permissions": { "type": "object", "additionalProperties": { "type": "array", "items": { "enum": ["create", "read", "update", "delete"] }, "uniqueItems": true } }, "is_admin": { "type": "boolean" }, "is_default": { "type": "boolean" } } } }, "pages": { "type": "array", "minItems": 1, "items": { "type": "object", "additionalProperties": false, "required": ["type"], "properties": { "type": { "enum": ["list", "detail", "form", "dashboard"] }, "entity": { "type": "string", "pattern": "^[A-Z][A-Za-z0-9]+$" }, "name": { "type": "string" } } } }, "auth": { "type": "object", "additionalProperties": false, "required": ["type"], "properties": { "type": { "enum": ["password"] }, "self_signup": { "type": "boolean" }, "admin_email": { "type": "string", "format": "email" } } }, "target": { "enum": ["worker", "sveltekit"] } } };
var func1 = Object.prototype.hasOwnProperty;
var func2 = import_ucs2length.default.default ?? import_ucs2length.default;
var func0 = import_equal.default.default ?? import_equal.default;
var pattern4 = new RegExp("^[a-z][a-z0-9-]{2,}$", "u");
var pattern5 = new RegExp("^[A-Z][A-Za-z0-9]+$", "u");
var pattern6 = new RegExp("^[a-z][a-z0-9_]*$", "u");
var pattern8 = new RegExp("^[a-z][a-z0-9_-]*$", "u");
var formats0 = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
function validate20(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate20.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.version === void 0) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "version" }, message: "must have required property 'version'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.name === void 0) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "name" }, message: "must have required property 'name'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.description === void 0) {
      const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "description" }, message: "must have required property 'description'" };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.entities === void 0) {
      const err3 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "entities" }, message: "must have required property 'entities'" };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.roles === void 0) {
      const err4 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "roles" }, message: "must have required property 'roles'" };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    if (data.pages === void 0) {
      const err5 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "pages" }, message: "must have required property 'pages'" };
      if (vErrors === null) {
        vErrors = [err5];
      } else {
        vErrors.push(err5);
      }
      errors++;
    }
    if (data.auth === void 0) {
      const err6 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "auth" }, message: "must have required property 'auth'" };
      if (vErrors === null) {
        vErrors = [err6];
      } else {
        vErrors.push(err6);
      }
      errors++;
    }
    for (const key0 in data) {
      if (!func1.call(schema31.properties, key0)) {
        const err7 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.$schema !== void 0) {
      if (typeof data.$schema !== "string") {
        const err8 = { instancePath: instancePath + "/$schema", schemaPath: "#/properties/%24schema/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.version !== void 0) {
      if ("0.1" !== data.version) {
        const err9 = { instancePath: instancePath + "/version", schemaPath: "#/properties/version/const", keyword: "const", params: { allowedValue: "0.1" }, message: "must be equal to constant" };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.name !== void 0) {
      let data2 = data.name;
      if (typeof data2 === "string") {
        if (!pattern4.test(data2)) {
          const err10 = { instancePath: instancePath + "/name", schemaPath: "#/properties/name/pattern", keyword: "pattern", params: { pattern: "^[a-z][a-z0-9-]{2,}$" }, message: 'must match pattern "^[a-z][a-z0-9-]{2,}$"' };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
      } else {
        const err11 = { instancePath: instancePath + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.description !== void 0) {
      let data3 = data.description;
      if (typeof data3 === "string") {
        if (func2(data3) < 10) {
          const err12 = { instancePath: instancePath + "/description", schemaPath: "#/properties/description/minLength", keyword: "minLength", params: { limit: 10 }, message: "must NOT have fewer than 10 characters" };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
      } else {
        const err13 = { instancePath: instancePath + "/description", schemaPath: "#/properties/description/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
    if (data.entities !== void 0) {
      let data4 = data.entities;
      if (Array.isArray(data4)) {
        if (data4.length < 1) {
          const err14 = { instancePath: instancePath + "/entities", schemaPath: "#/properties/entities/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" };
          if (vErrors === null) {
            vErrors = [err14];
          } else {
            vErrors.push(err14);
          }
          errors++;
        }
        const len0 = data4.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data5 = data4[i0];
          if (data5 && typeof data5 == "object" && !Array.isArray(data5)) {
            if (data5.name === void 0) {
              const err15 = { instancePath: instancePath + "/entities/" + i0, schemaPath: "#/properties/entities/items/required", keyword: "required", params: { missingProperty: "name" }, message: "must have required property 'name'" };
              if (vErrors === null) {
                vErrors = [err15];
              } else {
                vErrors.push(err15);
              }
              errors++;
            }
            if (data5.fields === void 0) {
              const err16 = { instancePath: instancePath + "/entities/" + i0, schemaPath: "#/properties/entities/items/required", keyword: "required", params: { missingProperty: "fields" }, message: "must have required property 'fields'" };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
            for (const key1 in data5) {
              if (!(key1 === "name" || key1 === "description" || key1 === "fields")) {
                const err17 = { instancePath: instancePath + "/entities/" + i0, schemaPath: "#/properties/entities/items/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
                if (vErrors === null) {
                  vErrors = [err17];
                } else {
                  vErrors.push(err17);
                }
                errors++;
              }
            }
            if (data5.name !== void 0) {
              let data6 = data5.name;
              if (typeof data6 === "string") {
                if (!pattern5.test(data6)) {
                  const err18 = { instancePath: instancePath + "/entities/" + i0 + "/name", schemaPath: "#/properties/entities/items/properties/name/pattern", keyword: "pattern", params: { pattern: "^[A-Z][A-Za-z0-9]+$" }, message: 'must match pattern "^[A-Z][A-Za-z0-9]+$"' };
                  if (vErrors === null) {
                    vErrors = [err18];
                  } else {
                    vErrors.push(err18);
                  }
                  errors++;
                }
              } else {
                const err19 = { instancePath: instancePath + "/entities/" + i0 + "/name", schemaPath: "#/properties/entities/items/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err19];
                } else {
                  vErrors.push(err19);
                }
                errors++;
              }
            }
            if (data5.description !== void 0) {
              if (typeof data5.description !== "string") {
                const err20 = { instancePath: instancePath + "/entities/" + i0 + "/description", schemaPath: "#/properties/entities/items/properties/description/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err20];
                } else {
                  vErrors.push(err20);
                }
                errors++;
              }
            }
            if (data5.fields !== void 0) {
              let data8 = data5.fields;
              if (Array.isArray(data8)) {
                if (data8.length < 2) {
                  const err21 = { instancePath: instancePath + "/entities/" + i0 + "/fields", schemaPath: "#/properties/entities/items/properties/fields/minItems", keyword: "minItems", params: { limit: 2 }, message: "must NOT have fewer than 2 items" };
                  if (vErrors === null) {
                    vErrors = [err21];
                  } else {
                    vErrors.push(err21);
                  }
                  errors++;
                }
                const len1 = data8.length;
                for (let i1 = 0; i1 < len1; i1++) {
                  let data9 = data8[i1];
                  const _errs23 = errors;
                  let valid7 = true;
                  const _errs24 = errors;
                  if (data9 && typeof data9 == "object" && !Array.isArray(data9)) {
                    let missing0;
                    if (data9.type === void 0 && (missing0 = "type")) {
                      const err22 = {};
                      if (vErrors === null) {
                        vErrors = [err22];
                      } else {
                        vErrors.push(err22);
                      }
                      errors++;
                    } else {
                      if (data9.type !== void 0) {
                        if ("reference" !== data9.type) {
                          const err23 = {};
                          if (vErrors === null) {
                            vErrors = [err23];
                          } else {
                            vErrors.push(err23);
                          }
                          errors++;
                        }
                      }
                    }
                  }
                  var _valid0 = _errs24 === errors;
                  errors = _errs23;
                  if (vErrors !== null) {
                    if (_errs23) {
                      vErrors.length = _errs23;
                    } else {
                      vErrors = null;
                    }
                  }
                  let ifClause0;
                  if (_valid0) {
                    const _errs26 = errors;
                    if (data9 && typeof data9 == "object" && !Array.isArray(data9)) {
                      if (data9.references === void 0) {
                        const err24 = { instancePath: instancePath + "/entities/" + i0 + "/fields/" + i1, schemaPath: "#/properties/entities/items/properties/fields/items/allOf/0/then/required", keyword: "required", params: { missingProperty: "references" }, message: "must have required property 'references'" };
                        if (vErrors === null) {
                          vErrors = [err24];
                        } else {
                          vErrors.push(err24);
                        }
                        errors++;
                      }
                    }
                    var _valid0 = _errs26 === errors;
                    valid7 = _valid0;
                    ifClause0 = "then";
                  } else {
                    const _errs27 = errors;
                    const _errs28 = errors;
                    const _errs29 = errors;
                    if (data9 && typeof data9 == "object" && !Array.isArray(data9)) {
                      let missing1;
                      if (data9.references === void 0 && (missing1 = "references")) {
                        const err25 = {};
                        if (vErrors === null) {
                          vErrors = [err25];
                        } else {
                          vErrors.push(err25);
                        }
                        errors++;
                      }
                    }
                    var valid9 = _errs29 === errors;
                    if (valid9) {
                      const err26 = { instancePath: instancePath + "/entities/" + i0 + "/fields/" + i1, schemaPath: "#/properties/entities/items/properties/fields/items/allOf/0/else/not", keyword: "not", params: {}, message: "must NOT be valid" };
                      if (vErrors === null) {
                        vErrors = [err26];
                      } else {
                        vErrors.push(err26);
                      }
                      errors++;
                    } else {
                      errors = _errs28;
                      if (vErrors !== null) {
                        if (_errs28) {
                          vErrors.length = _errs28;
                        } else {
                          vErrors = null;
                        }
                      }
                    }
                    var _valid0 = _errs27 === errors;
                    valid7 = _valid0;
                    ifClause0 = "else";
                  }
                  if (!valid7) {
                    const err27 = { instancePath: instancePath + "/entities/" + i0 + "/fields/" + i1, schemaPath: "#/properties/entities/items/properties/fields/items/allOf/0/if", keyword: "if", params: { failingKeyword: ifClause0 }, message: 'must match "' + ifClause0 + '" schema' };
                    if (vErrors === null) {
                      vErrors = [err27];
                    } else {
                      vErrors.push(err27);
                    }
                    errors++;
                  }
                  if (data9 && typeof data9 == "object" && !Array.isArray(data9)) {
                    if (data9.name === void 0) {
                      const err28 = { instancePath: instancePath + "/entities/" + i0 + "/fields/" + i1, schemaPath: "#/properties/entities/items/properties/fields/items/required", keyword: "required", params: { missingProperty: "name" }, message: "must have required property 'name'" };
                      if (vErrors === null) {
                        vErrors = [err28];
                      } else {
                        vErrors.push(err28);
                      }
                      errors++;
                    }
                    if (data9.type === void 0) {
                      const err29 = { instancePath: instancePath + "/entities/" + i0 + "/fields/" + i1, schemaPath: "#/properties/entities/items/properties/fields/items/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
                      if (vErrors === null) {
                        vErrors = [err29];
                      } else {
                        vErrors.push(err29);
                      }
                      errors++;
                    }
                    for (const key2 in data9) {
                      if (!(key2 === "name" || key2 === "type" || key2 === "required" || key2 === "references")) {
                        const err30 = { instancePath: instancePath + "/entities/" + i0 + "/fields/" + i1, schemaPath: "#/properties/entities/items/properties/fields/items/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key2 }, message: "must NOT have additional properties" };
                        if (vErrors === null) {
                          vErrors = [err30];
                        } else {
                          vErrors.push(err30);
                        }
                        errors++;
                      }
                    }
                    if (data9.name !== void 0) {
                      let data11 = data9.name;
                      const _errs33 = errors;
                      const _errs34 = errors;
                      if (!(data11 === "id" || data11 === "created_at")) {
                        const err31 = {};
                        if (vErrors === null) {
                          vErrors = [err31];
                        } else {
                          vErrors.push(err31);
                        }
                        errors++;
                      }
                      var valid11 = _errs34 === errors;
                      if (valid11) {
                        const err32 = { instancePath: instancePath + "/entities/" + i0 + "/fields/" + i1 + "/name", schemaPath: "#/properties/entities/items/properties/fields/items/properties/name/not", keyword: "not", params: {}, message: "must NOT be valid" };
                        if (vErrors === null) {
                          vErrors = [err32];
                        } else {
                          vErrors.push(err32);
                        }
                        errors++;
                      } else {
                        errors = _errs33;
                        if (vErrors !== null) {
                          if (_errs33) {
                            vErrors.length = _errs33;
                          } else {
                            vErrors = null;
                          }
                        }
                      }
                      if (typeof data11 === "string") {
                        if (!pattern6.test(data11)) {
                          const err33 = { instancePath: instancePath + "/entities/" + i0 + "/fields/" + i1 + "/name", schemaPath: "#/properties/entities/items/properties/fields/items/properties/name/pattern", keyword: "pattern", params: { pattern: "^[a-z][a-z0-9_]*$" }, message: 'must match pattern "^[a-z][a-z0-9_]*$"' };
                          if (vErrors === null) {
                            vErrors = [err33];
                          } else {
                            vErrors.push(err33);
                          }
                          errors++;
                        }
                      } else {
                        const err34 = { instancePath: instancePath + "/entities/" + i0 + "/fields/" + i1 + "/name", schemaPath: "#/properties/entities/items/properties/fields/items/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                        if (vErrors === null) {
                          vErrors = [err34];
                        } else {
                          vErrors.push(err34);
                        }
                        errors++;
                      }
                    }
                    if (data9.type !== void 0) {
                      let data12 = data9.type;
                      if (!(data12 === "text" || data12 === "integer" || data12 === "boolean" || data12 === "datetime" || data12 === "reference")) {
                        const err35 = { instancePath: instancePath + "/entities/" + i0 + "/fields/" + i1 + "/type", schemaPath: "#/properties/entities/items/properties/fields/items/properties/type/enum", keyword: "enum", params: { allowedValues: schema31.properties.entities.items.properties.fields.items.properties.type.enum }, message: "must be equal to one of the allowed values" };
                        if (vErrors === null) {
                          vErrors = [err35];
                        } else {
                          vErrors.push(err35);
                        }
                        errors++;
                      }
                    }
                    if (data9.required !== void 0) {
                      if (typeof data9.required !== "boolean") {
                        const err36 = { instancePath: instancePath + "/entities/" + i0 + "/fields/" + i1 + "/required", schemaPath: "#/properties/entities/items/properties/fields/items/properties/required/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
                        if (vErrors === null) {
                          vErrors = [err36];
                        } else {
                          vErrors.push(err36);
                        }
                        errors++;
                      }
                    }
                    if (data9.references !== void 0) {
                      let data14 = data9.references;
                      if (typeof data14 === "string") {
                        if (!pattern5.test(data14)) {
                          const err37 = { instancePath: instancePath + "/entities/" + i0 + "/fields/" + i1 + "/references", schemaPath: "#/properties/entities/items/properties/fields/items/properties/references/pattern", keyword: "pattern", params: { pattern: "^[A-Z][A-Za-z0-9]+$" }, message: 'must match pattern "^[A-Z][A-Za-z0-9]+$"' };
                          if (vErrors === null) {
                            vErrors = [err37];
                          } else {
                            vErrors.push(err37);
                          }
                          errors++;
                        }
                      } else {
                        const err38 = { instancePath: instancePath + "/entities/" + i0 + "/fields/" + i1 + "/references", schemaPath: "#/properties/entities/items/properties/fields/items/properties/references/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                        if (vErrors === null) {
                          vErrors = [err38];
                        } else {
                          vErrors.push(err38);
                        }
                        errors++;
                      }
                    }
                  } else {
                    const err39 = { instancePath: instancePath + "/entities/" + i0 + "/fields/" + i1, schemaPath: "#/properties/entities/items/properties/fields/items/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                    if (vErrors === null) {
                      vErrors = [err39];
                    } else {
                      vErrors.push(err39);
                    }
                    errors++;
                  }
                }
              } else {
                const err40 = { instancePath: instancePath + "/entities/" + i0 + "/fields", schemaPath: "#/properties/entities/items/properties/fields/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                if (vErrors === null) {
                  vErrors = [err40];
                } else {
                  vErrors.push(err40);
                }
                errors++;
              }
            }
          } else {
            const err41 = { instancePath: instancePath + "/entities/" + i0, schemaPath: "#/properties/entities/items/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
              vErrors = [err41];
            } else {
              vErrors.push(err41);
            }
            errors++;
          }
        }
      } else {
        const err42 = { instancePath: instancePath + "/entities", schemaPath: "#/properties/entities/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        if (vErrors === null) {
          vErrors = [err42];
        } else {
          vErrors.push(err42);
        }
        errors++;
      }
    }
    if (data.roles !== void 0) {
      let data15 = data.roles;
      if (Array.isArray(data15)) {
        if (data15.length < 1) {
          const err43 = { instancePath: instancePath + "/roles", schemaPath: "#/properties/roles/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" };
          if (vErrors === null) {
            vErrors = [err43];
          } else {
            vErrors.push(err43);
          }
          errors++;
        }
        const len2 = data15.length;
        for (let i2 = 0; i2 < len2; i2++) {
          let data16 = data15[i2];
          if (data16 && typeof data16 == "object" && !Array.isArray(data16)) {
            if (data16.name === void 0) {
              const err44 = { instancePath: instancePath + "/roles/" + i2, schemaPath: "#/properties/roles/items/required", keyword: "required", params: { missingProperty: "name" }, message: "must have required property 'name'" };
              if (vErrors === null) {
                vErrors = [err44];
              } else {
                vErrors.push(err44);
              }
              errors++;
            }
            if (data16.permissions === void 0) {
              const err45 = { instancePath: instancePath + "/roles/" + i2, schemaPath: "#/properties/roles/items/required", keyword: "required", params: { missingProperty: "permissions" }, message: "must have required property 'permissions'" };
              if (vErrors === null) {
                vErrors = [err45];
              } else {
                vErrors.push(err45);
              }
              errors++;
            }
            for (const key3 in data16) {
              if (!(key3 === "name" || key3 === "permissions" || key3 === "is_admin" || key3 === "is_default")) {
                const err46 = { instancePath: instancePath + "/roles/" + i2, schemaPath: "#/properties/roles/items/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key3 }, message: "must NOT have additional properties" };
                if (vErrors === null) {
                  vErrors = [err46];
                } else {
                  vErrors.push(err46);
                }
                errors++;
              }
            }
            if (data16.name !== void 0) {
              let data17 = data16.name;
              if (typeof data17 === "string") {
                if (!pattern8.test(data17)) {
                  const err47 = { instancePath: instancePath + "/roles/" + i2 + "/name", schemaPath: "#/properties/roles/items/properties/name/pattern", keyword: "pattern", params: { pattern: "^[a-z][a-z0-9_-]*$" }, message: 'must match pattern "^[a-z][a-z0-9_-]*$"' };
                  if (vErrors === null) {
                    vErrors = [err47];
                  } else {
                    vErrors.push(err47);
                  }
                  errors++;
                }
              } else {
                const err48 = { instancePath: instancePath + "/roles/" + i2 + "/name", schemaPath: "#/properties/roles/items/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err48];
                } else {
                  vErrors.push(err48);
                }
                errors++;
              }
            }
            if (data16.permissions !== void 0) {
              let data18 = data16.permissions;
              if (data18 && typeof data18 == "object" && !Array.isArray(data18)) {
                for (const key4 in data18) {
                  let data19 = data18[key4];
                  if (Array.isArray(data19)) {
                    const len3 = data19.length;
                    for (let i3 = 0; i3 < len3; i3++) {
                      let data20 = data19[i3];
                      if (!(data20 === "create" || data20 === "read" || data20 === "update" || data20 === "delete")) {
                        const err49 = { instancePath: instancePath + "/roles/" + i2 + "/permissions/" + key4.replace(/~/g, "~0").replace(/\//g, "~1") + "/" + i3, schemaPath: "#/properties/roles/items/properties/permissions/additionalProperties/items/enum", keyword: "enum", params: { allowedValues: schema31.properties.roles.items.properties.permissions.additionalProperties.items.enum }, message: "must be equal to one of the allowed values" };
                        if (vErrors === null) {
                          vErrors = [err49];
                        } else {
                          vErrors.push(err49);
                        }
                        errors++;
                      }
                    }
                    let i4 = data19.length;
                    let j0;
                    if (i4 > 1) {
                      outer0: for (; i4--; ) {
                        for (j0 = i4; j0--; ) {
                          if (func0(data19[i4], data19[j0])) {
                            const err50 = { instancePath: instancePath + "/roles/" + i2 + "/permissions/" + key4.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/roles/items/properties/permissions/additionalProperties/uniqueItems", keyword: "uniqueItems", params: { i: i4, j: j0 }, message: "must NOT have duplicate items (items ## " + j0 + " and " + i4 + " are identical)" };
                            if (vErrors === null) {
                              vErrors = [err50];
                            } else {
                              vErrors.push(err50);
                            }
                            errors++;
                            break outer0;
                          }
                        }
                      }
                    }
                  } else {
                    const err51 = { instancePath: instancePath + "/roles/" + i2 + "/permissions/" + key4.replace(/~/g, "~0").replace(/\//g, "~1"), schemaPath: "#/properties/roles/items/properties/permissions/additionalProperties/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                    if (vErrors === null) {
                      vErrors = [err51];
                    } else {
                      vErrors.push(err51);
                    }
                    errors++;
                  }
                }
              } else {
                const err52 = { instancePath: instancePath + "/roles/" + i2 + "/permissions", schemaPath: "#/properties/roles/items/properties/permissions/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                if (vErrors === null) {
                  vErrors = [err52];
                } else {
                  vErrors.push(err52);
                }
                errors++;
              }
            }
            if (data16.is_admin !== void 0) {
              if (typeof data16.is_admin !== "boolean") {
                const err53 = { instancePath: instancePath + "/roles/" + i2 + "/is_admin", schemaPath: "#/properties/roles/items/properties/is_admin/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
                if (vErrors === null) {
                  vErrors = [err53];
                } else {
                  vErrors.push(err53);
                }
                errors++;
              }
            }
            if (data16.is_default !== void 0) {
              if (typeof data16.is_default !== "boolean") {
                const err54 = { instancePath: instancePath + "/roles/" + i2 + "/is_default", schemaPath: "#/properties/roles/items/properties/is_default/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
                if (vErrors === null) {
                  vErrors = [err54];
                } else {
                  vErrors.push(err54);
                }
                errors++;
              }
            }
          } else {
            const err55 = { instancePath: instancePath + "/roles/" + i2, schemaPath: "#/properties/roles/items/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
              vErrors = [err55];
            } else {
              vErrors.push(err55);
            }
            errors++;
          }
        }
      } else {
        const err56 = { instancePath: instancePath + "/roles", schemaPath: "#/properties/roles/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        if (vErrors === null) {
          vErrors = [err56];
        } else {
          vErrors.push(err56);
        }
        errors++;
      }
    }
    if (data.pages !== void 0) {
      let data23 = data.pages;
      if (Array.isArray(data23)) {
        if (data23.length < 1) {
          const err57 = { instancePath: instancePath + "/pages", schemaPath: "#/properties/pages/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" };
          if (vErrors === null) {
            vErrors = [err57];
          } else {
            vErrors.push(err57);
          }
          errors++;
        }
        const len4 = data23.length;
        for (let i5 = 0; i5 < len4; i5++) {
          let data24 = data23[i5];
          if (data24 && typeof data24 == "object" && !Array.isArray(data24)) {
            if (data24.type === void 0) {
              const err58 = { instancePath: instancePath + "/pages/" + i5, schemaPath: "#/properties/pages/items/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
              if (vErrors === null) {
                vErrors = [err58];
              } else {
                vErrors.push(err58);
              }
              errors++;
            }
            for (const key5 in data24) {
              if (!(key5 === "type" || key5 === "entity" || key5 === "name")) {
                const err59 = { instancePath: instancePath + "/pages/" + i5, schemaPath: "#/properties/pages/items/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key5 }, message: "must NOT have additional properties" };
                if (vErrors === null) {
                  vErrors = [err59];
                } else {
                  vErrors.push(err59);
                }
                errors++;
              }
            }
            if (data24.type !== void 0) {
              let data25 = data24.type;
              if (!(data25 === "list" || data25 === "detail" || data25 === "form" || data25 === "dashboard")) {
                const err60 = { instancePath: instancePath + "/pages/" + i5 + "/type", schemaPath: "#/properties/pages/items/properties/type/enum", keyword: "enum", params: { allowedValues: schema31.properties.pages.items.properties.type.enum }, message: "must be equal to one of the allowed values" };
                if (vErrors === null) {
                  vErrors = [err60];
                } else {
                  vErrors.push(err60);
                }
                errors++;
              }
            }
            if (data24.entity !== void 0) {
              let data26 = data24.entity;
              if (typeof data26 === "string") {
                if (!pattern5.test(data26)) {
                  const err61 = { instancePath: instancePath + "/pages/" + i5 + "/entity", schemaPath: "#/properties/pages/items/properties/entity/pattern", keyword: "pattern", params: { pattern: "^[A-Z][A-Za-z0-9]+$" }, message: 'must match pattern "^[A-Z][A-Za-z0-9]+$"' };
                  if (vErrors === null) {
                    vErrors = [err61];
                  } else {
                    vErrors.push(err61);
                  }
                  errors++;
                }
              } else {
                const err62 = { instancePath: instancePath + "/pages/" + i5 + "/entity", schemaPath: "#/properties/pages/items/properties/entity/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err62];
                } else {
                  vErrors.push(err62);
                }
                errors++;
              }
            }
            if (data24.name !== void 0) {
              if (typeof data24.name !== "string") {
                const err63 = { instancePath: instancePath + "/pages/" + i5 + "/name", schemaPath: "#/properties/pages/items/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                  vErrors = [err63];
                } else {
                  vErrors.push(err63);
                }
                errors++;
              }
            }
          } else {
            const err64 = { instancePath: instancePath + "/pages/" + i5, schemaPath: "#/properties/pages/items/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
              vErrors = [err64];
            } else {
              vErrors.push(err64);
            }
            errors++;
          }
        }
      } else {
        const err65 = { instancePath: instancePath + "/pages", schemaPath: "#/properties/pages/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        if (vErrors === null) {
          vErrors = [err65];
        } else {
          vErrors.push(err65);
        }
        errors++;
      }
    }
    if (data.auth !== void 0) {
      let data28 = data.auth;
      if (data28 && typeof data28 == "object" && !Array.isArray(data28)) {
        if (data28.type === void 0) {
          const err66 = { instancePath: instancePath + "/auth", schemaPath: "#/properties/auth/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property 'type'" };
          if (vErrors === null) {
            vErrors = [err66];
          } else {
            vErrors.push(err66);
          }
          errors++;
        }
        for (const key6 in data28) {
          if (!(key6 === "type" || key6 === "self_signup" || key6 === "admin_email")) {
            const err67 = { instancePath: instancePath + "/auth", schemaPath: "#/properties/auth/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key6 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
              vErrors = [err67];
            } else {
              vErrors.push(err67);
            }
            errors++;
          }
        }
        if (data28.type !== void 0) {
          if (!(data28.type === "password")) {
            const err68 = { instancePath: instancePath + "/auth/type", schemaPath: "#/properties/auth/properties/type/enum", keyword: "enum", params: { allowedValues: schema31.properties.auth.properties.type.enum }, message: "must be equal to one of the allowed values" };
            if (vErrors === null) {
              vErrors = [err68];
            } else {
              vErrors.push(err68);
            }
            errors++;
          }
        }
        if (data28.self_signup !== void 0) {
          if (typeof data28.self_signup !== "boolean") {
            const err69 = { instancePath: instancePath + "/auth/self_signup", schemaPath: "#/properties/auth/properties/self_signup/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
            if (vErrors === null) {
              vErrors = [err69];
            } else {
              vErrors.push(err69);
            }
            errors++;
          }
        }
        if (data28.admin_email !== void 0) {
          let data31 = data28.admin_email;
          if (typeof data31 === "string") {
            if (!formats0.test(data31)) {
              const err70 = { instancePath: instancePath + "/auth/admin_email", schemaPath: "#/properties/auth/properties/admin_email/format", keyword: "format", params: { format: "email" }, message: 'must match format "email"' };
              if (vErrors === null) {
                vErrors = [err70];
              } else {
                vErrors.push(err70);
              }
              errors++;
            }
          } else {
            const err71 = { instancePath: instancePath + "/auth/admin_email", schemaPath: "#/properties/auth/properties/admin_email/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err71];
            } else {
              vErrors.push(err71);
            }
            errors++;
          }
        }
      } else {
        const err72 = { instancePath: instancePath + "/auth", schemaPath: "#/properties/auth/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        if (vErrors === null) {
          vErrors = [err72];
        } else {
          vErrors.push(err72);
        }
        errors++;
      }
    }
    if (data.target !== void 0) {
      let data32 = data.target;
      if (!(data32 === "worker" || data32 === "sveltekit")) {
        const err73 = { instancePath: instancePath + "/target", schemaPath: "#/properties/target/enum", keyword: "enum", params: { allowedValues: schema31.properties.target.enum }, message: "must be equal to one of the allowed values" };
        if (vErrors === null) {
          vErrors = [err73];
        } else {
          vErrors.push(err73);
        }
        errors++;
      }
    }
  } else {
    const err74 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err74];
    } else {
      vErrors.push(err74);
    }
    errors++;
  }
  validate20.errors = vErrors;
  return errors === 0;
}
validate20.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };

// ../shared/src/spec.ts
function adminRole(spec) {
  const role = spec.roles.find((item) => item.is_admin);
  if (!role) throw new Error("spec.roles: manca un ruolo con is_admin: true");
  return role;
}
function defaultRole(spec) {
  const role = spec.roles.find((item) => item.is_default);
  if (!role) throw new Error("spec.roles: manca un ruolo con is_default: true");
  return role;
}

// raw-template:src/templates/auth.js
var auth_default = `// Auth helpers per l'app generata \u2014 Web Crypto only, nessuna dipendenza.
export const SESSION_COOKIE = "__sess";
export const PBKDF2_ITERATIONS = 150000;
export const PBKDF2_VERSION = 1;
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const enc = new TextEncoder();

function toHex(buf) {
  return [...new Uint8Array(buf)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function randomHex(bytes) {
  const value = new Uint8Array(bytes);
  crypto.getRandomValues(value);
  return toHex(value);
}

async function pbkdf2(password, saltHex, iterations) {
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const salt = Uint8Array.from(saltHex.match(/../g).map((hex) => parseInt(hex, 16)));
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  return toHex(bits);
}

export async function hashPassword(password) {
  const salt = randomHex(16);
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  return { hash, salt, iterations: PBKDF2_ITERATIONS, version: PBKDF2_VERSION };
}

/** Confronto in tempo costante su stringhe hex di pari lunghezza. */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return diff === 0;
}

export async function verifyPassword(password, stored) {
  const hash = await pbkdf2(password, stored.salt, stored.iterations);
  return timingSafeEqual(hash, stored.hash);
}

/** Re-hash a password with the current parameters before persisting it. */
export async function setPassword(DB, userId, password) {
  const stored = await hashPassword(password);
  await DB.prepare('UPDATE "users" SET "password_hash" = ?, "salt" = ?, "iterations" = ?, "version" = ? WHERE "id" = ?')
    .bind(stored.hash, stored.salt, stored.iterations, stored.version, userId)
    .run();
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(value));
  return toHex(digest);
}

export async function createSession(DB, userId) {
  const token = randomHex(32);
  const tokenHash = await sha256Hex(token);
  const expiresAt = Date.now() + SESSION_TTL_MS;
  // A successful login replaces any previous session for this user.
  await DB.prepare('DELETE FROM "sessions" WHERE "user_id" = ?').bind(userId).run();
  await DB.prepare('INSERT INTO "sessions" ("token_hash", "user_id", "expires_at") VALUES (?, ?, ?)')
    .bind(tokenHash, userId, expiresAt)
    .run();
  return token;
}

export async function resolveSession(DB, token) {
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const row = await DB.prepare(
    'SELECT s."user_id" AS user_id, s."expires_at" AS expires_at, u."id" AS id, u."email" AS email, u."role" AS role ' +
    'FROM "sessions" s JOIN "users" u ON u."id" = s."user_id" WHERE s."token_hash" = ?',
  ).bind(tokenHash).first();
  if (!row) return null;
  if (Number(row.expires_at) < Date.now()) {
    await destroySession(DB, token);
    return null;
  }
  return { id: row.id, email: row.email, role: row.role };
}

export async function destroySession(DB, token) {
  if (!token) return;
  const tokenHash = await sha256Hex(token);
  await DB.prepare('DELETE FROM "sessions" WHERE "token_hash" = ?').bind(tokenHash).run();
}

export function sessionCookie(token, isHttps) {
  const parts = [
    \`\${SESSION_COOKIE}=\${token}\`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    \`Max-Age=\${Math.floor(SESSION_TTL_MS / 1000)}\`,
  ];
  if (isHttps) parts.push("Secure");
  return parts.join("; ");
}

export function clearCookie() {
  return \`\${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0\`;
}

export function readCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  for (const part of header.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return value.join("=");
  }
  return null;
}

/** CSRF: l'Origin (fallback Referer) deve combaciare con l'host della richiesta. */
export function checkOrigin(request) {
  const url = new URL(request.url);
  const origin = request.headers.get("Origin") || request.headers.get("Referer");
  if (!origin) return false;
  try {
    return new URL(origin).host === url.host;
  } catch {
    return false;
  }
}
`;

// raw-template:src/templates/index.js
var templates_default = `// Worker entry, generic CRUD router driven by config and isolated views.
// No build step, no npm dependencies, Web-standard APIs plus D1 only.
import { ENTITIES, APP_NAME, PERMISSIONS, ROLES, ADMIN_ROLE, DEFAULT_ROLE } from "./config.js";
import { humanize } from "./lib/ui-kit.js";
import { dbList, dbGet, dbInsert, dbUpdate, dbDelete, dbCount } from "./lib/db.js";
import { SESSION_COOKIE, hashPassword, verifyPassword, setPassword, createSession, resolveSession, destroySession, sessionCookie, clearCookie, readCookie, checkOrigin } from "./lib/auth.js";
import { renderDashboard, renderList, renderForm, renderDetail, renderLogin, renderSignup, renderAccountPassword, renderUsersList, renderUserForm } from "./views.js";

const APP_TITLE = humanize(APP_NAME);

function html(body, status = 200) {
  return new Response(body, { status, headers: { "Content-Type": "text/html;charset=UTF-8" } });
}

function canAccess(role, entityName, action) {
  const permissions = PERMISSIONS[role];
  return !!(permissions && permissions[entityName] && permissions[entityName].includes(action));
}

function roleForEmail(email, env) {
  return env.ADMIN_EMAIL && email === env.ADMIN_EMAIL ? ADMIN_ROLE : DEFAULT_ROLE;
}

function makeCtx(user, activePath, options = {}) {
  return {
    user,
    appTitle: APP_TITLE,
    entities: ENTITIES,
    roles: ROLES,
    isAdmin: user ? user.role === ADMIN_ROLE : false,
    activePath,
    ...options,
    can: (entityName, action) => canAccess(user ? user.role : null, entityName, action),
  };
}

function requireAdmin(user) {
  return !!user && user.role === ADMIN_ROLE;
}

function validateFormData(entity, data) {
  for (const field of entity.fields) {
    if (field.required && !data[field.name]) {
      return \`Il campo \xAB\${humanize(field.name)}\xBB \xE8 obbligatorio.\`;
    }
  }
  return null;
}

function extractFields(entity, formData) {
  const cols = [];
  const vals = [];
  for (const field of entity.fields) {
    cols.push(field.name);
    if (field.type === "boolean") {
      vals.push(formData.get(field.name) === "1" ? 1 : 0);
    } else {
      const value = formData.get(field.name);
      vals.push(value === "" ? null : value);
    }
  }
  return { cols, vals };
}

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();
  const DB = env.DB;
  const isHttps = url.protocol === "https:";

  let user = null;
  if (env.DEV_AUTH_BYPASS === "1") {
    user = { id: "dev-admin", email: "dev@localhost", role: ADMIN_ROLE };
  } else {
    user = await resolveSession(DB, readCookie(request, SESSION_COOKIE));
  }

  if (method === "POST" && !checkOrigin(request)) {
    return new Response("Bad origin", { status: 403 });
  }

  if (path === "/login" && method === "GET") return html(renderLogin(null, makeCtx(null, "/login")));
  if (path === "/login" && method === "POST") {
    const formData = await request.formData();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    const row = await DB.prepare('SELECT * FROM "users" WHERE "email" = ?').bind(email).first();
    if (!row || !(await verifyPassword(password, { hash: row.password_hash, salt: row.salt, iterations: row.iterations }))) {
      return html(renderLogin("Credenziali non valide.", makeCtx(null, "/login")), 401);
    }
    const token = await createSession(DB, row.id);
    return new Response(null, { status: 303, headers: { Location: "/", "Set-Cookie": sessionCookie(token, isHttps) } });
  }
  if (path === "/signup" && method === "GET") return html(renderSignup(null, makeCtx(null, "/signup")));
  if (path === "/signup" && method === "POST") {
    const formData = await request.formData();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    if (password.length < 10) return html(renderSignup("La password deve avere almeno 10 caratteri.", makeCtx(null, "/signup")), 422);
    const exists = await DB.prepare('SELECT 1 FROM "users" WHERE "email" = ?').bind(email).first();
    if (exists) return html(renderSignup("Email gi\xE0 registrata.", makeCtx(null, "/signup")), 422);
    const stored = await hashPassword(password);
    const id = crypto.randomUUID();
    await DB.prepare('INSERT INTO "users" ("id", "email", "password_hash", "salt", "iterations", "version", "role") VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(id, email, stored.hash, stored.salt, stored.iterations, stored.version, roleForEmail(email, env))
      .run();
    const token = await createSession(DB, id);
    return new Response(null, { status: 303, headers: { Location: "/", "Set-Cookie": sessionCookie(token, isHttps) } });
  }
  if (path === "/logout" && method === "POST") {
    await destroySession(DB, readCookie(request, SESSION_COOKIE));
    return new Response(null, { status: 303, headers: { Location: "/login", "Set-Cookie": clearCookie() } });
  }

  if (!user) return new Response(null, { status: 303, headers: { Location: "/login" } });

  // Account password: every authenticated user must prove the current password.
  if (path === "/account/password" && method === "GET") {
    return html(renderAccountPassword(null, makeCtx(user, "/account/password", { passwordUpdated: url.searchParams.get("ok") === "1" })));
  }
  if (path === "/account/password" && method === "POST") {
    const formData = await request.formData();
    const current = String(formData.get("current_password") || "");
    const next = String(formData.get("new_password") || "");
    const row = await DB.prepare('SELECT * FROM "users" WHERE "id" = ?').bind(user.id).first();
    if (!row || !(await verifyPassword(current, { hash: row.password_hash, salt: row.salt, iterations: row.iterations }))) {
      return html(renderAccountPassword("Password attuale errata.", makeCtx(user, "/account/password")), 401);
    }
    if (next.length < 10) {
      return html(renderAccountPassword("La nuova password deve avere almeno 10 caratteri.", makeCtx(user, "/account/password")), 422);
    }
    await setPassword(DB, user.id, next);
    return new Response(null, { status: 303, headers: { Location: "/account/password?ok=1" } });
  }

  // User management: roles are constrained to the generated config at runtime.
  if (path === "/admin/users" && method === "GET") {
    if (!requireAdmin(user)) return new Response("Forbidden", { status: 403 });
    const { results } = await DB.prepare('SELECT "id", "email", "role", "created_at" FROM "users" ORDER BY "created_at" DESC').all();
    return html(renderUsersList(results ?? [], makeCtx(user, "/admin/users")));
  }
  if (path === "/admin/users/new" && method === "GET") {
    if (!requireAdmin(user)) return new Response("Forbidden", { status: 403 });
    return html(renderUserForm(null, makeCtx(user, "/admin/users")));
  }
  if (path === "/admin/users" && method === "POST") {
    if (!requireAdmin(user)) return new Response("Forbidden", { status: 403 });
    const formData = await request.formData();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    const role = String(formData.get("role") || "");
    if (!ROLES.includes(role)) return html(renderUserForm("Ruolo non valido.", makeCtx(user, "/admin/users")), 422);
    if (password.length < 10) return html(renderUserForm("La password deve avere almeno 10 caratteri.", makeCtx(user, "/admin/users")), 422);
    const exists = await DB.prepare('SELECT 1 FROM "users" WHERE "email" = ?').bind(email).first();
    if (exists) return html(renderUserForm("Email gi\xE0 registrata.", makeCtx(user, "/admin/users")), 422);
    const stored = await hashPassword(password);
    await DB.prepare('INSERT INTO "users" ("id", "email", "password_hash", "salt", "iterations", "version", "role") VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), email, stored.hash, stored.salt, stored.iterations, stored.version, role)
      .run();
    return new Response(null, { status: 303, headers: { Location: "/admin/users" } });
  }
  const roleMatch = path.match(/^\\/admin\\/users\\/([^/]+)\\/role$/);
  if (roleMatch && method === "POST") {
    if (!requireAdmin(user)) return new Response("Forbidden", { status: 403 });
    const formData = await request.formData();
    const role = String(formData.get("role") || "");
    if (!ROLES.includes(role)) return new Response("Bad role", { status: 422 });
    await DB.prepare('UPDATE "users" SET "role" = ? WHERE "id" = ?').bind(role, roleMatch[1]).run();
    return new Response(null, { status: 303, headers: { Location: "/admin/users" } });
  }
  const deleteUserMatch = path.match(/^\\/admin\\/users\\/([^/]+)\\/delete$/);
  if (deleteUserMatch && method === "POST") {
    if (!requireAdmin(user)) return new Response("Forbidden", { status: 403 });
    if (deleteUserMatch[1] === user.id) return new Response("Non puoi eliminare te stesso.", { status: 400 });
    await DB.prepare('DELETE FROM "users" WHERE "id" = ?').bind(deleteUserMatch[1]).run();
    return new Response(null, { status: 303, headers: { Location: "/admin/users" } });
  }

  if (path === "/" && method === "GET") {
    const counts = {};
    for (const entity of ENTITIES) counts[entity.slug] = await dbCount(DB, entity.table);
    return html(renderDashboard(counts, makeCtx(user, "/")));
  }

  for (const entity of ENTITIES) {
    const base = "/" + entity.slug;
    if (path === base && method === "GET") {
      if (!canAccess(user.role, entity.name, "read")) return new Response("Forbidden", { status: 403 });
      return html(renderList(entity, await dbList(DB, entity.table), makeCtx(user, base)));
    }
    if (path === base + "/new" && method === "GET") {
      if (!canAccess(user.role, entity.name, "create")) return new Response("Forbidden", { status: 403 });
      return html(renderForm(entity, null, null, makeCtx(user, base)));
    }
    if (path === base && method === "POST") {
      if (!canAccess(user.role, entity.name, "create")) return new Response("Forbidden", { status: 403 });
      const formData = await request.formData();
      const data = Object.fromEntries(formData.entries());
      const error = validateFormData(entity, data);
      if (error) return html(renderForm(entity, data, error, makeCtx(user, base)), 422);
      const { cols, vals } = extractFields(entity, formData);
      await dbInsert(DB, entity.table, cols, vals);
      return Response.redirect(url.origin + base, 303);
    }

    const idMatch = path.match(new RegExp("^" + base + "/([^/]+)$"));
    if (idMatch) {
      const id = idMatch[1];
      if (method === "GET") {
        if (!canAccess(user.role, entity.name, "read")) return new Response("Forbidden", { status: 403 });
        const row = await dbGet(DB, entity.table, id);
        return row ? html(renderDetail(entity, row, makeCtx(user, base))) : new Response("Not found", { status: 404 });
      }
      if (method === "POST") {
        if (!canAccess(user.role, entity.name, "update")) return new Response("Forbidden", { status: 403 });
        const formData = await request.formData();
        const data = Object.fromEntries(formData.entries());
        const error = validateFormData(entity, data);
        if (error) {
          const row = await dbGet(DB, entity.table, id);
          return html(renderForm(entity, { ...row, ...data }, error, makeCtx(user, base)), 422);
        }
        const { cols, vals } = extractFields(entity, formData);
        await dbUpdate(DB, entity.table, cols, vals, id);
        return Response.redirect(url.origin + base + "/" + id, 303);
      }
    }

    const editMatch = path.match(new RegExp("^" + base + "/([^/]+)/edit$"));
    if (editMatch && method === "GET") {
      if (!canAccess(user.role, entity.name, "read")) return new Response("Forbidden", { status: 403 });
      const row = await dbGet(DB, entity.table, editMatch[1]);
      return row ? html(renderForm(entity, row, null, makeCtx(user, base))) : new Response("Not found", { status: 404 });
    }

    const deleteMatch = path.match(new RegExp("^" + base + "/([^/]+)/delete$"));
    if (deleteMatch && method === "POST") {
      if (!canAccess(user.role, entity.name, "delete")) return new Response("Forbidden", { status: 403 });
      await dbDelete(DB, entity.table, deleteMatch[1]);
      return Response.redirect(url.origin + base, 303);
    }
  }

  return new Response("Not found", { status: 404 });
}

export default {
  async fetch(request, env) {
    try {
      return await handleRequest(request, env);
    } catch (error) {
      console.error(error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
`;

// raw-template:src/templates/shell.js
var shell_default = '// Scheletro HTML del motore. Inietta stili e chrome forniti dalle viste.\n// Include l\'inspector live usato dall\'anteprima per l\'iterazione visiva.\nexport function shell(title, bodyHtml, stylesHtml, chromeHtml) {\n  return `<!doctype html>\n<html lang="it">\n<head>\n  <meta charset="utf-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1" />\n  <title>${title}</title>\n  <style>${stylesHtml}</style>\n</head>\n<body>\n  ${chromeHtml}\n  <main>${bodyHtml}</main>\n  <script>\n  (function () {\n    var on = false, prev = null, parentOrigin = null;\n    function selectorFor(el) {\n      if (el.id) return "#" + el.id;\n      var path = [], n = el;\n      while (n && n.tagName && n !== document.body && path.length < 5) {\n        var i = 1, s = n;\n        while ((s = s.previousElementSibling)) if (s.tagName === n.tagName) i++;\n        path.unshift(n.tagName.toLowerCase() + ":nth-of-type(" + i + ")");\n        n = n.parentElement;\n      }\n      return path.join(" > ");\n    }\n    window.addEventListener("message", function (e) {\n      if (e.source !== window.parent) return;\n      var t = e.data && e.data.type;\n      if (t === "enable_inspector") { on = true; parentOrigin = e.origin; }\n      if (t === "disable_inspector") { on = false; if (prev) { prev.style.outline = ""; prev = null; } }\n    });\n    document.addEventListener("mouseover", function (e) {\n      if (!on) return;\n      if (prev) prev.style.outline = "";\n      prev = e.target; prev.style.outline = "2px solid #0f766e";\n    }, true);\n    document.addEventListener("click", function (e) {\n      if (!on || !parentOrigin) return;\n      e.preventDefault(); e.stopPropagation();\n      var el = e.target, r = el.getBoundingClientRect();\n      window.parent.postMessage({\n        type: "element_clicked",\n        selector: selectorFor(el),\n        textContent: (el.textContent || "").trim().slice(0, 120),\n        tagName: el.tagName,\n        boundingRect: { x: r.x, y: r.y, width: r.width, height: r.height },\n      }, parentOrigin);\n    }, true);\n  })();\n  </script>\n</body>\n</html>`;\n}\n';

// raw-template:src/templates/ui-kit.js
var ui_kit_default = '// Helper di contratto motore. Le viste li usano, non li modificano.\n\nexport function escHtml(s) {\n  if (s == null) return "";\n  return String(s)\n    .replace(/&/g, "&amp;")\n    .replace(/</g, "&lt;")\n    .replace(/>/g, "&gt;")\n    .replace(/"/g, "&quot;")\n    .replace(/\'/g, "&#39;");\n}\n\nexport function humanize(s) {\n  return String(s)\n    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")\n    .replace(/[-_]+/g, " ")\n    .trim()\n    .split(/\\s+/)\n    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))\n    .join(" ");\n}\n\nexport function fmtDateTime(value) {\n  if (value == null || value === "") return "";\n  const date = new Date(value);\n  if (isNaN(date.getTime())) return String(value);\n  return date.toLocaleString("it-IT", {\n    day: "2-digit", month: "2-digit", year: "numeric",\n    hour: "2-digit", minute: "2-digit",\n  });\n}\n\nexport function fmtCell(field, value) {\n  if (field.type === "boolean") {\n    return value\n      ? \'<span class="badge badge-on" title="S\xEC">\u2713</span>\'\n      : \'<span class="badge badge-off" title="No">\u2014</span>\';\n  }\n  if (field.type === "datetime") return escHtml(fmtDateTime(value));\n  if (field.type === "id") return `<span class="mono">${escHtml(value ?? "")}</span>`;\n  return escHtml(value ?? "");\n}\n\n/** Rende un input con il name corretto, vincolando il contratto con il router. */\nexport function fieldInput(field, value) {\n  const name = field.name;\n  const required = field.required ? " required" : "";\n  if (field.type === "boolean") {\n    return `<input type="checkbox" name="${name}" value="1"${value ? " checked" : ""} />`;\n  }\n  const escaped = value == null ? "" : escHtml(String(value));\n  if (field.type === "integer") return `<input type="number" name="${name}" value="${escaped}"${required} />`;\n  if (field.type === "datetime") return `<input type="datetime-local" name="${name}" value="${escaped}"${required} />`;\n  return `<input type="text" name="${name}" value="${escaped}"${required} />`;\n}\n\n/** URL del form, /slug per nuovo e /slug/:id per modifica. */\nexport function formAction(entity, row) {\n  return row && row.id ? `/${entity.slug}/${escHtml(row.id)}` : `/${entity.slug}`;\n}\n';

// raw-template:src/templates/views.js
var views_default = '// ZONA UI, \xE8 l\'unico file modificabile per cambiare presentazione e markup.\n// Non modificare index.js, lib/auth.js, lib/db.js, lib/ui-kit.js, lib/shell.js,\n// config.js o migrations. Le viste sono funzioni pure, ricevono dati e ctx,\n// restituiscono HTML. Usa sempre fieldInput() e formAction() per i form.\nimport { shell } from "./lib/shell.js";\nimport { escHtml, humanize, fmtCell, fieldInput, formAction } from "./lib/ui-kit.js";\n\nconst EMPTY_GLYPH = \'<svg class="empty-glyph" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 13l3-8h12l3 8"/><path d="M3 13v6h18v-6"/><path d="M3 13h5l2 3h4l2-3h5"/></svg>\';\n\nexport function renderStyles() {\n  return `\n    :root {\n      --accent: #0f766e; --accent-strong: #0a5d56; --accent-soft: #e3efed;\n      --bg: #f6f5f1; --surface: #ffffff; --line: #e7e4dd; --line-soft: #f0eee8;\n      --ink: #26241f; --ink-soft: #6f6a5f;\n      --danger: #a8362c; --danger-soft: #f8edec; --danger-line: #e6cdca;\n      --radius: 10px;\n    }\n    *, *::before, *::after { box-sizing: border-box; }\n    html { -webkit-text-size-adjust: 100%; }\n    body { margin: 0; background: var(--bg); color: var(--ink); font-size: 15px; line-height: 1.5;\n      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, Roboto, "Helvetica Neue", Arial, sans-serif; }\n    a { color: var(--accent); }\n    :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }\n    .topbar { background: var(--surface); border-bottom: 1px solid var(--line); }\n    .topbar-inner { max-width: 1040px; margin: 0 auto; padding: 12px 24px; display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }\n    .brand { display: inline-flex; align-items: center; gap: 10px; color: var(--ink); text-decoration: none; font-weight: 650; letter-spacing: -0.01em; }\n    .brand-mark { width: 10px; height: 10px; border-radius: 3px; background: var(--accent); flex: none; }\n    .topbar nav { display: flex; gap: 4px; flex-wrap: wrap; }\n    .topbar nav a { color: var(--ink-soft); text-decoration: none; font-size: 14px; font-weight: 500; padding: 6px 10px; border-radius: 7px; }\n    .topbar nav a:hover { color: var(--ink); background: var(--line-soft); }\n    .topbar nav a.active { color: var(--accent-strong); background: var(--accent-soft); }\n    main { max-width: 1040px; margin: 40px auto 0; padding: 0 24px; }\n    .page-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }\n    h1 { font-size: 24px; font-weight: 650; letter-spacing: -0.015em; margin: 0; }\n    .page-sub { margin: 4px 0 0; color: var(--ink-soft); font-size: 14px; }\n    .eyebrow { font-size: 11px; font-weight: 650; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-soft); }\n    .card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); box-shadow: 0 1px 2px rgba(38, 36, 31, 0.05); }\n    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 16px; border-radius: 8px; border: 1px solid transparent; font: inherit; font-size: 14px; font-weight: 600; text-decoration: none; cursor: pointer; }\n    .btn-primary { background: var(--accent); color: #fff; }\n    .btn-primary:hover { background: var(--accent-strong); }\n    .btn-ghost { background: transparent; border-color: var(--line); color: var(--ink); }\n    .btn-ghost:hover { background: var(--line-soft); }\n    .btn-danger { background: var(--surface); border-color: var(--danger-line); color: var(--danger); }\n    .btn-danger:hover { background: var(--danger-soft); }\n    .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }\n    .stat-card { padding: 20px; display: flex; flex-direction: column; }\n    .stat-value { font-size: 34px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; margin-top: 8px; }\n    .stat-sub { color: var(--ink-soft); font-size: 13px; }\n    .stat-actions { display: flex; justify-content: space-between; gap: 8px; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--line-soft); font-size: 13px; font-weight: 600; }\n    .stat-actions a { text-decoration: none; color: var(--accent-strong); }\n    .stat-actions a:hover { text-decoration: underline; }\n    .table-card { overflow-x: auto; }\n    table { width: 100%; border-collapse: collapse; font-size: 14px; }\n    th { text-align: left; font-size: 11px; font-weight: 650; text-transform: uppercase; letter-spacing: 0.07em; color: var(--ink-soft); background: #fbfaf7; padding: 10px 16px; border-bottom: 1px solid var(--line); white-space: nowrap; }\n    td { padding: 12px 16px; border-bottom: 1px solid var(--line-soft); vertical-align: middle; }\n    tbody tr:last-child td { border-bottom: none; }\n    tbody tr:hover td { background: #faf9f5; }\n    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; color: var(--ink-soft); }\n    .badge { display: inline-flex; align-items: center; justify-content: center; min-width: 26px; padding: 1px 8px; border-radius: 999px; font-size: 12px; font-weight: 700; }\n    .badge-on { background: var(--accent-soft); color: var(--accent-strong); }\n    .badge-off { background: var(--line-soft); color: var(--ink-soft); }\n    .row-link { font-weight: 600; font-size: 13px; text-decoration: none; color: var(--accent-strong); white-space: nowrap; }\n    .row-link:hover { text-decoration: underline; }\n    .empty { text-align: center; padding: 56px 24px; }\n    .empty-glyph { display: block; margin: 0 auto 12px; color: var(--ink-soft); }\n    .empty h2 { font-size: 17px; font-weight: 650; margin: 0 0 4px; }\n    .empty p { color: var(--ink-soft); font-size: 14px; margin: 0 0 20px; }\n    .form-card { max-width: 560px; padding: 24px; }\n    label { display: block; margin-bottom: 16px; }\n    label > span { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }\n    .req { color: var(--danger); font-style: normal; }\n    input[type=text], input[type=password], input[type=number], input[type=date], input[type=datetime-local], textarea, select {\n      width: 100%; padding: 9px 12px; border: 1px solid #d8d4cb; border-radius: 8px; font: inherit; font-size: 14px; background: var(--surface); color: var(--ink); }\n    input:focus, textarea:focus, select:focus { border-color: var(--accent); outline: 2px solid var(--accent-soft); outline-offset: 0; }\n    .check-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid var(--line); border-radius: 8px; cursor: pointer; }\n    .check-row span { display: inline; margin: 0; font-size: 14px; font-weight: 600; }\n    .check-row input { accent-color: var(--accent); width: 16px; height: 16px; }\n    .error { background: var(--danger-soft); border: 1px solid var(--danger-line); color: var(--danger); padding: 10px 14px; border-radius: 8px; font-size: 14px; margin-bottom: 16px; }\n    .actions { display: flex; align-items: center; gap: 8px; margin-top: 24px; flex-wrap: wrap; }\n    .page-head .actions { margin-top: 0; }\n    .inline-form { display: inline; margin: 0; }\n    .detail-card { padding: 8px 24px; max-width: 720px; }\n    .field-row { padding: 14px 0; border-bottom: 1px solid var(--line-soft); }\n    .field-row:last-child { border-bottom: none; }\n    .field-label { font-size: 11px; font-weight: 650; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-soft); }\n    .field-value { margin-top: 3px; font-size: 14px; overflow-wrap: anywhere; }\n    .back-row { margin-top: 16px; }\n    .danger-zone { margin-top: 16px; }\n    footer { max-width: 1040px; margin: 48px auto 32px; padding: 16px 24px 0; border-top: 1px solid var(--line); color: var(--ink-soft); font-size: 12.5px; }\n    footer strong { color: var(--ink); font-weight: 600; }\n    @media (max-width: 720px) { main { margin-top: 24px; } .topbar-inner { padding: 10px 16px; gap: 12px; } main, footer { padding-left: 16px; padding-right: 16px; } .page-head { flex-direction: column; align-items: flex-start; } h1 { font-size: 21px; } }\n    @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }\n  `;\n}\n\nexport function renderChrome(ctx) {\n  const items = [{ href: "/", label: "Panoramica" }, ...ctx.entities.map((entity) => ({ href: "/" + entity.slug, label: humanize(entity.name) }))];\n  const account = ctx.user\n    ? `<a href="/account/password"${ctx.activePath === "/account/password" ? \' class="active"\' : ""}>Account</a>` +\n      (ctx.isAdmin ? `<a href="/admin/users"${ctx.activePath === "/admin/users" ? \' class="active"\' : ""}>Utenti</a>` : "")\n    : "";\n  const nav = ctx.user ? items.map((item) => `<a href="${escHtml(item.href)}"${item.href === ctx.activePath ? \' class="active"\' : ""}>${escHtml(item.label)}</a>`).join("") + account : "";\n  const userBox = ctx.user ? `<form method="POST" action="/logout" class="inline-form" style="margin-left:auto"><span class="page-sub">${escHtml(ctx.user.email)}</span> <button class="btn btn-ghost" type="submit">Esci</button></form>` : "";\n  return `<header class="topbar"><div class="topbar-inner">\n    <a class="brand" href="/"><span class="brand-mark" aria-hidden="true"></span>${escHtml(ctx.appTitle)}</a>\n    <nav>${nav}</nav>${userBox}\n  </div></header><footer>Creato con <strong>TORA Build</strong></footer>`;\n}\n\nfunction page(title, body, ctx) {\n  return shell(title, body, renderStyles(), renderChrome(ctx));\n}\n\nexport function renderDashboard(counts, ctx) {\n  const cards = ctx.entities.map((entity) => {\n    const count = counts[entity.slug] ?? 0;\n    const actions = `${ctx.can(entity.name, "read") ? `<a href="/${entity.slug}">Vedi tutti</a>` : ""}${ctx.can(entity.name, "create") ? `<a href="/${entity.slug}/new">+ Nuovo</a>` : ""}`;\n    return `<div class="card stat-card"><div class="eyebrow">${escHtml(humanize(entity.name))}</div><div class="stat-value">${escHtml(String(count))}</div><div class="stat-sub">${count === 1 ? "elemento" : "elementi"}</div><div class="stat-actions">${actions}</div></div>`;\n  }).join("");\n  return page(ctx.appTitle + " \u2014 Panoramica", `<div class="page-head"><div><h1>Panoramica</h1><p class="page-sub">Benvenuto in ${escHtml(ctx.appTitle)}. Ecco lo stato dei tuoi dati.</p></div></div><div class="dashboard-grid">${cards}</div>`, ctx);\n}\n\nexport function renderList(entity, rows, ctx) {\n  const columns = [{ name: "id", type: "id" }, { name: "created_at", type: "datetime" }, ...entity.fields];\n  let content;\n  if (rows.length === 0) {\n    content = `<div class="card empty">${EMPTY_GLYPH}<h2>Nessun elemento ancora</h2><p>Quando crei un elemento lo trovi qui, pronto da consultare.</p>${ctx.can(entity.name, "create") ? `<a href="/${entity.slug}/new" class="btn btn-primary">Crea il primo</a>` : ""}</div>`;\n  } else {\n    const headings = columns.map((column) => `<th>${escHtml(humanize(column.name))}</th>`).join("");\n    const body = rows.map((row) => `<tr>${columns.map((column) => `<td>${fmtCell(column, row[column.name])}</td>`).join("")}<td><a href="/${entity.slug}/${escHtml(row.id)}" class="row-link">Apri</a></td></tr>`).join("");\n    content = `<div class="card table-card"><table><thead><tr>${headings}<th></th></tr></thead><tbody>${body}</tbody></table></div>`;\n  }\n  const create = ctx.can(entity.name, "create") ? `<a href="/${entity.slug}/new" class="btn btn-primary">+ Nuovo</a>` : "";\n  return page(humanize(entity.name) + " \u2014 " + ctx.appTitle, `<div class="page-head"><div><div class="eyebrow">Archivio</div><h1>${escHtml(humanize(entity.name))}</h1></div>${create}</div>${content}`, ctx);\n}\n\nexport function renderForm(entity, row, error, ctx) {\n  const editing = row && row.id;\n  const inputs = entity.fields.map((field) => {\n    const label = escHtml(humanize(field.name));\n    if (field.type === "boolean") return `<label class="check-row">${fieldInput(field, row ? row[field.name] : null)}<span>${label}</span></label>`;\n    return `<label><span>${label}${field.required ? \' <em class="req">*</em>\' : ""}</span>${fieldInput(field, row ? row[field.name] : null)}</label>`;\n  }).join("");\n  const message = error ? `<div class="error" role="alert">${escHtml(error)}</div>` : "";\n  const remove = editing && ctx.can(entity.name, "delete") ? `<form method="POST" action="/${entity.slug}/${escHtml(row.id)}/delete" class="danger-zone"><button type="submit" class="btn btn-danger" onclick="return confirm(\'Eliminare questo elemento?\')">Elimina</button></form>` : "";\n  return page((editing ? "Modifica " : "Nuovo ") + humanize(entity.name) + " \u2014 " + ctx.appTitle, `<div class="page-head"><div><div class="eyebrow">${escHtml(humanize(entity.name))}</div><h1>${editing ? "Modifica" : "Nuovo elemento"}</h1></div></div><form method="POST" action="${formAction(entity, row)}" class="card form-card">${message}${inputs}<div class="actions"><button type="submit" class="btn btn-primary">${editing ? "Salva modifiche" : "Crea"}</button><a href="/${entity.slug}" class="btn btn-ghost">Annulla</a></div></form>${remove}`, ctx);\n}\n\nexport function renderDetail(entity, row, ctx) {\n  const fields = [{ name: "id", type: "id" }, { name: "created_at", type: "datetime" }, ...entity.fields];\n  const rows = fields.map((field) => `<div class="field-row"><div class="field-label">${escHtml(humanize(field.name))}</div><div class="field-value">${fmtCell(field, row[field.name])}</div></div>`).join("");\n  const actions = `<div class="actions">${ctx.can(entity.name, "update") ? `<a href="/${entity.slug}/${escHtml(row.id)}/edit" class="btn btn-primary">Modifica</a>` : ""}${ctx.can(entity.name, "delete") ? `<form method="POST" action="/${entity.slug}/${escHtml(row.id)}/delete" class="inline-form"><button type="submit" class="btn btn-danger" onclick="return confirm(\'Eliminare questo elemento?\')">Elimina</button></form>` : ""}</div>`;\n  return page(humanize(entity.name) + " \u2014 " + ctx.appTitle, `<div class="page-head"><div><div class="eyebrow">${escHtml(humanize(entity.name))}</div><h1>Dettaglio</h1></div>${actions}</div><div class="card detail-card">${rows}</div><div class="actions back-row"><a href="/${entity.slug}" class="btn btn-ghost">Torna alla lista</a></div>`, ctx);\n}\n\nexport function renderLogin(error, ctx) {\n  const message = error ? `<div class="error" role="alert">${escHtml(error)}</div>` : "";\n  return page("Accedi \u2014 " + ctx.appTitle, `<div class="page-head"><div><h1>Accedi</h1></div></div><form method="POST" action="/login" class="card form-card">${message}<label><span>Email</span><input type="text" name="email" required /></label><label><span>Password</span><input type="password" name="password" required /></label><div class="actions"><button class="btn btn-primary" type="submit">Entra</button><a class="btn btn-ghost" href="/signup">Registrati</a></div></form>`, ctx);\n}\n\nexport function renderAccountPassword(error, ctx) {\n  const message = error ? `<div class="error" role="alert">${escHtml(error)}</div>` : "";\n  const success = ctx.passwordUpdated ? `<div class="card" role="status" style="padding:10px 14px;margin-bottom:16px">Password aggiornata.</div>` : "";\n  return page("Cambia password \u2014 " + ctx.appTitle, `<div class="page-head"><div><h1>Cambia password</h1></div></div><form method="POST" action="/account/password" class="card form-card">${success}${message}<label><span>Password attuale</span><input type="password" name="current_password" required /></label><label><span>Nuova password (min 10)</span><input type="password" name="new_password" required minlength="10" /></label><div class="actions"><button class="btn btn-primary" type="submit">Aggiorna</button></div></form>`, ctx);\n}\n\nexport function renderUsersList(users, ctx) {\n  const rows = users.map((user) => {\n    const roleOptions = ctx.roles.map((role) => `<option value="${escHtml(role)}"${role === user.role ? " selected" : ""}>${escHtml(role)}</option>`).join("");\n    const remove = user.id === ctx.user.id\n      ? `<span class="page-sub">Account corrente</span>`\n      : `<form method="POST" action="/admin/users/${escHtml(user.id)}/delete" class="inline-form"><button type="submit" class="btn btn-danger" onclick="return confirm(\'Eliminare questo utente?\')">Elimina</button></form>`;\n    return `<tr><td>${escHtml(user.email)}</td><td><form method="POST" action="/admin/users/${escHtml(user.id)}/role" class="inline-form"><select name="role" onchange="this.form.submit()">${roleOptions}</select></form></td><td>${remove}</td></tr>`;\n  }).join("");\n  return page("Utenti \u2014 " + ctx.appTitle, `<div class="page-head"><div><div class="eyebrow">Amministrazione</div><h1>Utenti</h1></div><a href="/admin/users/new" class="btn btn-primary">+ Nuovo utente</a></div><div class="card table-card"><table><thead><tr><th>Email</th><th>Ruolo</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`, ctx);\n}\n\nexport function renderUserForm(error, ctx) {\n  const message = error ? `<div class="error" role="alert">${escHtml(error)}</div>` : "";\n  const roleOptions = ctx.roles.map((role) => `<option value="${escHtml(role)}">${escHtml(role)}</option>`).join("");\n  return page("Nuovo utente \u2014 " + ctx.appTitle, `<div class="page-head"><div><div class="eyebrow">Amministrazione</div><h1>Nuovo utente</h1></div></div><form method="POST" action="/admin/users" class="card form-card">${message}<label><span>Email</span><input type="text" name="email" required /></label><label><span>Password temporanea (min 10)</span><input type="password" name="password" required minlength="10" /></label><label><span>Ruolo</span><select name="role">${roleOptions}</select></label><div class="actions"><button class="btn btn-primary" type="submit">Crea utente</button><a href="/admin/users" class="btn btn-ghost">Annulla</a></div></form>`, ctx);\n}\n\nexport function renderSignup(error, ctx) {\n  const message = error ? `<div class="error" role="alert">${escHtml(error)}</div>` : "";\n  return page("Registrati \u2014 " + ctx.appTitle, `<div class="page-head"><div><h1>Registrati</h1></div></div><form method="POST" action="/signup" class="card form-card">${message}<label><span>Email</span><input type="text" name="email" required /></label><label><span>Password (min 10)</span><input type="password" name="password" required minlength="10" /></label><div class="actions"><button class="btn btn-primary" type="submit">Crea account</button><a class="btn btn-ghost" href="/login">Ho gi\xE0 un account</a></div></form>`, ctx);\n}\n';

// src/generate.ts
var SAFE_IDENT = /^[A-Za-z][A-Za-z0-9_]{0,63}$/;
var SAFE_SLUG = /^[a-z][a-z0-9-]{0,63}$/;
var RESERVED_FIELD_NAMES = /* @__PURE__ */ new Set(["id", "created_at"]);
function assertSafe(label, value, pattern) {
  if (typeof value !== "string" || !pattern.test(value)) {
    throw new Error(`invalid ${label}: must match ${pattern}`);
  }
}
function kebab(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}
function qid(name) {
  return '"' + name.replace(/"/g, '""') + '"';
}
function sqlType(field) {
  switch (field.type) {
    case "integer":
      return "INTEGER";
    case "boolean":
      return "INTEGER";
    case "datetime":
    case "reference":
    default:
      return "TEXT";
  }
}
function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function buildMigration(spec) {
  const authTables = `CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "password_hash" TEXT NOT NULL,
  "salt" TEXT NOT NULL,
  "iterations" INTEGER NOT NULL,
  "version" INTEGER NOT NULL,
  "role" TEXT NOT NULL,
  "created_at" TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS "sessions" (
  "token_hash" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "expires_at" INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_sessions_user" ON "sessions" ("user_id");`;
  const tables = spec.entities.map((entity) => {
    const columns = [
      `  ${qid("id")} TEXT PRIMARY KEY`,
      `  ${qid("created_at")} TEXT NOT NULL DEFAULT (datetime('now'))`,
      ...entity.fields.map((field) => `  ${qid(field.name)} ${sqlType(field)}${field.required ? " NOT NULL" : ""}`)
    ];
    return `CREATE TABLE IF NOT EXISTS ${qid(entity.name)} (
${columns.join(",\n")}
);`;
  });
  return authTables + "\n\n" + tables.join("\n\n") + "\n";
}
function buildConfigJs(spec) {
  const entityConfigs = spec.entities.map((entity) => {
    const fields = entity.fields.map((field) => `    { name: ${JSON.stringify(field.name)}, type: ${JSON.stringify(field.type)}, required: ${field.required ? "true" : "false"} }`);
    return `  {
    name: ${JSON.stringify(entity.name)},
    slug: ${JSON.stringify(kebab(entity.name))},
    table: ${JSON.stringify(entity.name)},
    fields: [
${fields.join(",\n")}
    ]
  }`;
  });
  const roles = spec.roles.map((role) => role.name);
  const permissions = Object.fromEntries(spec.roles.map((role) => [role.name, role.permissions]));
  return `// Generated from spec "${spec.name}" \u2014 DO NOT EDIT.
export const APP_NAME = ${JSON.stringify(spec.name)};
export const APP_DESCRIPTION = ${JSON.stringify(spec.description)};
export const ENTITIES = [
${entityConfigs.join(",\n")}
];
export const ROLES = ${JSON.stringify(roles)};
export const PERMISSIONS = ${JSON.stringify(permissions)};
export const ADMIN_ROLE = ${JSON.stringify(adminRole(spec).name)};
export const DEFAULT_ROLE = ${JSON.stringify(defaultRole(spec).name)};
`;
}
function buildAuthJs() {
  return auth_default;
}
function buildUiKitJs() {
  return ui_kit_default;
}
function buildShellJs() {
  return shell_default;
}
function buildViewsJs() {
  return views_default;
}
function buildIndexJs() {
  return templates_default;
}
function buildDbJs() {
  return `// Generic D1 CRUD helpers \u2014 no build step required.
function qid(name) { return '"' + String(name).replace(/"/g, '""') + '"'; }
export async function dbList(DB, table) { const { results } = await DB.prepare(\`SELECT * FROM \${qid(table)} ORDER BY \${qid("created_at")} DESC\`).all(); return results ?? []; }
export async function dbGet(DB, table, id) { return await DB.prepare(\`SELECT * FROM \${qid(table)} WHERE id = ?\`).bind(id).first(); }
export async function dbCount(DB, table) { const row = await DB.prepare(\`SELECT COUNT(*) AS n FROM \${qid(table)}\`).first(); return row ? Number(row.n) : 0; }
export async function dbInsert(DB, table, columns, values) { const quotedCols = columns.map(qid).join(", "); const placeholders = columns.map(() => "?").join(", "); await DB.prepare(\`INSERT INTO \${qid(table)} (\${qid("id")}, \${quotedCols}) VALUES (?, \${placeholders})\`).bind(crypto.randomUUID(), ...values).run(); }
export async function dbUpdate(DB, table, columns, values, id) { const sets = columns.map(column => \`\${qid(column)} = ?\`).join(", "); await DB.prepare(\`UPDATE \${qid(table)} SET \${sets} WHERE id = ?\`).bind(...values, id).run(); }
export async function dbDelete(DB, table, id) { await DB.prepare(\`DELETE FROM \${qid(table)} WHERE id = ?\`).bind(id).run(); }
`;
}
function buildWranglerToml(spec) {
  return [
    `name = "${spec.name}-app"`,
    `main = "src/index.js"`,
    `compatibility_date = "2026-05-26"`,
    "",
    "[[d1_databases]]",
    `binding = "DB"`,
    `database_name = "${spec.name}-db"`,
    `database_id = "REPLACE_WITH_YOUR_D1_ID"`,
    "",
    "[vars]",
    "# Solo preview locale: aggira il login. RIMOSSO/verificato al deploy.",
    'DEV_AUTH_BYPASS = "1"',
    ""
  ].join("\n");
}
function buildReadme(spec) {
  return [
    `# ${escapeHtml(spec.name)}`,
    "",
    spec.description,
    "",
    "## Deploy (3 commands)",
    "",
    "```bash",
    "# 1. Create the D1 database and note the database_id in the output",
    `wrangler d1 create ${spec.name}-db`,
    "",
    "# 2. Update wrangler.toml: replace REPLACE_WITH_YOUR_D1_ID with the id from step 1",
    "",
    "# 3. Apply the schema migration",
    `wrangler d1 execute ${spec.name}-db --file=migrations/0000_init.sql`,
    "",
    "# 4. Deploy",
    "wrangler deploy",
    "```",
    "",
    "## Entities",
    "",
    ...spec.entities.map((entity) => `- **${escapeHtml(entity.name)}**: ${entity.fields.map((field) => `${escapeHtml(field.name)} (${escapeHtml(field.type)})`).join(", ")}`),
    ""
  ].join("\n");
}
function buildProjectFiles(spec) {
  assertSafe("spec.name", spec.name, SAFE_SLUG);
  for (const entity of spec.entities) {
    assertSafe("entity.name", entity.name, SAFE_IDENT);
    for (const field of entity.fields) {
      assertSafe("entity.field.name", field.name, SAFE_IDENT);
      if (RESERVED_FIELD_NAMES.has(field.name)) {
        throw new Error(`reserved field name "${field.name}" on entity "${entity.name}": this column is auto-generated, pick a different name`);
      }
    }
  }
  return {
    "README.md": buildReadme(spec),
    "wrangler.toml": buildWranglerToml(spec),
    "migrations/0000_init.sql": buildMigration(spec),
    "src/index.js": buildIndexJs(),
    "src/lib/auth.js": buildAuthJs(),
    "src/lib/db.js": buildDbJs(),
    "src/lib/ui-kit.js": buildUiKitJs(),
    "src/lib/shell.js": buildShellJs(),
    "src/views.js": buildViewsJs(),
    "src/config.js": buildConfigJs(spec)
  };
}

// src/integrity.ts
var MOTORE_FILES = [
  "src/index.js",
  "src/lib/auth.js",
  "src/lib/db.js",
  "src/lib/ui-kit.js",
  "src/lib/shell.js",
  "src/config.js",
  "migrations/0000_init.sql"
];
function sha256(content) {
  return createHash("sha256").update(content, "utf8").digest("hex");
}
function listSrcFiles(projectDir) {
  const root = join(projectDir, "src");
  const files = [];
  const walk = (directory) => {
    for (const name of readdirSync(directory)) {
      const absolutePath = join(directory, name);
      if (statSync(absolutePath).isDirectory()) walk(absolutePath);
      else files.push(absolutePath);
    }
  };
  try {
    walk(root);
  } catch {
  }
  return files;
}
function checkIntegrity(spec, projectDir) {
  const expected = buildProjectFiles(spec);
  const mismatches = [];
  for (const relativePath of MOTORE_FILES) {
    let actual;
    try {
      actual = readFileSync(join(projectDir, relativePath.split("/").join(sep)), "utf8");
    } catch {
      mismatches.push(relativePath);
      continue;
    }
    if (sha256(actual) !== sha256(expected[relativePath] ?? "")) {
      mismatches.push(relativePath);
    }
  }
  const bypassFound = [];
  for (const absolutePath of listSrcFiles(projectDir)) {
    const content = readFileSync(absolutePath, "utf8");
    if (/DEV_AUTH_BYPASS\s*=\s*["']1["']/.test(content)) {
      bypassFound.push(relative(projectDir, absolutePath));
    }
  }
  return { ok: mismatches.length === 0, mismatches, bypassFound };
}

// src/cli-integrity.ts
function runIntegrityCli(argv) {
  const [specPath, projectDir] = argv;
  if (!specPath || !projectDir) {
    process.stderr.write("Usage: tora-integrity <spec.json> <project-dir>\n");
    return { ok: false, mismatches: ["__usage__"], bypassFound: [] };
  }
  const spec = JSON.parse(readFileSync2(specPath, "utf8"));
  return checkIntegrity(spec, projectDir);
}
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("tora-integrity.mjs")) {
  const result = runIntegrityCli(process.argv.slice(2));
  process.stdout.write(JSON.stringify(result) + "\n");
  process.exit(result.ok && result.bypassFound.length === 0 ? 0 : 1);
}
export {
  runIntegrityCli
};
