import { C as __commonJSMin, D as __toESM, E as __toCommonJS, T as __exportAll, t as require_jsx_runtime, w as __esmMin, y as require_react } from "../index.js";
import "node:crypto";
//#region node_modules/zod/v4/core/core.js
var _a$2;
function $constructor(name, initializer, params) {
	function init(inst, def) {
		if (!inst._zod) Object.defineProperty(inst, "_zod", {
			value: {
				def,
				constr: _,
				traits: /* @__PURE__ */ new Set()
			},
			enumerable: false
		});
		if (inst._zod.traits.has(name)) return;
		inst._zod.traits.add(name);
		initializer(inst, def);
		const proto = _.prototype;
		const keys = Object.keys(proto);
		for (let i = 0; i < keys.length; i++) {
			const k = keys[i];
			if (!(k in inst)) inst[k] = proto[k].bind(inst);
		}
	}
	const Parent = params?.Parent ?? Object;
	class Definition extends Parent {}
	Object.defineProperty(Definition, "name", { value: name });
	function _(def) {
		var _a;
		const inst = params?.Parent ? new Definition() : this;
		init(inst, def);
		(_a = inst._zod).deferred ?? (_a.deferred = []);
		for (const fn of inst._zod.deferred) fn();
		return inst;
	}
	Object.defineProperty(_, "init", { value: init });
	Object.defineProperty(_, Symbol.hasInstance, { value: (inst) => {
		if (params?.Parent && inst instanceof params.Parent) return true;
		return inst?._zod?.traits?.has(name);
	} });
	Object.defineProperty(_, "name", { value: name });
	return _;
}
var $ZodAsyncError = class extends Error {
	constructor() {
		super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
	}
};
var $ZodEncodeError = class extends Error {
	constructor(name) {
		super(`Encountered unidirectional transform during encode: ${name}`);
		this.name = "ZodEncodeError";
	}
};
(_a$2 = globalThis).__zod_globalConfig ?? (_a$2.__zod_globalConfig = {});
var globalConfig = globalThis.__zod_globalConfig;
function config(newConfig) {
	if (newConfig) Object.assign(globalConfig, newConfig);
	return globalConfig;
}
//#endregion
//#region node_modules/zod/v4/core/util.js
function getEnumValues(entries) {
	const numericValues = Object.values(entries).filter((v) => typeof v === "number");
	return Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
}
function jsonStringifyReplacer(_, value) {
	if (typeof value === "bigint") return value.toString();
	return value;
}
function cached(getter) {
	return { get value() {
		{
			const value = getter();
			Object.defineProperty(this, "value", { value });
			return value;
		}
		throw new Error("cached value already set");
	} };
}
function nullish(input) {
	return input === null || input === void 0;
}
function cleanRegex(source) {
	const start = source.startsWith("^") ? 1 : 0;
	const end = source.endsWith("$") ? source.length - 1 : source.length;
	return source.slice(start, end);
}
function floatSafeRemainder(val, step) {
	const ratio = val / step;
	const roundedRatio = Math.round(ratio);
	const tolerance = Number.EPSILON * Math.max(Math.abs(ratio), 1);
	if (Math.abs(ratio - roundedRatio) < tolerance) return 0;
	return ratio - roundedRatio;
}
var EVALUATING = /* @__PURE__ */ Symbol("evaluating");
function defineLazy(object, key, getter) {
	let value = void 0;
	Object.defineProperty(object, key, {
		get() {
			if (value === EVALUATING) return;
			if (value === void 0) {
				value = EVALUATING;
				value = getter();
			}
			return value;
		},
		set(v) {
			Object.defineProperty(object, key, { value: v });
		},
		configurable: true
	});
}
function assignProp(target, prop, value) {
	Object.defineProperty(target, prop, {
		value,
		writable: true,
		enumerable: true,
		configurable: true
	});
}
function mergeDefs(...defs) {
	const mergedDescriptors = {};
	for (const def of defs) Object.assign(mergedDescriptors, Object.getOwnPropertyDescriptors(def));
	return Object.defineProperties({}, mergedDescriptors);
}
function esc(str) {
	return JSON.stringify(str);
}
function slugify(input) {
	return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
function isObject(data) {
	return typeof data === "object" && data !== null && !Array.isArray(data);
}
var allowsEval = /* @__PURE__ */ cached(() => {
	if (globalConfig.jitless) return false;
	if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) return false;
	try {
		new Function("");
		return true;
	} catch (_) {
		return false;
	}
});
function isPlainObject(o) {
	if (isObject(o) === false) return false;
	const ctor = o.constructor;
	if (ctor === void 0) return true;
	if (typeof ctor !== "function") return true;
	const prot = ctor.prototype;
	if (isObject(prot) === false) return false;
	if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) return false;
	return true;
}
function shallowClone(o) {
	if (isPlainObject(o)) return { ...o };
	if (Array.isArray(o)) return [...o];
	if (o instanceof Map) return new Map(o);
	if (o instanceof Set) return new Set(o);
	return o;
}
var propertyKeyTypes = /* @__PURE__ */ new Set([
	"string",
	"number",
	"symbol"
]);
function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(inst, def, params) {
	const cl = new inst._zod.constr(def ?? inst._zod.def);
	if (!def || params?.parent) cl._zod.parent = inst;
	return cl;
}
function normalizeParams(_params) {
	const params = _params;
	if (!params) return {};
	if (typeof params === "string") return { error: () => params };
	if (params?.message !== void 0) {
		if (params?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
		params.error = params.message;
	}
	delete params.message;
	if (typeof params.error === "string") return {
		...params,
		error: () => params.error
	};
	return params;
}
function optionalKeys(shape) {
	return Object.keys(shape).filter((k) => {
		return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
	});
}
var NUMBER_FORMAT_RANGES = {
	safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
	int32: [-2147483648, 2147483647],
	uint32: [0, 4294967295],
	float32: [-34028234663852886e22, 34028234663852886e22],
	float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function pick(schema, mask) {
	const currDef = schema._zod.def;
	const checks = currDef.checks;
	if (checks && checks.length > 0) throw new Error(".pick() cannot be used on object schemas containing refinements");
	return clone(schema, mergeDefs(schema._zod.def, {
		get shape() {
			const newShape = {};
			for (const key in mask) {
				if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
				if (!mask[key]) continue;
				newShape[key] = currDef.shape[key];
			}
			assignProp(this, "shape", newShape);
			return newShape;
		},
		checks: []
	}));
}
function omit(schema, mask) {
	const currDef = schema._zod.def;
	const checks = currDef.checks;
	if (checks && checks.length > 0) throw new Error(".omit() cannot be used on object schemas containing refinements");
	return clone(schema, mergeDefs(schema._zod.def, {
		get shape() {
			const newShape = { ...schema._zod.def.shape };
			for (const key in mask) {
				if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
				if (!mask[key]) continue;
				delete newShape[key];
			}
			assignProp(this, "shape", newShape);
			return newShape;
		},
		checks: []
	}));
}
function extend(schema, shape) {
	if (!isPlainObject(shape)) throw new Error("Invalid input to extend: expected a plain object");
	const checks = schema._zod.def.checks;
	if (checks && checks.length > 0) {
		const existingShape = schema._zod.def.shape;
		for (const key in shape) if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
	}
	return clone(schema, mergeDefs(schema._zod.def, { get shape() {
		const _shape = {
			...schema._zod.def.shape,
			...shape
		};
		assignProp(this, "shape", _shape);
		return _shape;
	} }));
}
function safeExtend(schema, shape) {
	if (!isPlainObject(shape)) throw new Error("Invalid input to safeExtend: expected a plain object");
	return clone(schema, mergeDefs(schema._zod.def, { get shape() {
		const _shape = {
			...schema._zod.def.shape,
			...shape
		};
		assignProp(this, "shape", _shape);
		return _shape;
	} }));
}
function merge(a, b) {
	if (a._zod.def.checks?.length) throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
	return clone(a, mergeDefs(a._zod.def, {
		get shape() {
			const _shape = {
				...a._zod.def.shape,
				...b._zod.def.shape
			};
			assignProp(this, "shape", _shape);
			return _shape;
		},
		get catchall() {
			return b._zod.def.catchall;
		},
		checks: b._zod.def.checks ?? []
	}));
}
function partial(Class, schema, mask) {
	const checks = schema._zod.def.checks;
	if (checks && checks.length > 0) throw new Error(".partial() cannot be used on object schemas containing refinements");
	return clone(schema, mergeDefs(schema._zod.def, {
		get shape() {
			const oldShape = schema._zod.def.shape;
			const shape = { ...oldShape };
			if (mask) for (const key in mask) {
				if (!(key in oldShape)) throw new Error(`Unrecognized key: "${key}"`);
				if (!mask[key]) continue;
				shape[key] = Class ? new Class({
					type: "optional",
					innerType: oldShape[key]
				}) : oldShape[key];
			}
			else for (const key in oldShape) shape[key] = Class ? new Class({
				type: "optional",
				innerType: oldShape[key]
			}) : oldShape[key];
			assignProp(this, "shape", shape);
			return shape;
		},
		checks: []
	}));
}
function required(Class, schema, mask) {
	return clone(schema, mergeDefs(schema._zod.def, { get shape() {
		const oldShape = schema._zod.def.shape;
		const shape = { ...oldShape };
		if (mask) for (const key in mask) {
			if (!(key in shape)) throw new Error(`Unrecognized key: "${key}"`);
			if (!mask[key]) continue;
			shape[key] = new Class({
				type: "nonoptional",
				innerType: oldShape[key]
			});
		}
		else for (const key in oldShape) shape[key] = new Class({
			type: "nonoptional",
			innerType: oldShape[key]
		});
		assignProp(this, "shape", shape);
		return shape;
	} }));
}
function aborted(x, startIndex = 0) {
	if (x.aborted === true) return true;
	for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue !== true) return true;
	return false;
}
function explicitlyAborted(x, startIndex = 0) {
	if (x.aborted === true) return true;
	for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue === false) return true;
	return false;
}
function prefixIssues(path, issues) {
	return issues.map((iss) => {
		var _a;
		(_a = iss).path ?? (_a.path = []);
		iss.path.unshift(path);
		return iss;
	});
}
function unwrapMessage(message) {
	return typeof message === "string" ? message : message?.message;
}
function finalizeIssue(iss, ctx, config) {
	const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
	const { inst: _inst, continue: _continue, input: _input, ...rest } = iss;
	rest.path ?? (rest.path = []);
	rest.message = message;
	if (ctx?.reportInput) rest.input = _input;
	return rest;
}
function getLengthableOrigin(input) {
	if (Array.isArray(input)) return "array";
	if (typeof input === "string") return "string";
	return "unknown";
}
function issue(...args) {
	const [iss, input, inst] = args;
	if (typeof iss === "string") return {
		message: iss,
		code: "custom",
		input,
		inst
	};
	return { ...iss };
}
//#endregion
//#region node_modules/zod/v4/core/errors.js
var initializer$1 = (inst, def) => {
	inst.name = "$ZodError";
	Object.defineProperty(inst, "_zod", {
		value: inst._zod,
		enumerable: false
	});
	Object.defineProperty(inst, "issues", {
		value: def,
		enumerable: false
	});
	inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
	Object.defineProperty(inst, "toString", {
		value: () => inst.message,
		enumerable: false
	});
};
var $ZodError = $constructor("$ZodError", initializer$1);
var $ZodRealError = $constructor("$ZodError", initializer$1, { Parent: Error });
function flattenError(error, mapper = (issue) => issue.message) {
	const fieldErrors = {};
	const formErrors = [];
	for (const sub of error.issues) if (sub.path.length > 0) {
		fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
		fieldErrors[sub.path[0]].push(mapper(sub));
	} else formErrors.push(mapper(sub));
	return {
		formErrors,
		fieldErrors
	};
}
function formatError(error, mapper = (issue) => issue.message) {
	const fieldErrors = { _errors: [] };
	const processError = (error, path = []) => {
		for (const issue of error.issues) if (issue.code === "invalid_union" && issue.errors.length) issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
		else if (issue.code === "invalid_key") processError({ issues: issue.issues }, [...path, ...issue.path]);
		else if (issue.code === "invalid_element") processError({ issues: issue.issues }, [...path, ...issue.path]);
		else {
			const fullpath = [...path, ...issue.path];
			if (fullpath.length === 0) fieldErrors._errors.push(mapper(issue));
			else {
				let curr = fieldErrors;
				let i = 0;
				while (i < fullpath.length) {
					const el = fullpath[i];
					if (!(i === fullpath.length - 1)) curr[el] = curr[el] || { _errors: [] };
					else {
						curr[el] = curr[el] || { _errors: [] };
						curr[el]._errors.push(mapper(issue));
					}
					curr = curr[el];
					i++;
				}
			}
		}
	};
	processError(error);
	return fieldErrors;
}
//#endregion
//#region node_modules/zod/v4/core/parse.js
var _parse = (_Err) => (schema, value, _ctx, _params) => {
	const ctx = _ctx ? {
		..._ctx,
		async: false
	} : { async: false };
	const result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) throw new $ZodAsyncError();
	if (result.issues.length) {
		const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
		captureStackTrace(e, _params?.callee);
		throw e;
	}
	return result.value;
};
var _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
	const ctx = _ctx ? {
		..._ctx,
		async: true
	} : { async: true };
	let result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) result = await result;
	if (result.issues.length) {
		const e = new (params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
		captureStackTrace(e, params?.callee);
		throw e;
	}
	return result.value;
};
var _safeParse = (_Err) => (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		async: false
	} : { async: false };
	const result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) throw new $ZodAsyncError();
	return result.issues.length ? {
		success: false,
		error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
	} : {
		success: true,
		data: result.value
	};
};
var safeParse$1 = /* @__PURE__ */ _safeParse($ZodRealError);
var _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		async: true
	} : { async: true };
	let result = schema._zod.run({
		value,
		issues: []
	}, ctx);
	if (result instanceof Promise) result = await result;
	return result.issues.length ? {
		success: false,
		error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
	} : {
		success: true,
		data: result.value
	};
};
var safeParseAsync$1 = /* @__PURE__ */ _safeParseAsync($ZodRealError);
var _encode = (_Err) => (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		direction: "backward"
	} : { direction: "backward" };
	return _parse(_Err)(schema, value, ctx);
};
var _decode = (_Err) => (schema, value, _ctx) => {
	return _parse(_Err)(schema, value, _ctx);
};
var _encodeAsync = (_Err) => async (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		direction: "backward"
	} : { direction: "backward" };
	return _parseAsync(_Err)(schema, value, ctx);
};
var _decodeAsync = (_Err) => async (schema, value, _ctx) => {
	return _parseAsync(_Err)(schema, value, _ctx);
};
var _safeEncode = (_Err) => (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		direction: "backward"
	} : { direction: "backward" };
	return _safeParse(_Err)(schema, value, ctx);
};
var _safeDecode = (_Err) => (schema, value, _ctx) => {
	return _safeParse(_Err)(schema, value, _ctx);
};
var _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
	const ctx = _ctx ? {
		..._ctx,
		direction: "backward"
	} : { direction: "backward" };
	return _safeParseAsync(_Err)(schema, value, ctx);
};
var _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
	return _safeParseAsync(_Err)(schema, value, _ctx);
};
//#endregion
//#region node_modules/zod/v4/core/regexes.js
/**
* @deprecated CUID v1 is deprecated by its authors due to information leakage
* (timestamps embedded in the id). Use {@link cuid2} instead.
* See https://github.com/paralleldrive/cuid.
*/
var cuid = /^[cC][0-9a-z]{6,}$/;
var cuid2 = /^[0-9a-z]+$/;
var ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
var xid = /^[0-9a-vA-V]{20}$/;
var ksuid = /^[A-Za-z0-9]{27}$/;
var nanoid = /^[a-zA-Z0-9_-]{21}$/;
/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
var duration$1 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
var guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
/** Returns a regex for validating an RFC 9562/4122 UUID.
*
* @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
var uuid = (version) => {
	if (!version) return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
	return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
};
/** Practical email validation */
var email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
var _emoji$1 = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
function emoji() {
	return new RegExp(_emoji$1, "u");
}
var ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
var cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
var cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64$1 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
var base64url$1 = /^[A-Za-z0-9_-]*$/;
var httpProtocol = /^https?$/;
var e164 = /^\+[1-9]\d{6,14}$/;
var dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
var date$1 = /* @__PURE__ */ new RegExp(`^${dateSource}$`);
function timeSource(args) {
	const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
	return typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function time$1(args) {
	return new RegExp(`^${timeSource(args)}$`);
}
function datetime$1(args) {
	const time = timeSource({ precision: args.precision });
	const opts = ["Z"];
	if (args.local) opts.push("");
	if (args.offset) opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
	const timeRegex = `${time}(?:${opts.join("|")})`;
	return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}
var string$1 = (params) => {
	const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
	return new RegExp(`^${regex}$`);
};
var integer = /^-?\d+$/;
var number$1 = /^-?\d+(?:\.\d+)?$/;
var lowercase = /^[^A-Z]*$/;
var uppercase = /^[^a-z]*$/;
//#endregion
//#region node_modules/zod/v4/core/checks.js
var $ZodCheck = /* @__PURE__ */ $constructor("$ZodCheck", (inst, def) => {
	var _a;
	inst._zod ?? (inst._zod = {});
	inst._zod.def = def;
	(_a = inst._zod).onattach ?? (_a.onattach = []);
});
var numericOriginMap = {
	number: "number",
	bigint: "bigint",
	object: "date"
};
var $ZodCheckLessThan = /* @__PURE__ */ $constructor("$ZodCheckLessThan", (inst, def) => {
	$ZodCheck.init(inst, def);
	const origin = numericOriginMap[typeof def.value];
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
		if (def.value < curr) if (def.inclusive) bag.maximum = def.value;
		else bag.exclusiveMaximum = def.value;
	});
	inst._zod.check = (payload) => {
		if (def.inclusive ? payload.value <= def.value : payload.value < def.value) return;
		payload.issues.push({
			origin,
			code: "too_big",
			maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
			input: payload.value,
			inclusive: def.inclusive,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckGreaterThan = /* @__PURE__ */ $constructor("$ZodCheckGreaterThan", (inst, def) => {
	$ZodCheck.init(inst, def);
	const origin = numericOriginMap[typeof def.value];
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
		if (def.value > curr) if (def.inclusive) bag.minimum = def.value;
		else bag.exclusiveMinimum = def.value;
	});
	inst._zod.check = (payload) => {
		if (def.inclusive ? payload.value >= def.value : payload.value > def.value) return;
		payload.issues.push({
			origin,
			code: "too_small",
			minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
			input: payload.value,
			inclusive: def.inclusive,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckMultipleOf = /* @__PURE__ */ $constructor("$ZodCheckMultipleOf", (inst, def) => {
	$ZodCheck.init(inst, def);
	inst._zod.onattach.push((inst) => {
		var _a;
		(_a = inst._zod.bag).multipleOf ?? (_a.multipleOf = def.value);
	});
	inst._zod.check = (payload) => {
		if (typeof payload.value !== typeof def.value) throw new Error("Cannot mix number and bigint in multiple_of check.");
		if (typeof payload.value === "bigint" ? payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0) return;
		payload.issues.push({
			origin: typeof payload.value,
			code: "not_multiple_of",
			divisor: def.value,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckNumberFormat = /* @__PURE__ */ $constructor("$ZodCheckNumberFormat", (inst, def) => {
	$ZodCheck.init(inst, def);
	def.format = def.format || "float64";
	const isInt = def.format?.includes("int");
	const origin = isInt ? "int" : "number";
	const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		bag.format = def.format;
		bag.minimum = minimum;
		bag.maximum = maximum;
		if (isInt) bag.pattern = integer;
	});
	inst._zod.check = (payload) => {
		const input = payload.value;
		if (isInt) {
			if (!Number.isInteger(input)) {
				payload.issues.push({
					expected: origin,
					format: def.format,
					code: "invalid_type",
					continue: false,
					input,
					inst
				});
				return;
			}
			if (!Number.isSafeInteger(input)) {
				if (input > 0) payload.issues.push({
					input,
					code: "too_big",
					maximum: Number.MAX_SAFE_INTEGER,
					note: "Integers must be within the safe integer range.",
					inst,
					origin,
					inclusive: true,
					continue: !def.abort
				});
				else payload.issues.push({
					input,
					code: "too_small",
					minimum: Number.MIN_SAFE_INTEGER,
					note: "Integers must be within the safe integer range.",
					inst,
					origin,
					inclusive: true,
					continue: !def.abort
				});
				return;
			}
		}
		if (input < minimum) payload.issues.push({
			origin: "number",
			input,
			code: "too_small",
			minimum,
			inclusive: true,
			inst,
			continue: !def.abort
		});
		if (input > maximum) payload.issues.push({
			origin: "number",
			input,
			code: "too_big",
			maximum,
			inclusive: true,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckMaxLength = /* @__PURE__ */ $constructor("$ZodCheckMaxLength", (inst, def) => {
	var _a;
	$ZodCheck.init(inst, def);
	(_a = inst._zod.def).when ?? (_a.when = (payload) => {
		const val = payload.value;
		return !nullish(val) && val.length !== void 0;
	});
	inst._zod.onattach.push((inst) => {
		const curr = inst._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
		if (def.maximum < curr) inst._zod.bag.maximum = def.maximum;
	});
	inst._zod.check = (payload) => {
		const input = payload.value;
		if (input.length <= def.maximum) return;
		const origin = getLengthableOrigin(input);
		payload.issues.push({
			origin,
			code: "too_big",
			maximum: def.maximum,
			inclusive: true,
			input,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckMinLength = /* @__PURE__ */ $constructor("$ZodCheckMinLength", (inst, def) => {
	var _a;
	$ZodCheck.init(inst, def);
	(_a = inst._zod.def).when ?? (_a.when = (payload) => {
		const val = payload.value;
		return !nullish(val) && val.length !== void 0;
	});
	inst._zod.onattach.push((inst) => {
		const curr = inst._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
		if (def.minimum > curr) inst._zod.bag.minimum = def.minimum;
	});
	inst._zod.check = (payload) => {
		const input = payload.value;
		if (input.length >= def.minimum) return;
		const origin = getLengthableOrigin(input);
		payload.issues.push({
			origin,
			code: "too_small",
			minimum: def.minimum,
			inclusive: true,
			input,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckLengthEquals = /* @__PURE__ */ $constructor("$ZodCheckLengthEquals", (inst, def) => {
	var _a;
	$ZodCheck.init(inst, def);
	(_a = inst._zod.def).when ?? (_a.when = (payload) => {
		const val = payload.value;
		return !nullish(val) && val.length !== void 0;
	});
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		bag.minimum = def.length;
		bag.maximum = def.length;
		bag.length = def.length;
	});
	inst._zod.check = (payload) => {
		const input = payload.value;
		const length = input.length;
		if (length === def.length) return;
		const origin = getLengthableOrigin(input);
		const tooBig = length > def.length;
		payload.issues.push({
			origin,
			...tooBig ? {
				code: "too_big",
				maximum: def.length
			} : {
				code: "too_small",
				minimum: def.length
			},
			inclusive: true,
			exact: true,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckStringFormat = /* @__PURE__ */ $constructor("$ZodCheckStringFormat", (inst, def) => {
	var _a, _b;
	$ZodCheck.init(inst, def);
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		bag.format = def.format;
		if (def.pattern) {
			bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
			bag.patterns.add(def.pattern);
		}
	});
	if (def.pattern) (_a = inst._zod).check ?? (_a.check = (payload) => {
		def.pattern.lastIndex = 0;
		if (def.pattern.test(payload.value)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: def.format,
			input: payload.value,
			...def.pattern ? { pattern: def.pattern.toString() } : {},
			inst,
			continue: !def.abort
		});
	});
	else (_b = inst._zod).check ?? (_b.check = () => {});
});
var $ZodCheckRegex = /* @__PURE__ */ $constructor("$ZodCheckRegex", (inst, def) => {
	$ZodCheckStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		def.pattern.lastIndex = 0;
		if (def.pattern.test(payload.value)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "regex",
			input: payload.value,
			pattern: def.pattern.toString(),
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckLowerCase = /* @__PURE__ */ $constructor("$ZodCheckLowerCase", (inst, def) => {
	def.pattern ?? (def.pattern = lowercase);
	$ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckUpperCase = /* @__PURE__ */ $constructor("$ZodCheckUpperCase", (inst, def) => {
	def.pattern ?? (def.pattern = uppercase);
	$ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckIncludes = /* @__PURE__ */ $constructor("$ZodCheckIncludes", (inst, def) => {
	$ZodCheck.init(inst, def);
	const escapedRegex = escapeRegex(def.includes);
	const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
	def.pattern = pattern;
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
		bag.patterns.add(pattern);
	});
	inst._zod.check = (payload) => {
		if (payload.value.includes(def.includes, def.position)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "includes",
			includes: def.includes,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckStartsWith = /* @__PURE__ */ $constructor("$ZodCheckStartsWith", (inst, def) => {
	$ZodCheck.init(inst, def);
	const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
	def.pattern ?? (def.pattern = pattern);
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
		bag.patterns.add(pattern);
	});
	inst._zod.check = (payload) => {
		if (payload.value.startsWith(def.prefix)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "starts_with",
			prefix: def.prefix,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckEndsWith = /* @__PURE__ */ $constructor("$ZodCheckEndsWith", (inst, def) => {
	$ZodCheck.init(inst, def);
	const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
	def.pattern ?? (def.pattern = pattern);
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
		bag.patterns.add(pattern);
	});
	inst._zod.check = (payload) => {
		if (payload.value.endsWith(def.suffix)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "ends_with",
			suffix: def.suffix,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckOverwrite = /* @__PURE__ */ $constructor("$ZodCheckOverwrite", (inst, def) => {
	$ZodCheck.init(inst, def);
	inst._zod.check = (payload) => {
		payload.value = def.tx(payload.value);
	};
});
//#endregion
//#region node_modules/zod/v4/core/doc.js
var Doc = class {
	constructor(args = []) {
		this.content = [];
		this.indent = 0;
		if (this) this.args = args;
	}
	indented(fn) {
		this.indent += 1;
		fn(this);
		this.indent -= 1;
	}
	write(arg) {
		if (typeof arg === "function") {
			arg(this, { execution: "sync" });
			arg(this, { execution: "async" });
			return;
		}
		const lines = arg.split("\n").filter((x) => x);
		const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
		const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
		for (const line of dedented) this.content.push(line);
	}
	compile() {
		const F = Function;
		const args = this?.args;
		const lines = [...(this?.content ?? [``]).map((x) => `  ${x}`)];
		return new F(...args, lines.join("\n"));
	}
};
//#endregion
//#region node_modules/zod/v4/core/versions.js
var version = {
	major: 4,
	minor: 4,
	patch: 3
};
//#endregion
//#region node_modules/zod/v4/core/schemas.js
var $ZodType = /* @__PURE__ */ $constructor("$ZodType", (inst, def) => {
	var _a;
	inst ?? (inst = {});
	inst._zod.def = def;
	inst._zod.bag = inst._zod.bag || {};
	inst._zod.version = version;
	const checks = [...inst._zod.def.checks ?? []];
	if (inst._zod.traits.has("$ZodCheck")) checks.unshift(inst);
	for (const ch of checks) for (const fn of ch._zod.onattach) fn(inst);
	if (checks.length === 0) {
		(_a = inst._zod).deferred ?? (_a.deferred = []);
		inst._zod.deferred?.push(() => {
			inst._zod.run = inst._zod.parse;
		});
	} else {
		const runChecks = (payload, checks, ctx) => {
			let isAborted = aborted(payload);
			let asyncResult;
			for (const ch of checks) {
				if (ch._zod.def.when) {
					if (explicitlyAborted(payload)) continue;
					if (!ch._zod.def.when(payload)) continue;
				} else if (isAborted) continue;
				const currLen = payload.issues.length;
				const _ = ch._zod.check(payload);
				if (_ instanceof Promise && ctx?.async === false) throw new $ZodAsyncError();
				if (asyncResult || _ instanceof Promise) asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
					await _;
					if (payload.issues.length === currLen) return;
					if (!isAborted) isAborted = aborted(payload, currLen);
				});
				else {
					if (payload.issues.length === currLen) continue;
					if (!isAborted) isAborted = aborted(payload, currLen);
				}
			}
			if (asyncResult) return asyncResult.then(() => {
				return payload;
			});
			return payload;
		};
		const handleCanaryResult = (canary, payload, ctx) => {
			if (aborted(canary)) {
				canary.aborted = true;
				return canary;
			}
			const checkResult = runChecks(payload, checks, ctx);
			if (checkResult instanceof Promise) {
				if (ctx.async === false) throw new $ZodAsyncError();
				return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
			}
			return inst._zod.parse(checkResult, ctx);
		};
		inst._zod.run = (payload, ctx) => {
			if (ctx.skipChecks) return inst._zod.parse(payload, ctx);
			if (ctx.direction === "backward") {
				const canary = inst._zod.parse({
					value: payload.value,
					issues: []
				}, {
					...ctx,
					skipChecks: true
				});
				if (canary instanceof Promise) return canary.then((canary) => {
					return handleCanaryResult(canary, payload, ctx);
				});
				return handleCanaryResult(canary, payload, ctx);
			}
			const result = inst._zod.parse(payload, ctx);
			if (result instanceof Promise) {
				if (ctx.async === false) throw new $ZodAsyncError();
				return result.then((result) => runChecks(result, checks, ctx));
			}
			return runChecks(result, checks, ctx);
		};
	}
	defineLazy(inst, "~standard", () => ({
		validate: (value) => {
			try {
				const r = safeParse$1(inst, value);
				return r.success ? { value: r.data } : { issues: r.error?.issues };
			} catch (_) {
				return safeParseAsync$1(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
			}
		},
		vendor: "zod",
		version: 1
	}));
});
var $ZodString = /* @__PURE__ */ $constructor("$ZodString", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string$1(inst._zod.bag);
	inst._zod.parse = (payload, _) => {
		if (def.coerce) try {
			payload.value = String(payload.value);
		} catch (_) {}
		if (typeof payload.value === "string") return payload;
		payload.issues.push({
			expected: "string",
			code: "invalid_type",
			input: payload.value,
			inst
		});
		return payload;
	};
});
var $ZodStringFormat = /* @__PURE__ */ $constructor("$ZodStringFormat", (inst, def) => {
	$ZodCheckStringFormat.init(inst, def);
	$ZodString.init(inst, def);
});
var $ZodGUID = /* @__PURE__ */ $constructor("$ZodGUID", (inst, def) => {
	def.pattern ?? (def.pattern = guid);
	$ZodStringFormat.init(inst, def);
});
var $ZodUUID = /* @__PURE__ */ $constructor("$ZodUUID", (inst, def) => {
	if (def.version) {
		const v = {
			v1: 1,
			v2: 2,
			v3: 3,
			v4: 4,
			v5: 5,
			v6: 6,
			v7: 7,
			v8: 8
		}[def.version];
		if (v === void 0) throw new Error(`Invalid UUID version: "${def.version}"`);
		def.pattern ?? (def.pattern = uuid(v));
	} else def.pattern ?? (def.pattern = uuid());
	$ZodStringFormat.init(inst, def);
});
var $ZodEmail = /* @__PURE__ */ $constructor("$ZodEmail", (inst, def) => {
	def.pattern ?? (def.pattern = email);
	$ZodStringFormat.init(inst, def);
});
var $ZodURL = /* @__PURE__ */ $constructor("$ZodURL", (inst, def) => {
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		try {
			const trimmed = payload.value.trim();
			if (!def.normalize && def.protocol?.source === httpProtocol.source) {
				if (!/^https?:\/\//i.test(trimmed)) {
					payload.issues.push({
						code: "invalid_format",
						format: "url",
						note: "Invalid URL format",
						input: payload.value,
						inst,
						continue: !def.abort
					});
					return;
				}
			}
			const url = new URL(trimmed);
			if (def.hostname) {
				def.hostname.lastIndex = 0;
				if (!def.hostname.test(url.hostname)) payload.issues.push({
					code: "invalid_format",
					format: "url",
					note: "Invalid hostname",
					pattern: def.hostname.source,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			}
			if (def.protocol) {
				def.protocol.lastIndex = 0;
				if (!def.protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol)) payload.issues.push({
					code: "invalid_format",
					format: "url",
					note: "Invalid protocol",
					pattern: def.protocol.source,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			}
			if (def.normalize) payload.value = url.href;
			else payload.value = trimmed;
			return;
		} catch (_) {
			payload.issues.push({
				code: "invalid_format",
				format: "url",
				input: payload.value,
				inst,
				continue: !def.abort
			});
		}
	};
});
var $ZodEmoji = /* @__PURE__ */ $constructor("$ZodEmoji", (inst, def) => {
	def.pattern ?? (def.pattern = emoji());
	$ZodStringFormat.init(inst, def);
});
var $ZodNanoID = /* @__PURE__ */ $constructor("$ZodNanoID", (inst, def) => {
	def.pattern ?? (def.pattern = nanoid);
	$ZodStringFormat.init(inst, def);
});
/**
* @deprecated CUID v1 is deprecated by its authors due to information leakage
* (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
* See https://github.com/paralleldrive/cuid.
*/
var $ZodCUID = /* @__PURE__ */ $constructor("$ZodCUID", (inst, def) => {
	def.pattern ?? (def.pattern = cuid);
	$ZodStringFormat.init(inst, def);
});
var $ZodCUID2 = /* @__PURE__ */ $constructor("$ZodCUID2", (inst, def) => {
	def.pattern ?? (def.pattern = cuid2);
	$ZodStringFormat.init(inst, def);
});
var $ZodULID = /* @__PURE__ */ $constructor("$ZodULID", (inst, def) => {
	def.pattern ?? (def.pattern = ulid);
	$ZodStringFormat.init(inst, def);
});
var $ZodXID = /* @__PURE__ */ $constructor("$ZodXID", (inst, def) => {
	def.pattern ?? (def.pattern = xid);
	$ZodStringFormat.init(inst, def);
});
var $ZodKSUID = /* @__PURE__ */ $constructor("$ZodKSUID", (inst, def) => {
	def.pattern ?? (def.pattern = ksuid);
	$ZodStringFormat.init(inst, def);
});
var $ZodISODateTime = /* @__PURE__ */ $constructor("$ZodISODateTime", (inst, def) => {
	def.pattern ?? (def.pattern = datetime$1(def));
	$ZodStringFormat.init(inst, def);
});
var $ZodISODate = /* @__PURE__ */ $constructor("$ZodISODate", (inst, def) => {
	def.pattern ?? (def.pattern = date$1);
	$ZodStringFormat.init(inst, def);
});
var $ZodISOTime = /* @__PURE__ */ $constructor("$ZodISOTime", (inst, def) => {
	def.pattern ?? (def.pattern = time$1(def));
	$ZodStringFormat.init(inst, def);
});
var $ZodISODuration = /* @__PURE__ */ $constructor("$ZodISODuration", (inst, def) => {
	def.pattern ?? (def.pattern = duration$1);
	$ZodStringFormat.init(inst, def);
});
var $ZodIPv4 = /* @__PURE__ */ $constructor("$ZodIPv4", (inst, def) => {
	def.pattern ?? (def.pattern = ipv4);
	$ZodStringFormat.init(inst, def);
	inst._zod.bag.format = `ipv4`;
});
var $ZodIPv6 = /* @__PURE__ */ $constructor("$ZodIPv6", (inst, def) => {
	def.pattern ?? (def.pattern = ipv6);
	$ZodStringFormat.init(inst, def);
	inst._zod.bag.format = `ipv6`;
	inst._zod.check = (payload) => {
		try {
			new URL(`http://[${payload.value}]`);
		} catch {
			payload.issues.push({
				code: "invalid_format",
				format: "ipv6",
				input: payload.value,
				inst,
				continue: !def.abort
			});
		}
	};
});
var $ZodCIDRv4 = /* @__PURE__ */ $constructor("$ZodCIDRv4", (inst, def) => {
	def.pattern ?? (def.pattern = cidrv4);
	$ZodStringFormat.init(inst, def);
});
var $ZodCIDRv6 = /* @__PURE__ */ $constructor("$ZodCIDRv6", (inst, def) => {
	def.pattern ?? (def.pattern = cidrv6);
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		const parts = payload.value.split("/");
		try {
			if (parts.length !== 2) throw new Error();
			const [address, prefix] = parts;
			if (!prefix) throw new Error();
			const prefixNum = Number(prefix);
			if (`${prefixNum}` !== prefix) throw new Error();
			if (prefixNum < 0 || prefixNum > 128) throw new Error();
			new URL(`http://[${address}]`);
		} catch {
			payload.issues.push({
				code: "invalid_format",
				format: "cidrv6",
				input: payload.value,
				inst,
				continue: !def.abort
			});
		}
	};
});
function isValidBase64(data) {
	if (data === "") return true;
	if (/\s/.test(data)) return false;
	if (data.length % 4 !== 0) return false;
	try {
		atob(data);
		return true;
	} catch {
		return false;
	}
}
var $ZodBase64 = /* @__PURE__ */ $constructor("$ZodBase64", (inst, def) => {
	def.pattern ?? (def.pattern = base64$1);
	$ZodStringFormat.init(inst, def);
	inst._zod.bag.contentEncoding = "base64";
	inst._zod.check = (payload) => {
		if (isValidBase64(payload.value)) return;
		payload.issues.push({
			code: "invalid_format",
			format: "base64",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
function isValidBase64URL(data) {
	if (!base64url$1.test(data)) return false;
	const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
	return isValidBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
}
var $ZodBase64URL = /* @__PURE__ */ $constructor("$ZodBase64URL", (inst, def) => {
	def.pattern ?? (def.pattern = base64url$1);
	$ZodStringFormat.init(inst, def);
	inst._zod.bag.contentEncoding = "base64url";
	inst._zod.check = (payload) => {
		if (isValidBase64URL(payload.value)) return;
		payload.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodE164 = /* @__PURE__ */ $constructor("$ZodE164", (inst, def) => {
	def.pattern ?? (def.pattern = e164);
	$ZodStringFormat.init(inst, def);
});
function isValidJWT(token, algorithm = null) {
	try {
		const tokensParts = token.split(".");
		if (tokensParts.length !== 3) return false;
		const [header] = tokensParts;
		if (!header) return false;
		const parsedHeader = JSON.parse(atob(header));
		if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT") return false;
		if (!parsedHeader.alg) return false;
		if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)) return false;
		return true;
	} catch {
		return false;
	}
}
var $ZodJWT = /* @__PURE__ */ $constructor("$ZodJWT", (inst, def) => {
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		if (isValidJWT(payload.value, def.alg)) return;
		payload.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodNumber = /* @__PURE__ */ $constructor("$ZodNumber", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.pattern = inst._zod.bag.pattern ?? number$1;
	inst._zod.parse = (payload, _ctx) => {
		if (def.coerce) try {
			payload.value = Number(payload.value);
		} catch (_) {}
		const input = payload.value;
		if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) return payload;
		const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : void 0 : void 0;
		payload.issues.push({
			expected: "number",
			code: "invalid_type",
			input,
			inst,
			...received ? { received } : {}
		});
		return payload;
	};
});
var $ZodNumberFormat = /* @__PURE__ */ $constructor("$ZodNumberFormat", (inst, def) => {
	$ZodCheckNumberFormat.init(inst, def);
	$ZodNumber.init(inst, def);
});
var $ZodUnknown = /* @__PURE__ */ $constructor("$ZodUnknown", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload) => payload;
});
var $ZodNever = /* @__PURE__ */ $constructor("$ZodNever", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, _ctx) => {
		payload.issues.push({
			expected: "never",
			code: "invalid_type",
			input: payload.value,
			inst
		});
		return payload;
	};
});
function handleArrayResult(result, final, index) {
	if (result.issues.length) final.issues.push(...prefixIssues(index, result.issues));
	final.value[index] = result.value;
}
var $ZodArray = /* @__PURE__ */ $constructor("$ZodArray", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, ctx) => {
		const input = payload.value;
		if (!Array.isArray(input)) {
			payload.issues.push({
				expected: "array",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		payload.value = Array(input.length);
		const proms = [];
		for (let i = 0; i < input.length; i++) {
			const item = input[i];
			const result = def.element._zod.run({
				value: item,
				issues: []
			}, ctx);
			if (result instanceof Promise) proms.push(result.then((result) => handleArrayResult(result, payload, i)));
			else handleArrayResult(result, payload, i);
		}
		if (proms.length) return Promise.all(proms).then(() => payload);
		return payload;
	};
});
function handlePropertyResult(result, final, key, input, isOptionalIn, isOptionalOut) {
	const isPresent = key in input;
	if (result.issues.length) {
		if (isOptionalIn && isOptionalOut && !isPresent) return;
		final.issues.push(...prefixIssues(key, result.issues));
	}
	if (!isPresent && !isOptionalIn) {
		if (!result.issues.length) final.issues.push({
			code: "invalid_type",
			expected: "nonoptional",
			input: void 0,
			path: [key]
		});
		return;
	}
	if (result.value === void 0) {
		if (isPresent) final.value[key] = void 0;
	} else final.value[key] = result.value;
}
function normalizeDef(def) {
	const keys = Object.keys(def.shape);
	for (const k of keys) if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
	const okeys = optionalKeys(def.shape);
	return {
		...def,
		keys,
		keySet: new Set(keys),
		numKeys: keys.length,
		optionalKeys: new Set(okeys)
	};
}
function handleCatchall(proms, input, payload, ctx, def, inst) {
	const unrecognized = [];
	const keySet = def.keySet;
	const _catchall = def.catchall._zod;
	const t = _catchall.def.type;
	const isOptionalIn = _catchall.optin === "optional";
	const isOptionalOut = _catchall.optout === "optional";
	for (const key in input) {
		if (key === "__proto__") continue;
		if (keySet.has(key)) continue;
		if (t === "never") {
			unrecognized.push(key);
			continue;
		}
		const r = _catchall.run({
			value: input[key],
			issues: []
		}, ctx);
		if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
		else handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
	}
	if (unrecognized.length) payload.issues.push({
		code: "unrecognized_keys",
		keys: unrecognized,
		input,
		inst
	});
	if (!proms.length) return payload;
	return Promise.all(proms).then(() => {
		return payload;
	});
}
var $ZodObject = /* @__PURE__ */ $constructor("$ZodObject", (inst, def) => {
	$ZodType.init(inst, def);
	if (!Object.getOwnPropertyDescriptor(def, "shape")?.get) {
		const sh = def.shape;
		Object.defineProperty(def, "shape", { get: () => {
			const newSh = { ...sh };
			Object.defineProperty(def, "shape", { value: newSh });
			return newSh;
		} });
	}
	const _normalized = cached(() => normalizeDef(def));
	defineLazy(inst._zod, "propValues", () => {
		const shape = def.shape;
		const propValues = {};
		for (const key in shape) {
			const field = shape[key]._zod;
			if (field.values) {
				propValues[key] ?? (propValues[key] = /* @__PURE__ */ new Set());
				for (const v of field.values) propValues[key].add(v);
			}
		}
		return propValues;
	});
	const isObject$1 = isObject;
	const catchall = def.catchall;
	let value;
	inst._zod.parse = (payload, ctx) => {
		value ?? (value = _normalized.value);
		const input = payload.value;
		if (!isObject$1(input)) {
			payload.issues.push({
				expected: "object",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		payload.value = {};
		const proms = [];
		const shape = value.shape;
		for (const key of value.keys) {
			const el = shape[key];
			const isOptionalIn = el._zod.optin === "optional";
			const isOptionalOut = el._zod.optout === "optional";
			const r = el._zod.run({
				value: input[key],
				issues: []
			}, ctx);
			if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
			else handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
		}
		if (!catchall) return proms.length ? Promise.all(proms).then(() => payload) : payload;
		return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
	};
});
var $ZodObjectJIT = /* @__PURE__ */ $constructor("$ZodObjectJIT", (inst, def) => {
	$ZodObject.init(inst, def);
	const superParse = inst._zod.parse;
	const _normalized = cached(() => normalizeDef(def));
	const generateFastpass = (shape) => {
		const doc = new Doc([
			"shape",
			"payload",
			"ctx"
		]);
		const normalized = _normalized.value;
		const parseStr = (key) => {
			const k = esc(key);
			return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
		};
		doc.write(`const input = payload.value;`);
		const ids = Object.create(null);
		let counter = 0;
		for (const key of normalized.keys) ids[key] = `key_${counter++}`;
		doc.write(`const newResult = {};`);
		for (const key of normalized.keys) {
			const id = ids[key];
			const k = esc(key);
			const schema = shape[key];
			const isOptionalIn = schema?._zod?.optin === "optional";
			const isOptionalOut = schema?._zod?.optout === "optional";
			doc.write(`const ${id} = ${parseStr(key)};`);
			if (isOptionalIn && isOptionalOut) doc.write(`
        if (${id}.issues.length) {
          if (${k} in input) {
            payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${k}, ...iss.path] : [${k}]
            })));
          }
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
			else if (!isOptionalIn) doc.write(`
        const ${id}_present = ${k} in input;
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
        }

        if (${id}_present) {
          if (${id}.value === undefined) {
            newResult[${k}] = undefined;
          } else {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
			else doc.write(`
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
		}
		doc.write(`payload.value = newResult;`);
		doc.write(`return payload;`);
		const fn = doc.compile();
		return (payload, ctx) => fn(shape, payload, ctx);
	};
	let fastpass;
	const isObject$2 = isObject;
	const jit = !globalConfig.jitless;
	const fastEnabled = jit && allowsEval.value;
	const catchall = def.catchall;
	let value;
	inst._zod.parse = (payload, ctx) => {
		value ?? (value = _normalized.value);
		const input = payload.value;
		if (!isObject$2(input)) {
			payload.issues.push({
				expected: "object",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
			if (!fastpass) fastpass = generateFastpass(def.shape);
			payload = fastpass(payload, ctx);
			if (!catchall) return payload;
			return handleCatchall([], input, payload, ctx, value, inst);
		}
		return superParse(payload, ctx);
	};
});
function handleUnionResults(results, final, inst, ctx) {
	for (const result of results) if (result.issues.length === 0) {
		final.value = result.value;
		return final;
	}
	const nonaborted = results.filter((r) => !aborted(r));
	if (nonaborted.length === 1) {
		final.value = nonaborted[0].value;
		return nonaborted[0];
	}
	final.issues.push({
		code: "invalid_union",
		input: final.value,
		inst,
		errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
	});
	return final;
}
var $ZodUnion = /* @__PURE__ */ $constructor("$ZodUnion", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0);
	defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
	defineLazy(inst._zod, "values", () => {
		if (def.options.every((o) => o._zod.values)) return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
	});
	defineLazy(inst._zod, "pattern", () => {
		if (def.options.every((o) => o._zod.pattern)) {
			const patterns = def.options.map((o) => o._zod.pattern);
			return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
		}
	});
	const first = def.options.length === 1 ? def.options[0]._zod.run : null;
	inst._zod.parse = (payload, ctx) => {
		if (first) return first(payload, ctx);
		let async = false;
		const results = [];
		for (const option of def.options) {
			const result = option._zod.run({
				value: payload.value,
				issues: []
			}, ctx);
			if (result instanceof Promise) {
				results.push(result);
				async = true;
			} else {
				if (result.issues.length === 0) return result;
				results.push(result);
			}
		}
		if (!async) return handleUnionResults(results, payload, inst, ctx);
		return Promise.all(results).then((results) => {
			return handleUnionResults(results, payload, inst, ctx);
		});
	};
});
var $ZodIntersection = /* @__PURE__ */ $constructor("$ZodIntersection", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, ctx) => {
		const input = payload.value;
		const left = def.left._zod.run({
			value: input,
			issues: []
		}, ctx);
		const right = def.right._zod.run({
			value: input,
			issues: []
		}, ctx);
		if (left instanceof Promise || right instanceof Promise) return Promise.all([left, right]).then(([left, right]) => {
			return handleIntersectionResults(payload, left, right);
		});
		return handleIntersectionResults(payload, left, right);
	};
});
function mergeValues(a, b) {
	if (a === b) return {
		valid: true,
		data: a
	};
	if (a instanceof Date && b instanceof Date && +a === +b) return {
		valid: true,
		data: a
	};
	if (isPlainObject(a) && isPlainObject(b)) {
		const bKeys = Object.keys(b);
		const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
		const newObj = {
			...a,
			...b
		};
		for (const key of sharedKeys) {
			const sharedValue = mergeValues(a[key], b[key]);
			if (!sharedValue.valid) return {
				valid: false,
				mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
			};
			newObj[key] = sharedValue.data;
		}
		return {
			valid: true,
			data: newObj
		};
	}
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return {
			valid: false,
			mergeErrorPath: []
		};
		const newArray = [];
		for (let index = 0; index < a.length; index++) {
			const itemA = a[index];
			const itemB = b[index];
			const sharedValue = mergeValues(itemA, itemB);
			if (!sharedValue.valid) return {
				valid: false,
				mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
			};
			newArray.push(sharedValue.data);
		}
		return {
			valid: true,
			data: newArray
		};
	}
	return {
		valid: false,
		mergeErrorPath: []
	};
}
function handleIntersectionResults(result, left, right) {
	const unrecKeys = /* @__PURE__ */ new Map();
	let unrecIssue;
	for (const iss of left.issues) if (iss.code === "unrecognized_keys") {
		unrecIssue ?? (unrecIssue = iss);
		for (const k of iss.keys) {
			if (!unrecKeys.has(k)) unrecKeys.set(k, {});
			unrecKeys.get(k).l = true;
		}
	} else result.issues.push(iss);
	for (const iss of right.issues) if (iss.code === "unrecognized_keys") for (const k of iss.keys) {
		if (!unrecKeys.has(k)) unrecKeys.set(k, {});
		unrecKeys.get(k).r = true;
	}
	else result.issues.push(iss);
	const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
	if (bothKeys.length && unrecIssue) result.issues.push({
		...unrecIssue,
		keys: bothKeys
	});
	if (aborted(result)) return result;
	const merged = mergeValues(left.value, right.value);
	if (!merged.valid) throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
	result.value = merged.data;
	return result;
}
var $ZodEnum = /* @__PURE__ */ $constructor("$ZodEnum", (inst, def) => {
	$ZodType.init(inst, def);
	const values = getEnumValues(def.entries);
	const valuesSet = new Set(values);
	inst._zod.values = valuesSet;
	inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|")})$`);
	inst._zod.parse = (payload, _ctx) => {
		const input = payload.value;
		if (valuesSet.has(input)) return payload;
		payload.issues.push({
			code: "invalid_value",
			values,
			input,
			inst
		});
		return payload;
	};
});
var $ZodLiteral = /* @__PURE__ */ $constructor("$ZodLiteral", (inst, def) => {
	$ZodType.init(inst, def);
	if (def.values.length === 0) throw new Error("Cannot create literal schema with no valid values");
	const values = new Set(def.values);
	inst._zod.values = values;
	inst._zod.pattern = new RegExp(`^(${def.values.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$`);
	inst._zod.parse = (payload, _ctx) => {
		const input = payload.value;
		if (values.has(input)) return payload;
		payload.issues.push({
			code: "invalid_value",
			values: def.values,
			input,
			inst
		});
		return payload;
	};
});
var $ZodTransform = /* @__PURE__ */ $constructor("$ZodTransform", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "optional";
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
		const _out = def.transform(payload.value, payload);
		if (ctx.async) return (_out instanceof Promise ? _out : Promise.resolve(_out)).then((output) => {
			payload.value = output;
			payload.fallback = true;
			return payload;
		});
		if (_out instanceof Promise) throw new $ZodAsyncError();
		payload.value = _out;
		payload.fallback = true;
		return payload;
	};
});
function handleOptionalResult(result, input) {
	if (input === void 0 && (result.issues.length || result.fallback)) return {
		issues: [],
		value: void 0
	};
	return result;
}
var $ZodOptional = /* @__PURE__ */ $constructor("$ZodOptional", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "optional";
	inst._zod.optout = "optional";
	defineLazy(inst._zod, "values", () => {
		return def.innerType._zod.values ? new Set([...def.innerType._zod.values, void 0]) : void 0;
	});
	defineLazy(inst._zod, "pattern", () => {
		const pattern = def.innerType._zod.pattern;
		return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
	});
	inst._zod.parse = (payload, ctx) => {
		if (def.innerType._zod.optin === "optional") {
			const input = payload.value;
			const result = def.innerType._zod.run(payload, ctx);
			if (result instanceof Promise) return result.then((r) => handleOptionalResult(r, input));
			return handleOptionalResult(result, input);
		}
		if (payload.value === void 0) return payload;
		return def.innerType._zod.run(payload, ctx);
	};
});
var $ZodExactOptional = /* @__PURE__ */ $constructor("$ZodExactOptional", (inst, def) => {
	$ZodOptional.init(inst, def);
	defineLazy(inst._zod, "values", () => def.innerType._zod.values);
	defineLazy(inst._zod, "pattern", () => def.innerType._zod.pattern);
	inst._zod.parse = (payload, ctx) => {
		return def.innerType._zod.run(payload, ctx);
	};
});
var $ZodNullable = /* @__PURE__ */ $constructor("$ZodNullable", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
	defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
	defineLazy(inst._zod, "pattern", () => {
		const pattern = def.innerType._zod.pattern;
		return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
	});
	defineLazy(inst._zod, "values", () => {
		return def.innerType._zod.values ? new Set([...def.innerType._zod.values, null]) : void 0;
	});
	inst._zod.parse = (payload, ctx) => {
		if (payload.value === null) return payload;
		return def.innerType._zod.run(payload, ctx);
	};
});
var $ZodDefault = /* @__PURE__ */ $constructor("$ZodDefault", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "optional";
	defineLazy(inst._zod, "values", () => def.innerType._zod.values);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		if (payload.value === void 0) {
			payload.value = def.defaultValue;
			/**
			* $ZodDefault returns the default value immediately in forward direction.
			* It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
			return payload;
		}
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then((result) => handleDefaultResult(result, def));
		return handleDefaultResult(result, def);
	};
});
function handleDefaultResult(payload, def) {
	if (payload.value === void 0) payload.value = def.defaultValue;
	return payload;
}
var $ZodPrefault = /* @__PURE__ */ $constructor("$ZodPrefault", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "optional";
	defineLazy(inst._zod, "values", () => def.innerType._zod.values);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		if (payload.value === void 0) payload.value = def.defaultValue;
		return def.innerType._zod.run(payload, ctx);
	};
});
var $ZodNonOptional = /* @__PURE__ */ $constructor("$ZodNonOptional", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazy(inst._zod, "values", () => {
		const v = def.innerType._zod.values;
		return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
	});
	inst._zod.parse = (payload, ctx) => {
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then((result) => handleNonOptionalResult(result, inst));
		return handleNonOptionalResult(result, inst);
	};
});
function handleNonOptionalResult(payload, inst) {
	if (!payload.issues.length && payload.value === void 0) payload.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: payload.value,
		inst
	});
	return payload;
}
var $ZodCatch = /* @__PURE__ */ $constructor("$ZodCatch", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "optional";
	defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
	defineLazy(inst._zod, "values", () => def.innerType._zod.values);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then((result) => {
			payload.value = result.value;
			if (result.issues.length) {
				payload.value = def.catchValue({
					...payload,
					error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
					input: payload.value
				});
				payload.issues = [];
				payload.fallback = true;
			}
			return payload;
		});
		payload.value = result.value;
		if (result.issues.length) {
			payload.value = def.catchValue({
				...payload,
				error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
				input: payload.value
			});
			payload.issues = [];
			payload.fallback = true;
		}
		return payload;
	};
});
var $ZodPipe = /* @__PURE__ */ $constructor("$ZodPipe", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazy(inst._zod, "values", () => def.in._zod.values);
	defineLazy(inst._zod, "optin", () => def.in._zod.optin);
	defineLazy(inst._zod, "optout", () => def.out._zod.optout);
	defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") {
			const right = def.out._zod.run(payload, ctx);
			if (right instanceof Promise) return right.then((right) => handlePipeResult(right, def.in, ctx));
			return handlePipeResult(right, def.in, ctx);
		}
		const left = def.in._zod.run(payload, ctx);
		if (left instanceof Promise) return left.then((left) => handlePipeResult(left, def.out, ctx));
		return handlePipeResult(left, def.out, ctx);
	};
});
function handlePipeResult(left, next, ctx) {
	if (left.issues.length) {
		left.aborted = true;
		return left;
	}
	return next._zod.run({
		value: left.value,
		issues: left.issues,
		fallback: left.fallback
	}, ctx);
}
var $ZodReadonly = /* @__PURE__ */ $constructor("$ZodReadonly", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
	defineLazy(inst._zod, "values", () => def.innerType._zod.values);
	defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
	defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
	inst._zod.parse = (payload, ctx) => {
		if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then(handleReadonlyResult);
		return handleReadonlyResult(result);
	};
});
function handleReadonlyResult(payload) {
	payload.value = Object.freeze(payload.value);
	return payload;
}
var $ZodCustom = /* @__PURE__ */ $constructor("$ZodCustom", (inst, def) => {
	$ZodCheck.init(inst, def);
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, _) => {
		return payload;
	};
	inst._zod.check = (payload) => {
		const input = payload.value;
		const r = def.fn(input);
		if (r instanceof Promise) return r.then((r) => handleRefineResult(r, payload, input, inst));
		handleRefineResult(r, payload, input, inst);
	};
});
function handleRefineResult(result, payload, input, inst) {
	if (!result) {
		const _iss = {
			code: "custom",
			input,
			inst,
			path: [...inst._zod.def.path ?? []],
			continue: !inst._zod.def.abort
		};
		if (inst._zod.def.params) _iss.params = inst._zod.def.params;
		payload.issues.push(issue(_iss));
	}
}
//#endregion
//#region node_modules/zod/v4/core/registries.js
var _a$1;
var $ZodRegistry = class {
	constructor() {
		this._map = /* @__PURE__ */ new WeakMap();
		this._idmap = /* @__PURE__ */ new Map();
	}
	add(schema, ..._meta) {
		const meta = _meta[0];
		this._map.set(schema, meta);
		if (meta && typeof meta === "object" && "id" in meta) this._idmap.set(meta.id, schema);
		return this;
	}
	clear() {
		this._map = /* @__PURE__ */ new WeakMap();
		this._idmap = /* @__PURE__ */ new Map();
		return this;
	}
	remove(schema) {
		const meta = this._map.get(schema);
		if (meta && typeof meta === "object" && "id" in meta) this._idmap.delete(meta.id);
		this._map.delete(schema);
		return this;
	}
	get(schema) {
		const p = schema._zod.parent;
		if (p) {
			const pm = { ...this.get(p) ?? {} };
			delete pm.id;
			const f = {
				...pm,
				...this._map.get(schema)
			};
			return Object.keys(f).length ? f : void 0;
		}
		return this._map.get(schema);
	}
	has(schema) {
		return this._map.has(schema);
	}
};
function registry() {
	return new $ZodRegistry();
}
(_a$1 = globalThis).__zod_globalRegistry ?? (_a$1.__zod_globalRegistry = registry());
var globalRegistry = globalThis.__zod_globalRegistry;
//#endregion
//#region node_modules/zod/v4/core/api.js
/* @__NO_SIDE_EFFECTS__ */
function _string(Class, params) {
	return new Class({
		type: "string",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _email(Class, params) {
	return new Class({
		type: "string",
		format: "email",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _guid(Class, params) {
	return new Class({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _uuid(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _uuidv4(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		version: "v4",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _uuidv6(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		version: "v6",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _uuidv7(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		version: "v7",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _url(Class, params) {
	return new Class({
		type: "string",
		format: "url",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _emoji(Class, params) {
	return new Class({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _nanoid(Class, params) {
	return new Class({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/**
* @deprecated CUID v1 is deprecated by its authors due to information leakage
* (timestamps embedded in the id). Use {@link _cuid2} instead.
* See https://github.com/paralleldrive/cuid.
*/
/* @__NO_SIDE_EFFECTS__ */
function _cuid(Class, params) {
	return new Class({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _cuid2(Class, params) {
	return new Class({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _ulid(Class, params) {
	return new Class({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _xid(Class, params) {
	return new Class({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _ksuid(Class, params) {
	return new Class({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _ipv4(Class, params) {
	return new Class({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _ipv6(Class, params) {
	return new Class({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _cidrv4(Class, params) {
	return new Class({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _cidrv6(Class, params) {
	return new Class({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _base64(Class, params) {
	return new Class({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _base64url(Class, params) {
	return new Class({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _e164(Class, params) {
	return new Class({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _jwt(Class, params) {
	return new Class({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _isoDateTime(Class, params) {
	return new Class({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: false,
		local: false,
		precision: null,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _isoDate(Class, params) {
	return new Class({
		type: "string",
		format: "date",
		check: "string_format",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _isoTime(Class, params) {
	return new Class({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _isoDuration(Class, params) {
	return new Class({
		type: "string",
		format: "duration",
		check: "string_format",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _number(Class, params) {
	return new Class({
		type: "number",
		checks: [],
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _int(Class, params) {
	return new Class({
		type: "number",
		check: "number_format",
		abort: false,
		format: "safeint",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _unknown(Class) {
	return new Class({ type: "unknown" });
}
/* @__NO_SIDE_EFFECTS__ */
function _never(Class, params) {
	return new Class({
		type: "never",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _lt(value, params) {
	return new $ZodCheckLessThan({
		check: "less_than",
		...normalizeParams(params),
		value,
		inclusive: false
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _lte(value, params) {
	return new $ZodCheckLessThan({
		check: "less_than",
		...normalizeParams(params),
		value,
		inclusive: true
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _gt(value, params) {
	return new $ZodCheckGreaterThan({
		check: "greater_than",
		...normalizeParams(params),
		value,
		inclusive: false
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _gte(value, params) {
	return new $ZodCheckGreaterThan({
		check: "greater_than",
		...normalizeParams(params),
		value,
		inclusive: true
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _multipleOf(value, params) {
	return new $ZodCheckMultipleOf({
		check: "multiple_of",
		...normalizeParams(params),
		value
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _maxLength(maximum, params) {
	return new $ZodCheckMaxLength({
		check: "max_length",
		...normalizeParams(params),
		maximum
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _minLength(minimum, params) {
	return new $ZodCheckMinLength({
		check: "min_length",
		...normalizeParams(params),
		minimum
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _length(length, params) {
	return new $ZodCheckLengthEquals({
		check: "length_equals",
		...normalizeParams(params),
		length
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _regex(pattern, params) {
	return new $ZodCheckRegex({
		check: "string_format",
		format: "regex",
		...normalizeParams(params),
		pattern
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _lowercase(params) {
	return new $ZodCheckLowerCase({
		check: "string_format",
		format: "lowercase",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _uppercase(params) {
	return new $ZodCheckUpperCase({
		check: "string_format",
		format: "uppercase",
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _includes(includes, params) {
	return new $ZodCheckIncludes({
		check: "string_format",
		format: "includes",
		...normalizeParams(params),
		includes
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _startsWith(prefix, params) {
	return new $ZodCheckStartsWith({
		check: "string_format",
		format: "starts_with",
		...normalizeParams(params),
		prefix
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _endsWith(suffix, params) {
	return new $ZodCheckEndsWith({
		check: "string_format",
		format: "ends_with",
		...normalizeParams(params),
		suffix
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _overwrite(tx) {
	return new $ZodCheckOverwrite({
		check: "overwrite",
		tx
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _normalize(form) {
	return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
}
/* @__NO_SIDE_EFFECTS__ */
function _trim() {
	return /* @__PURE__ */ _overwrite((input) => input.trim());
}
/* @__NO_SIDE_EFFECTS__ */
function _toLowerCase() {
	return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
}
/* @__NO_SIDE_EFFECTS__ */
function _toUpperCase() {
	return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
}
/* @__NO_SIDE_EFFECTS__ */
function _slugify() {
	return /* @__PURE__ */ _overwrite((input) => slugify(input));
}
/* @__NO_SIDE_EFFECTS__ */
function _array(Class, element, params) {
	return new Class({
		type: "array",
		element,
		...normalizeParams(params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _refine(Class, fn, _params) {
	return new Class({
		type: "custom",
		check: "custom",
		fn,
		...normalizeParams(_params)
	});
}
/* @__NO_SIDE_EFFECTS__ */
function _superRefine(fn, params) {
	const ch = /* @__PURE__ */ _check((payload) => {
		payload.addIssue = (issue$2) => {
			if (typeof issue$2 === "string") payload.issues.push(issue(issue$2, payload.value, ch._zod.def));
			else {
				const _issue = issue$2;
				if (_issue.fatal) _issue.continue = false;
				_issue.code ?? (_issue.code = "custom");
				_issue.input ?? (_issue.input = payload.value);
				_issue.inst ?? (_issue.inst = ch);
				_issue.continue ?? (_issue.continue = !ch._zod.def.abort);
				payload.issues.push(issue(_issue));
			}
		};
		return fn(payload.value, payload);
	}, params);
	return ch;
}
/* @__NO_SIDE_EFFECTS__ */
function _check(fn, params) {
	const ch = new $ZodCheck({
		check: "custom",
		...normalizeParams(params)
	});
	ch._zod.check = fn;
	return ch;
}
//#endregion
//#region node_modules/zod/v4/core/to-json-schema.js
function initializeContext(params) {
	let target = params?.target ?? "draft-2020-12";
	if (target === "draft-4") target = "draft-04";
	if (target === "draft-7") target = "draft-07";
	return {
		processors: params.processors ?? {},
		metadataRegistry: params?.metadata ?? globalRegistry,
		target,
		unrepresentable: params?.unrepresentable ?? "throw",
		override: params?.override ?? (() => {}),
		io: params?.io ?? "output",
		counter: 0,
		seen: /* @__PURE__ */ new Map(),
		cycles: params?.cycles ?? "ref",
		reused: params?.reused ?? "inline",
		external: params?.external ?? void 0
	};
}
function process(schema, ctx, _params = {
	path: [],
	schemaPath: []
}) {
	var _a;
	const def = schema._zod.def;
	const seen = ctx.seen.get(schema);
	if (seen) {
		seen.count++;
		if (_params.schemaPath.includes(schema)) seen.cycle = _params.path;
		return seen.schema;
	}
	const result = {
		schema: {},
		count: 1,
		cycle: void 0,
		path: _params.path
	};
	ctx.seen.set(schema, result);
	const overrideSchema = schema._zod.toJSONSchema?.();
	if (overrideSchema) result.schema = overrideSchema;
	else {
		const params = {
			..._params,
			schemaPath: [..._params.schemaPath, schema],
			path: _params.path
		};
		if (schema._zod.processJSONSchema) schema._zod.processJSONSchema(ctx, result.schema, params);
		else {
			const _json = result.schema;
			const processor = ctx.processors[def.type];
			if (!processor) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
			processor(schema, ctx, _json, params);
		}
		const parent = schema._zod.parent;
		if (parent) {
			if (!result.ref) result.ref = parent;
			process(parent, ctx, params);
			ctx.seen.get(parent).isParent = true;
		}
	}
	const meta = ctx.metadataRegistry.get(schema);
	if (meta) Object.assign(result.schema, meta);
	if (ctx.io === "input" && isTransforming(schema)) {
		delete result.schema.examples;
		delete result.schema.default;
	}
	if (ctx.io === "input" && "_prefault" in result.schema) (_a = result.schema).default ?? (_a.default = result.schema._prefault);
	delete result.schema._prefault;
	return ctx.seen.get(schema).schema;
}
function extractDefs(ctx, schema) {
	const root = ctx.seen.get(schema);
	if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
	const idToSchema = /* @__PURE__ */ new Map();
	for (const entry of ctx.seen.entries()) {
		const id = ctx.metadataRegistry.get(entry[0])?.id;
		if (id) {
			const existing = idToSchema.get(id);
			if (existing && existing !== entry[0]) throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
			idToSchema.set(id, entry[0]);
		}
	}
	const makeURI = (entry) => {
		const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
		if (ctx.external) {
			const externalId = ctx.external.registry.get(entry[0])?.id;
			const uriGenerator = ctx.external.uri ?? ((id) => id);
			if (externalId) return { ref: uriGenerator(externalId) };
			const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
			entry[1].defId = id;
			return {
				defId: id,
				ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}`
			};
		}
		if (entry[1] === root) return { ref: "#" };
		const defUriPrefix = `#/${defsSegment}/`;
		const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
		return {
			defId,
			ref: defUriPrefix + defId
		};
	};
	const extractToDef = (entry) => {
		if (entry[1].schema.$ref) return;
		const seen = entry[1];
		const { ref, defId } = makeURI(entry);
		seen.def = { ...seen.schema };
		if (defId) seen.defId = defId;
		const schema = seen.schema;
		for (const key in schema) delete schema[key];
		schema.$ref = ref;
	};
	if (ctx.cycles === "throw") for (const entry of ctx.seen.entries()) {
		const seen = entry[1];
		if (seen.cycle) throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
	}
	for (const entry of ctx.seen.entries()) {
		const seen = entry[1];
		if (schema === entry[0]) {
			extractToDef(entry);
			continue;
		}
		if (ctx.external) {
			const ext = ctx.external.registry.get(entry[0])?.id;
			if (schema !== entry[0] && ext) {
				extractToDef(entry);
				continue;
			}
		}
		if (ctx.metadataRegistry.get(entry[0])?.id) {
			extractToDef(entry);
			continue;
		}
		if (seen.cycle) {
			extractToDef(entry);
			continue;
		}
		if (seen.count > 1) {
			if (ctx.reused === "ref") {
				extractToDef(entry);
				continue;
			}
		}
	}
}
function finalize(ctx, schema) {
	const root = ctx.seen.get(schema);
	if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
	const flattenRef = (zodSchema) => {
		const seen = ctx.seen.get(zodSchema);
		if (seen.ref === null) return;
		const schema = seen.def ?? seen.schema;
		const _cached = { ...schema };
		const ref = seen.ref;
		seen.ref = null;
		if (ref) {
			flattenRef(ref);
			const refSeen = ctx.seen.get(ref);
			const refSchema = refSeen.schema;
			if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
				schema.allOf = schema.allOf ?? [];
				schema.allOf.push(refSchema);
			} else Object.assign(schema, refSchema);
			Object.assign(schema, _cached);
			if (zodSchema._zod.parent === ref) for (const key in schema) {
				if (key === "$ref" || key === "allOf") continue;
				if (!(key in _cached)) delete schema[key];
			}
			if (refSchema.$ref && refSeen.def) for (const key in schema) {
				if (key === "$ref" || key === "allOf") continue;
				if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) delete schema[key];
			}
		}
		const parent = zodSchema._zod.parent;
		if (parent && parent !== ref) {
			flattenRef(parent);
			const parentSeen = ctx.seen.get(parent);
			if (parentSeen?.schema.$ref) {
				schema.$ref = parentSeen.schema.$ref;
				if (parentSeen.def) for (const key in schema) {
					if (key === "$ref" || key === "allOf") continue;
					if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) delete schema[key];
				}
			}
		}
		ctx.override({
			zodSchema,
			jsonSchema: schema,
			path: seen.path ?? []
		});
	};
	for (const entry of [...ctx.seen.entries()].reverse()) flattenRef(entry[0]);
	const result = {};
	if (ctx.target === "draft-2020-12") result.$schema = "https://json-schema.org/draft/2020-12/schema";
	else if (ctx.target === "draft-07") result.$schema = "http://json-schema.org/draft-07/schema#";
	else if (ctx.target === "draft-04") result.$schema = "http://json-schema.org/draft-04/schema#";
	else if (ctx.target === "openapi-3.0") {}
	if (ctx.external?.uri) {
		const id = ctx.external.registry.get(schema)?.id;
		if (!id) throw new Error("Schema is missing an `id` property");
		result.$id = ctx.external.uri(id);
	}
	Object.assign(result, root.def ?? root.schema);
	const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
	if (rootMetaId !== void 0 && result.id === rootMetaId) delete result.id;
	const defs = ctx.external?.defs ?? {};
	for (const entry of ctx.seen.entries()) {
		const seen = entry[1];
		if (seen.def && seen.defId) {
			if (seen.def.id === seen.defId) delete seen.def.id;
			defs[seen.defId] = seen.def;
		}
	}
	if (ctx.external) {} else if (Object.keys(defs).length > 0) if (ctx.target === "draft-2020-12") result.$defs = defs;
	else result.definitions = defs;
	try {
		const finalized = JSON.parse(JSON.stringify(result));
		Object.defineProperty(finalized, "~standard", {
			value: {
				...schema["~standard"],
				jsonSchema: {
					input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
					output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
				}
			},
			enumerable: false,
			writable: false
		});
		return finalized;
	} catch (_err) {
		throw new Error("Error converting schema to JSON.");
	}
}
function isTransforming(_schema, _ctx) {
	const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
	if (ctx.seen.has(_schema)) return false;
	ctx.seen.add(_schema);
	const def = _schema._zod.def;
	if (def.type === "transform") return true;
	if (def.type === "array") return isTransforming(def.element, ctx);
	if (def.type === "set") return isTransforming(def.valueType, ctx);
	if (def.type === "lazy") return isTransforming(def.getter(), ctx);
	if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") return isTransforming(def.innerType, ctx);
	if (def.type === "intersection") return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
	if (def.type === "record" || def.type === "map") return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
	if (def.type === "pipe") {
		if (_schema._zod.traits.has("$ZodCodec")) return true;
		return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
	}
	if (def.type === "object") {
		for (const key in def.shape) if (isTransforming(def.shape[key], ctx)) return true;
		return false;
	}
	if (def.type === "union") {
		for (const option of def.options) if (isTransforming(option, ctx)) return true;
		return false;
	}
	if (def.type === "tuple") {
		for (const item of def.items) if (isTransforming(item, ctx)) return true;
		if (def.rest && isTransforming(def.rest, ctx)) return true;
		return false;
	}
	return false;
}
/**
* Creates a toJSONSchema method for a schema instance.
* This encapsulates the logic of initializing context, processing, extracting defs, and finalizing.
*/
var createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
	const ctx = initializeContext({
		...params,
		processors
	});
	process(schema, ctx);
	extractDefs(ctx, schema);
	return finalize(ctx, schema);
};
var createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
	const { libraryOptions, target } = params ?? {};
	const ctx = initializeContext({
		...libraryOptions ?? {},
		target,
		io,
		processors
	});
	process(schema, ctx);
	extractDefs(ctx, schema);
	return finalize(ctx, schema);
};
//#endregion
//#region node_modules/zod/v4/core/json-schema-processors.js
var formatMap = {
	guid: "uuid",
	url: "uri",
	datetime: "date-time",
	json_string: "json-string",
	regex: ""
};
var stringProcessor = (schema, ctx, _json, _params) => {
	const json = _json;
	json.type = "string";
	const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
	if (typeof minimum === "number") json.minLength = minimum;
	if (typeof maximum === "number") json.maxLength = maximum;
	if (format) {
		json.format = formatMap[format] ?? format;
		if (json.format === "") delete json.format;
		if (format === "time") delete json.format;
	}
	if (contentEncoding) json.contentEncoding = contentEncoding;
	if (patterns && patterns.size > 0) {
		const regexes = [...patterns];
		if (regexes.length === 1) json.pattern = regexes[0].source;
		else if (regexes.length > 1) json.allOf = [...regexes.map((regex) => ({
			...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
			pattern: regex.source
		}))];
	}
};
var numberProcessor = (schema, ctx, _json, _params) => {
	const json = _json;
	const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
	if (typeof format === "string" && format.includes("int")) json.type = "integer";
	else json.type = "number";
	const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
	const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
	const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
	if (exMin) if (legacy) {
		json.minimum = exclusiveMinimum;
		json.exclusiveMinimum = true;
	} else json.exclusiveMinimum = exclusiveMinimum;
	else if (typeof minimum === "number") json.minimum = minimum;
	if (exMax) if (legacy) {
		json.maximum = exclusiveMaximum;
		json.exclusiveMaximum = true;
	} else json.exclusiveMaximum = exclusiveMaximum;
	else if (typeof maximum === "number") json.maximum = maximum;
	if (typeof multipleOf === "number") json.multipleOf = multipleOf;
};
var neverProcessor = (_schema, _ctx, json, _params) => {
	json.not = {};
};
var enumProcessor = (schema, _ctx, json, _params) => {
	const def = schema._zod.def;
	const values = getEnumValues(def.entries);
	if (values.every((v) => typeof v === "number")) json.type = "number";
	if (values.every((v) => typeof v === "string")) json.type = "string";
	json.enum = values;
};
var literalProcessor = (schema, ctx, json, _params) => {
	const def = schema._zod.def;
	const vals = [];
	for (const val of def.values) if (val === void 0) {
		if (ctx.unrepresentable === "throw") throw new Error("Literal `undefined` cannot be represented in JSON Schema");
	} else if (typeof val === "bigint") if (ctx.unrepresentable === "throw") throw new Error("BigInt literals cannot be represented in JSON Schema");
	else vals.push(Number(val));
	else vals.push(val);
	if (vals.length === 0) {} else if (vals.length === 1) {
		const val = vals[0];
		json.type = val === null ? "null" : typeof val;
		if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") json.enum = [val];
		else json.const = val;
	} else {
		if (vals.every((v) => typeof v === "number")) json.type = "number";
		if (vals.every((v) => typeof v === "string")) json.type = "string";
		if (vals.every((v) => typeof v === "boolean")) json.type = "boolean";
		if (vals.every((v) => v === null)) json.type = "null";
		json.enum = vals;
	}
};
var customProcessor = (_schema, ctx, _json, _params) => {
	if (ctx.unrepresentable === "throw") throw new Error("Custom types cannot be represented in JSON Schema");
};
var transformProcessor = (_schema, ctx, _json, _params) => {
	if (ctx.unrepresentable === "throw") throw new Error("Transforms cannot be represented in JSON Schema");
};
var arrayProcessor = (schema, ctx, _json, params) => {
	const json = _json;
	const def = schema._zod.def;
	const { minimum, maximum } = schema._zod.bag;
	if (typeof minimum === "number") json.minItems = minimum;
	if (typeof maximum === "number") json.maxItems = maximum;
	json.type = "array";
	json.items = process(def.element, ctx, {
		...params,
		path: [...params.path, "items"]
	});
};
var objectProcessor = (schema, ctx, _json, params) => {
	const json = _json;
	const def = schema._zod.def;
	json.type = "object";
	json.properties = {};
	const shape = def.shape;
	for (const key in shape) json.properties[key] = process(shape[key], ctx, {
		...params,
		path: [
			...params.path,
			"properties",
			key
		]
	});
	const allKeys = new Set(Object.keys(shape));
	const requiredKeys = new Set([...allKeys].filter((key) => {
		const v = def.shape[key]._zod;
		if (ctx.io === "input") return v.optin === void 0;
		else return v.optout === void 0;
	}));
	if (requiredKeys.size > 0) json.required = Array.from(requiredKeys);
	if (def.catchall?._zod.def.type === "never") json.additionalProperties = false;
	else if (!def.catchall) {
		if (ctx.io === "output") json.additionalProperties = false;
	} else if (def.catchall) json.additionalProperties = process(def.catchall, ctx, {
		...params,
		path: [...params.path, "additionalProperties"]
	});
};
var unionProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	const isExclusive = def.inclusive === false;
	const options = def.options.map((x, i) => process(x, ctx, {
		...params,
		path: [
			...params.path,
			isExclusive ? "oneOf" : "anyOf",
			i
		]
	}));
	if (isExclusive) json.oneOf = options;
	else json.anyOf = options;
};
var intersectionProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	const a = process(def.left, ctx, {
		...params,
		path: [
			...params.path,
			"allOf",
			0
		]
	});
	const b = process(def.right, ctx, {
		...params,
		path: [
			...params.path,
			"allOf",
			1
		]
	});
	const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
	json.allOf = [...isSimpleIntersection(a) ? a.allOf : [a], ...isSimpleIntersection(b) ? b.allOf : [b]];
};
var nullableProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	const inner = process(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	if (ctx.target === "openapi-3.0") {
		seen.ref = def.innerType;
		json.nullable = true;
	} else json.anyOf = [inner, { type: "null" }];
};
var nonoptionalProcessor = (schema, ctx, _json, params) => {
	const def = schema._zod.def;
	process(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
};
var defaultProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	process(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	json.default = JSON.parse(JSON.stringify(def.defaultValue));
};
var prefaultProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	process(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	if (ctx.io === "input") json._prefault = JSON.parse(JSON.stringify(def.defaultValue));
};
var catchProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	process(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	let catchValue;
	try {
		catchValue = def.catchValue(void 0);
	} catch {
		throw new Error("Dynamic catch values are not supported in JSON Schema");
	}
	json.default = catchValue;
};
var pipeProcessor = (schema, ctx, _json, params) => {
	const def = schema._zod.def;
	const inIsTransform = def.in._zod.traits.has("$ZodTransform");
	const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
	process(innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = innerType;
};
var readonlyProcessor = (schema, ctx, json, params) => {
	const def = schema._zod.def;
	process(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
	json.readOnly = true;
};
var optionalProcessor = (schema, ctx, _json, params) => {
	const def = schema._zod.def;
	process(def.innerType, ctx, params);
	const seen = ctx.seen.get(schema);
	seen.ref = def.innerType;
};
//#endregion
//#region node_modules/zod/v4/classic/iso.js
var ZodISODateTime = /* @__PURE__ */ $constructor("ZodISODateTime", (inst, def) => {
	$ZodISODateTime.init(inst, def);
	ZodStringFormat.init(inst, def);
});
function datetime(params) {
	return /* @__PURE__ */ _isoDateTime(ZodISODateTime, params);
}
var ZodISODate = /* @__PURE__ */ $constructor("ZodISODate", (inst, def) => {
	$ZodISODate.init(inst, def);
	ZodStringFormat.init(inst, def);
});
function date(params) {
	return /* @__PURE__ */ _isoDate(ZodISODate, params);
}
var ZodISOTime = /* @__PURE__ */ $constructor("ZodISOTime", (inst, def) => {
	$ZodISOTime.init(inst, def);
	ZodStringFormat.init(inst, def);
});
function time(params) {
	return /* @__PURE__ */ _isoTime(ZodISOTime, params);
}
var ZodISODuration = /* @__PURE__ */ $constructor("ZodISODuration", (inst, def) => {
	$ZodISODuration.init(inst, def);
	ZodStringFormat.init(inst, def);
});
function duration(params) {
	return /* @__PURE__ */ _isoDuration(ZodISODuration, params);
}
//#endregion
//#region node_modules/zod/v4/classic/errors.js
var initializer = (inst, issues) => {
	$ZodError.init(inst, issues);
	inst.name = "ZodError";
	Object.defineProperties(inst, {
		format: { value: (mapper) => formatError(inst, mapper) },
		flatten: { value: (mapper) => flattenError(inst, mapper) },
		addIssue: { value: (issue) => {
			inst.issues.push(issue);
			inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
		} },
		addIssues: { value: (issues) => {
			inst.issues.push(...issues);
			inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
		} },
		isEmpty: { get() {
			return inst.issues.length === 0;
		} }
	});
};
var ZodRealError = /* @__PURE__ */ $constructor("ZodError", initializer, { Parent: Error });
//#endregion
//#region node_modules/zod/v4/classic/parse.js
var parse = /* @__PURE__ */ _parse(ZodRealError);
var parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
var safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
var safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
var encode = /* @__PURE__ */ _encode(ZodRealError);
var decode = /* @__PURE__ */ _decode(ZodRealError);
var encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
var decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
var safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
var safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
var safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
var safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);
//#endregion
//#region node_modules/zod/v4/classic/schemas.js
var _installedGroups = /* @__PURE__ */ new WeakMap();
function _installLazyMethods(inst, group, methods) {
	const proto = Object.getPrototypeOf(inst);
	let installed = _installedGroups.get(proto);
	if (!installed) {
		installed = /* @__PURE__ */ new Set();
		_installedGroups.set(proto, installed);
	}
	if (installed.has(group)) return;
	installed.add(group);
	for (const key in methods) {
		const fn = methods[key];
		Object.defineProperty(proto, key, {
			configurable: true,
			enumerable: false,
			get() {
				const bound = fn.bind(this);
				Object.defineProperty(this, key, {
					configurable: true,
					writable: true,
					enumerable: true,
					value: bound
				});
				return bound;
			},
			set(v) {
				Object.defineProperty(this, key, {
					configurable: true,
					writable: true,
					enumerable: true,
					value: v
				});
			}
		});
	}
}
var ZodType = /* @__PURE__ */ $constructor("ZodType", (inst, def) => {
	$ZodType.init(inst, def);
	Object.assign(inst["~standard"], { jsonSchema: {
		input: createStandardJSONSchemaMethod(inst, "input"),
		output: createStandardJSONSchemaMethod(inst, "output")
	} });
	inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
	inst.def = def;
	inst.type = def.type;
	Object.defineProperty(inst, "_def", { value: def });
	inst.parse = (data, params) => parse(inst, data, params, { callee: inst.parse });
	inst.safeParse = (data, params) => safeParse(inst, data, params);
	inst.parseAsync = async (data, params) => parseAsync(inst, data, params, { callee: inst.parseAsync });
	inst.safeParseAsync = async (data, params) => safeParseAsync(inst, data, params);
	inst.spa = inst.safeParseAsync;
	inst.encode = (data, params) => encode(inst, data, params);
	inst.decode = (data, params) => decode(inst, data, params);
	inst.encodeAsync = async (data, params) => encodeAsync(inst, data, params);
	inst.decodeAsync = async (data, params) => decodeAsync(inst, data, params);
	inst.safeEncode = (data, params) => safeEncode(inst, data, params);
	inst.safeDecode = (data, params) => safeDecode(inst, data, params);
	inst.safeEncodeAsync = async (data, params) => safeEncodeAsync(inst, data, params);
	inst.safeDecodeAsync = async (data, params) => safeDecodeAsync(inst, data, params);
	_installLazyMethods(inst, "ZodType", {
		check(...chks) {
			const def = this.def;
			return this.clone(mergeDefs(def, { checks: [...def.checks ?? [], ...chks.map((ch) => typeof ch === "function" ? { _zod: {
				check: ch,
				def: { check: "custom" },
				onattach: []
			} } : ch)] }), { parent: true });
		},
		with(...chks) {
			return this.check(...chks);
		},
		clone(def, params) {
			return clone(this, def, params);
		},
		brand() {
			return this;
		},
		register(reg, meta) {
			reg.add(this, meta);
			return this;
		},
		refine(check, params) {
			return this.check(refine(check, params));
		},
		superRefine(refinement, params) {
			return this.check(superRefine(refinement, params));
		},
		overwrite(fn) {
			return this.check(/* @__PURE__ */ _overwrite(fn));
		},
		optional() {
			return optional(this);
		},
		exactOptional() {
			return exactOptional(this);
		},
		nullable() {
			return nullable(this);
		},
		nullish() {
			return optional(nullable(this));
		},
		nonoptional(params) {
			return nonoptional(this, params);
		},
		array() {
			return array(this);
		},
		or(arg) {
			return union([this, arg]);
		},
		and(arg) {
			return intersection(this, arg);
		},
		transform(tx) {
			return pipe(this, transform(tx));
		},
		default(d) {
			return _default(this, d);
		},
		prefault(d) {
			return prefault(this, d);
		},
		catch(params) {
			return _catch(this, params);
		},
		pipe(target) {
			return pipe(this, target);
		},
		readonly() {
			return readonly(this);
		},
		describe(description) {
			const cl = this.clone();
			globalRegistry.add(cl, { description });
			return cl;
		},
		meta(...args) {
			if (args.length === 0) return globalRegistry.get(this);
			const cl = this.clone();
			globalRegistry.add(cl, args[0]);
			return cl;
		},
		isOptional() {
			return this.safeParse(void 0).success;
		},
		isNullable() {
			return this.safeParse(null).success;
		},
		apply(fn) {
			return fn(this);
		}
	});
	Object.defineProperty(inst, "description", {
		get() {
			return globalRegistry.get(inst)?.description;
		},
		configurable: true
	});
	return inst;
});
/** @internal */
var _ZodString = /* @__PURE__ */ $constructor("_ZodString", (inst, def) => {
	$ZodString.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
	const bag = inst._zod.bag;
	inst.format = bag.format ?? null;
	inst.minLength = bag.minimum ?? null;
	inst.maxLength = bag.maximum ?? null;
	_installLazyMethods(inst, "_ZodString", {
		regex(...args) {
			return this.check(/* @__PURE__ */ _regex(...args));
		},
		includes(...args) {
			return this.check(/* @__PURE__ */ _includes(...args));
		},
		startsWith(...args) {
			return this.check(/* @__PURE__ */ _startsWith(...args));
		},
		endsWith(...args) {
			return this.check(/* @__PURE__ */ _endsWith(...args));
		},
		min(...args) {
			return this.check(/* @__PURE__ */ _minLength(...args));
		},
		max(...args) {
			return this.check(/* @__PURE__ */ _maxLength(...args));
		},
		length(...args) {
			return this.check(/* @__PURE__ */ _length(...args));
		},
		nonempty(...args) {
			return this.check(/* @__PURE__ */ _minLength(1, ...args));
		},
		lowercase(params) {
			return this.check(/* @__PURE__ */ _lowercase(params));
		},
		uppercase(params) {
			return this.check(/* @__PURE__ */ _uppercase(params));
		},
		trim() {
			return this.check(/* @__PURE__ */ _trim());
		},
		normalize(...args) {
			return this.check(/* @__PURE__ */ _normalize(...args));
		},
		toLowerCase() {
			return this.check(/* @__PURE__ */ _toLowerCase());
		},
		toUpperCase() {
			return this.check(/* @__PURE__ */ _toUpperCase());
		},
		slugify() {
			return this.check(/* @__PURE__ */ _slugify());
		}
	});
});
var ZodString = /* @__PURE__ */ $constructor("ZodString", (inst, def) => {
	$ZodString.init(inst, def);
	_ZodString.init(inst, def);
	inst.email = (params) => inst.check(/* @__PURE__ */ _email(ZodEmail, params));
	inst.url = (params) => inst.check(/* @__PURE__ */ _url(ZodURL, params));
	inst.jwt = (params) => inst.check(/* @__PURE__ */ _jwt(ZodJWT, params));
	inst.emoji = (params) => inst.check(/* @__PURE__ */ _emoji(ZodEmoji, params));
	inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
	inst.uuid = (params) => inst.check(/* @__PURE__ */ _uuid(ZodUUID, params));
	inst.uuidv4 = (params) => inst.check(/* @__PURE__ */ _uuidv4(ZodUUID, params));
	inst.uuidv6 = (params) => inst.check(/* @__PURE__ */ _uuidv6(ZodUUID, params));
	inst.uuidv7 = (params) => inst.check(/* @__PURE__ */ _uuidv7(ZodUUID, params));
	inst.nanoid = (params) => inst.check(/* @__PURE__ */ _nanoid(ZodNanoID, params));
	inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
	inst.cuid = (params) => inst.check(/* @__PURE__ */ _cuid(ZodCUID, params));
	inst.cuid2 = (params) => inst.check(/* @__PURE__ */ _cuid2(ZodCUID2, params));
	inst.ulid = (params) => inst.check(/* @__PURE__ */ _ulid(ZodULID, params));
	inst.base64 = (params) => inst.check(/* @__PURE__ */ _base64(ZodBase64, params));
	inst.base64url = (params) => inst.check(/* @__PURE__ */ _base64url(ZodBase64URL, params));
	inst.xid = (params) => inst.check(/* @__PURE__ */ _xid(ZodXID, params));
	inst.ksuid = (params) => inst.check(/* @__PURE__ */ _ksuid(ZodKSUID, params));
	inst.ipv4 = (params) => inst.check(/* @__PURE__ */ _ipv4(ZodIPv4, params));
	inst.ipv6 = (params) => inst.check(/* @__PURE__ */ _ipv6(ZodIPv6, params));
	inst.cidrv4 = (params) => inst.check(/* @__PURE__ */ _cidrv4(ZodCIDRv4, params));
	inst.cidrv6 = (params) => inst.check(/* @__PURE__ */ _cidrv6(ZodCIDRv6, params));
	inst.e164 = (params) => inst.check(/* @__PURE__ */ _e164(ZodE164, params));
	inst.datetime = (params) => inst.check(datetime(params));
	inst.date = (params) => inst.check(date(params));
	inst.time = (params) => inst.check(time(params));
	inst.duration = (params) => inst.check(duration(params));
});
function string(params) {
	return /* @__PURE__ */ _string(ZodString, params);
}
var ZodStringFormat = /* @__PURE__ */ $constructor("ZodStringFormat", (inst, def) => {
	$ZodStringFormat.init(inst, def);
	_ZodString.init(inst, def);
});
var ZodEmail = /* @__PURE__ */ $constructor("ZodEmail", (inst, def) => {
	$ZodEmail.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodGUID = /* @__PURE__ */ $constructor("ZodGUID", (inst, def) => {
	$ZodGUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodUUID = /* @__PURE__ */ $constructor("ZodUUID", (inst, def) => {
	$ZodUUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodURL = /* @__PURE__ */ $constructor("ZodURL", (inst, def) => {
	$ZodURL.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodEmoji = /* @__PURE__ */ $constructor("ZodEmoji", (inst, def) => {
	$ZodEmoji.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodNanoID = /* @__PURE__ */ $constructor("ZodNanoID", (inst, def) => {
	$ZodNanoID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
/**
* @deprecated CUID v1 is deprecated by its authors due to information leakage
* (timestamps embedded in the id). Use {@link ZodCUID2} instead.
* See https://github.com/paralleldrive/cuid.
*/
var ZodCUID = /* @__PURE__ */ $constructor("ZodCUID", (inst, def) => {
	$ZodCUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodCUID2 = /* @__PURE__ */ $constructor("ZodCUID2", (inst, def) => {
	$ZodCUID2.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodULID = /* @__PURE__ */ $constructor("ZodULID", (inst, def) => {
	$ZodULID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodXID = /* @__PURE__ */ $constructor("ZodXID", (inst, def) => {
	$ZodXID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodKSUID = /* @__PURE__ */ $constructor("ZodKSUID", (inst, def) => {
	$ZodKSUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodIPv4 = /* @__PURE__ */ $constructor("ZodIPv4", (inst, def) => {
	$ZodIPv4.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodIPv6 = /* @__PURE__ */ $constructor("ZodIPv6", (inst, def) => {
	$ZodIPv6.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodCIDRv4 = /* @__PURE__ */ $constructor("ZodCIDRv4", (inst, def) => {
	$ZodCIDRv4.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodCIDRv6 = /* @__PURE__ */ $constructor("ZodCIDRv6", (inst, def) => {
	$ZodCIDRv6.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodBase64 = /* @__PURE__ */ $constructor("ZodBase64", (inst, def) => {
	$ZodBase64.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodBase64URL = /* @__PURE__ */ $constructor("ZodBase64URL", (inst, def) => {
	$ZodBase64URL.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodE164 = /* @__PURE__ */ $constructor("ZodE164", (inst, def) => {
	$ZodE164.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodJWT = /* @__PURE__ */ $constructor("ZodJWT", (inst, def) => {
	$ZodJWT.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodNumber = /* @__PURE__ */ $constructor("ZodNumber", (inst, def) => {
	$ZodNumber.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
	_installLazyMethods(inst, "ZodNumber", {
		gt(value, params) {
			return this.check(/* @__PURE__ */ _gt(value, params));
		},
		gte(value, params) {
			return this.check(/* @__PURE__ */ _gte(value, params));
		},
		min(value, params) {
			return this.check(/* @__PURE__ */ _gte(value, params));
		},
		lt(value, params) {
			return this.check(/* @__PURE__ */ _lt(value, params));
		},
		lte(value, params) {
			return this.check(/* @__PURE__ */ _lte(value, params));
		},
		max(value, params) {
			return this.check(/* @__PURE__ */ _lte(value, params));
		},
		int(params) {
			return this.check(int(params));
		},
		safe(params) {
			return this.check(int(params));
		},
		positive(params) {
			return this.check(/* @__PURE__ */ _gt(0, params));
		},
		nonnegative(params) {
			return this.check(/* @__PURE__ */ _gte(0, params));
		},
		negative(params) {
			return this.check(/* @__PURE__ */ _lt(0, params));
		},
		nonpositive(params) {
			return this.check(/* @__PURE__ */ _lte(0, params));
		},
		multipleOf(value, params) {
			return this.check(/* @__PURE__ */ _multipleOf(value, params));
		},
		step(value, params) {
			return this.check(/* @__PURE__ */ _multipleOf(value, params));
		},
		finite() {
			return this;
		}
	});
	const bag = inst._zod.bag;
	inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
	inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
	inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? .5);
	inst.isFinite = true;
	inst.format = bag.format ?? null;
});
function number(params) {
	return /* @__PURE__ */ _number(ZodNumber, params);
}
var ZodNumberFormat = /* @__PURE__ */ $constructor("ZodNumberFormat", (inst, def) => {
	$ZodNumberFormat.init(inst, def);
	ZodNumber.init(inst, def);
});
function int(params) {
	return /* @__PURE__ */ _int(ZodNumberFormat, params);
}
var ZodUnknown = /* @__PURE__ */ $constructor("ZodUnknown", (inst, def) => {
	$ZodUnknown.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => void 0;
});
function unknown() {
	return /* @__PURE__ */ _unknown(ZodUnknown);
}
var ZodNever = /* @__PURE__ */ $constructor("ZodNever", (inst, def) => {
	$ZodNever.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
});
function never(params) {
	return /* @__PURE__ */ _never(ZodNever, params);
}
var ZodArray = /* @__PURE__ */ $constructor("ZodArray", (inst, def) => {
	$ZodArray.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
	inst.element = def.element;
	_installLazyMethods(inst, "ZodArray", {
		min(n, params) {
			return this.check(/* @__PURE__ */ _minLength(n, params));
		},
		nonempty(params) {
			return this.check(/* @__PURE__ */ _minLength(1, params));
		},
		max(n, params) {
			return this.check(/* @__PURE__ */ _maxLength(n, params));
		},
		length(n, params) {
			return this.check(/* @__PURE__ */ _length(n, params));
		},
		unwrap() {
			return this.element;
		}
	});
});
function array(element, params) {
	return /* @__PURE__ */ _array(ZodArray, element, params);
}
var ZodObject = /* @__PURE__ */ $constructor("ZodObject", (inst, def) => {
	$ZodObjectJIT.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
	defineLazy(inst, "shape", () => {
		return def.shape;
	});
	_installLazyMethods(inst, "ZodObject", {
		keyof() {
			return _enum(Object.keys(this._zod.def.shape));
		},
		catchall(catchall) {
			return this.clone({
				...this._zod.def,
				catchall
			});
		},
		passthrough() {
			return this.clone({
				...this._zod.def,
				catchall: unknown()
			});
		},
		loose() {
			return this.clone({
				...this._zod.def,
				catchall: unknown()
			});
		},
		strict() {
			return this.clone({
				...this._zod.def,
				catchall: never()
			});
		},
		strip() {
			return this.clone({
				...this._zod.def,
				catchall: void 0
			});
		},
		extend(incoming) {
			return extend(this, incoming);
		},
		safeExtend(incoming) {
			return safeExtend(this, incoming);
		},
		merge(other) {
			return merge(this, other);
		},
		pick(mask) {
			return pick(this, mask);
		},
		omit(mask) {
			return omit(this, mask);
		},
		partial(...args) {
			return partial(ZodOptional, this, args[0]);
		},
		required(...args) {
			return required(ZodNonOptional, this, args[0]);
		}
	});
});
function object(shape, params) {
	return new ZodObject({
		type: "object",
		shape: shape ?? {},
		...normalizeParams(params)
	});
}
var ZodUnion = /* @__PURE__ */ $constructor("ZodUnion", (inst, def) => {
	$ZodUnion.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
	inst.options = def.options;
});
function union(options, params) {
	return new ZodUnion({
		type: "union",
		options,
		...normalizeParams(params)
	});
}
var ZodIntersection = /* @__PURE__ */ $constructor("ZodIntersection", (inst, def) => {
	$ZodIntersection.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
});
function intersection(left, right) {
	return new ZodIntersection({
		type: "intersection",
		left,
		right
	});
}
var ZodEnum = /* @__PURE__ */ $constructor("ZodEnum", (inst, def) => {
	$ZodEnum.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
	inst.enum = def.entries;
	inst.options = Object.values(def.entries);
	const keys = new Set(Object.keys(def.entries));
	inst.extract = (values, params) => {
		const newEntries = {};
		for (const value of values) if (keys.has(value)) newEntries[value] = def.entries[value];
		else throw new Error(`Key ${value} not found in enum`);
		return new ZodEnum({
			...def,
			checks: [],
			...normalizeParams(params),
			entries: newEntries
		});
	};
	inst.exclude = (values, params) => {
		const newEntries = { ...def.entries };
		for (const value of values) if (keys.has(value)) delete newEntries[value];
		else throw new Error(`Key ${value} not found in enum`);
		return new ZodEnum({
			...def,
			checks: [],
			...normalizeParams(params),
			entries: newEntries
		});
	};
});
function _enum(values, params) {
	return new ZodEnum({
		type: "enum",
		entries: Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values,
		...normalizeParams(params)
	});
}
var ZodLiteral = /* @__PURE__ */ $constructor("ZodLiteral", (inst, def) => {
	$ZodLiteral.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => literalProcessor(inst, ctx, json, params);
	inst.values = new Set(def.values);
	Object.defineProperty(inst, "value", { get() {
		if (def.values.length > 1) throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
		return def.values[0];
	} });
});
function literal(value, params) {
	return new ZodLiteral({
		type: "literal",
		values: Array.isArray(value) ? value : [value],
		...normalizeParams(params)
	});
}
var ZodTransform = /* @__PURE__ */ $constructor("ZodTransform", (inst, def) => {
	$ZodTransform.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
	inst._zod.parse = (payload, _ctx) => {
		if (_ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
		payload.addIssue = (issue$1) => {
			if (typeof issue$1 === "string") payload.issues.push(issue(issue$1, payload.value, def));
			else {
				const _issue = issue$1;
				if (_issue.fatal) _issue.continue = false;
				_issue.code ?? (_issue.code = "custom");
				_issue.input ?? (_issue.input = payload.value);
				_issue.inst ?? (_issue.inst = inst);
				payload.issues.push(issue(_issue));
			}
		};
		const output = def.transform(payload.value, payload);
		if (output instanceof Promise) return output.then((output) => {
			payload.value = output;
			payload.fallback = true;
			return payload;
		});
		payload.value = output;
		payload.fallback = true;
		return payload;
	};
});
function transform(fn) {
	return new ZodTransform({
		type: "transform",
		transform: fn
	});
}
var ZodOptional = /* @__PURE__ */ $constructor("ZodOptional", (inst, def) => {
	$ZodOptional.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function optional(innerType) {
	return new ZodOptional({
		type: "optional",
		innerType
	});
}
var ZodExactOptional = /* @__PURE__ */ $constructor("ZodExactOptional", (inst, def) => {
	$ZodExactOptional.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function exactOptional(innerType) {
	return new ZodExactOptional({
		type: "optional",
		innerType
	});
}
var ZodNullable = /* @__PURE__ */ $constructor("ZodNullable", (inst, def) => {
	$ZodNullable.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function nullable(innerType) {
	return new ZodNullable({
		type: "nullable",
		innerType
	});
}
var ZodDefault = /* @__PURE__ */ $constructor("ZodDefault", (inst, def) => {
	$ZodDefault.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
	inst.removeDefault = inst.unwrap;
});
function _default(innerType, defaultValue) {
	return new ZodDefault({
		type: "default",
		innerType,
		get defaultValue() {
			return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
		}
	});
}
var ZodPrefault = /* @__PURE__ */ $constructor("ZodPrefault", (inst, def) => {
	$ZodPrefault.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function prefault(innerType, defaultValue) {
	return new ZodPrefault({
		type: "prefault",
		innerType,
		get defaultValue() {
			return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
		}
	});
}
var ZodNonOptional = /* @__PURE__ */ $constructor("ZodNonOptional", (inst, def) => {
	$ZodNonOptional.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function nonoptional(innerType, params) {
	return new ZodNonOptional({
		type: "nonoptional",
		innerType,
		...normalizeParams(params)
	});
}
var ZodCatch = /* @__PURE__ */ $constructor("ZodCatch", (inst, def) => {
	$ZodCatch.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
	inst.removeCatch = inst.unwrap;
});
function _catch(innerType, catchValue) {
	return new ZodCatch({
		type: "catch",
		innerType,
		catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
	});
}
var ZodPipe = /* @__PURE__ */ $constructor("ZodPipe", (inst, def) => {
	$ZodPipe.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
	inst.in = def.in;
	inst.out = def.out;
});
function pipe(in_, out) {
	return new ZodPipe({
		type: "pipe",
		in: in_,
		out
	});
}
var ZodReadonly = /* @__PURE__ */ $constructor("ZodReadonly", (inst, def) => {
	$ZodReadonly.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
	inst.unwrap = () => inst._zod.def.innerType;
});
function readonly(innerType) {
	return new ZodReadonly({
		type: "readonly",
		innerType
	});
}
var ZodCustom = /* @__PURE__ */ $constructor("ZodCustom", (inst, def) => {
	$ZodCustom.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
});
function refine(fn, _params = {}) {
	return /* @__PURE__ */ _refine(ZodCustom, fn, _params);
}
function superRefine(fn, params) {
	return /* @__PURE__ */ _superRefine(fn, params);
}
//#endregion
//#region packages/cosmos/src/domain.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var CosmosNetwork = string().regex(/^cosmos:[a-zA-Z0-9._-]{1,80}$/);
var Amount = string().regex(/^[1-9]\d*$/).max(60), Nonce = string().regex(/^[A-Za-z0-9_-]{16,128}$/);
var CosmosRequirementsSchema = object({
	scheme: literal("exact"),
	network: CosmosNetwork,
	asset: string().min(1).max(160),
	amount: Amount,
	payTo: string().min(8).max(160),
	resource: string().url().max(2048),
	maxTimeoutSeconds: number().int().min(5).max(3600),
	extra: object({
		chainId: string().min(1).max(100),
		nonce: Nonce,
		resourceHash: string().length(64),
		expiresAt: number().int().positive(),
		transferType: _enum(["bank", "ibc"]),
		sourceChannel: string().regex(/^channel-\d+$/).optional(),
		feeGranter: string().max(160).optional(),
		agentId: string().uuid().optional(),
		policyId: string().uuid().optional()
	}).strict()
}).strict();
object({
	x402Version: literal(2),
	scheme: literal("exact"),
	network: CosmosNetwork,
	payload: object({
		txBytes: string().min(32).max(5e5),
		signer: string().min(8).max(160),
		paymentId: string().regex(/^[A-Za-z0-9_-]{16,128}$/),
		accountNumber: string().regex(/^\d+$/),
		createdAt: number().int().positive()
	}).strict()
}).strict();
//#endregion
//#region node_modules/cosmjs-types/utf8.js
/**
* This file and any referenced files were automatically generated by @hyperweb/telescope@1.17.4
* DO NOT MODIFY BY HAND. Instead, download the latest proto files for your chain
* and run the transpile command or npm scripts command that is used to regenerate this bundle.
*/
var require_utf8$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.utf8Length = utf8Length;
	exports.utf8Read = utf8Read;
	exports.utf8Write = utf8Write;
	/**
	* Calculates the UTF8 byte length of a string.
	* @param {string} string String
	* @returns {number} Byte length
	*/
	function utf8Length(str) {
		let len = 0, c = 0;
		for (let i = 0; i < str.length; ++i) {
			c = str.charCodeAt(i);
			if (c < 128) len += 1;
			else if (c < 2048) len += 2;
			else if ((c & 64512) === 55296 && (str.charCodeAt(i + 1) & 64512) === 56320) {
				++i;
				len += 4;
			} else len += 3;
		}
		return len;
	}
	/**
	* Reads UTF8 bytes as a string.
	* @param {Uint8Array} buffer Source buffer
	* @param {number} start Source start
	* @param {number} end Source end
	* @returns {string} String read
	*/
	function utf8Read(buffer, start, end) {
		if (end - start < 1) return "";
		const chunk = [];
		let parts = [], i = 0, t;
		while (start < end) {
			t = buffer[start++];
			if (t < 128) chunk[i++] = t;
			else if (t > 191 && t < 224) chunk[i++] = (t & 31) << 6 | buffer[start++] & 63;
			else if (t > 239 && t < 365) {
				t = ((t & 7) << 18 | (buffer[start++] & 63) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63) - 65536;
				chunk[i++] = 55296 + (t >> 10);
				chunk[i++] = 56320 + (t & 1023);
			} else chunk[i++] = (t & 15) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63;
			if (i > 8191) {
				(parts || (parts = [])).push(String.fromCharCode(...chunk));
				i = 0;
			}
		}
		if (parts) {
			if (i) parts.push(String.fromCharCode(...chunk.slice(0, i)));
			return parts.join("");
		}
		return String.fromCharCode(...chunk.slice(0, i));
	}
	/**
	* Writes a string as UTF8 bytes.
	* @param {string} string Source string
	* @param {Uint8Array} buffer Destination buffer
	* @param {number} offset Destination offset
	* @returns {number} Bytes written
	*/
	function utf8Write(str, buffer, offset) {
		const start = offset;
		let c1, c2;
		for (let i = 0; i < str.length; ++i) {
			c1 = str.charCodeAt(i);
			if (c1 < 128) buffer[offset++] = c1;
			else if (c1 < 2048) {
				buffer[offset++] = c1 >> 6 | 192;
				buffer[offset++] = c1 & 63 | 128;
			} else if ((c1 & 64512) === 55296 && ((c2 = str.charCodeAt(i + 1)) & 64512) === 56320) {
				c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
				++i;
				buffer[offset++] = c1 >> 18 | 240;
				buffer[offset++] = c1 >> 12 & 63 | 128;
				buffer[offset++] = c1 >> 6 & 63 | 128;
				buffer[offset++] = c1 & 63 | 128;
			} else {
				buffer[offset++] = c1 >> 12 | 224;
				buffer[offset++] = c1 >> 6 & 63 | 128;
				buffer[offset++] = c1 & 63 | 128;
			}
		}
		return offset - start;
	}
}));
//#endregion
//#region node_modules/cosmjs-types/varint.js
var require_varint = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* This file and any referenced files were automatically generated by @hyperweb/telescope@1.17.4
	* DO NOT MODIFY BY HAND. Instead, download the latest proto files for your chain
	* and run the transpile command or npm scripts command that is used to regenerate this bundle.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.varint64read = varint64read;
	exports.varint64write = varint64write;
	exports.int64FromString = int64FromString;
	exports.int64ToString = int64ToString;
	exports.uInt64ToString = uInt64ToString;
	exports.varint32write = varint32write;
	exports.varint32read = varint32read;
	exports.zzEncode = zzEncode;
	exports.zzDecode = zzDecode;
	exports.readUInt32 = readUInt32;
	exports.readInt32 = readInt32;
	exports.writeVarint32 = writeVarint32;
	exports.writeVarint64 = writeVarint64;
	exports.int64Length = int64Length;
	exports.writeFixed32 = writeFixed32;
	exports.writeByte = writeByte;
	/**
	* Read a 64 bit varint as two JS numbers.
	*
	* Returns tuple:
	* [0]: low bits
	* [1]: high bits
	*
	* Copyright 2008 Google Inc.  All rights reserved.
	*
	* See https://github.com/protocolbuffers/protobuf/blob/8a71927d74a4ce34efe2d8769fda198f52d20d12/js/experimental/runtime/kernel/buffer_decoder.js#L175
	*/
	function varint64read() {
		let lowBits = 0;
		let highBits = 0;
		for (let shift = 0; shift < 28; shift += 7) {
			let b = this.buf[this.pos++];
			lowBits |= (b & 127) << shift;
			if ((b & 128) == 0) {
				this.assertBounds();
				return [lowBits, highBits];
			}
		}
		let middleByte = this.buf[this.pos++];
		lowBits |= (middleByte & 15) << 28;
		highBits = (middleByte & 112) >> 4;
		if ((middleByte & 128) == 0) {
			this.assertBounds();
			return [lowBits, highBits];
		}
		for (let shift = 3; shift <= 31; shift += 7) {
			let b = this.buf[this.pos++];
			highBits |= (b & 127) << shift;
			if ((b & 128) == 0) {
				this.assertBounds();
				return [lowBits, highBits];
			}
		}
		throw new Error("invalid varint");
	}
	/**
	* Write a 64 bit varint, given as two JS numbers, to the given bytes array.
	*
	* Copyright 2008 Google Inc.  All rights reserved.
	*
	* See https://github.com/protocolbuffers/protobuf/blob/8a71927d74a4ce34efe2d8769fda198f52d20d12/js/experimental/runtime/kernel/writer.js#L344
	*/
	function varint64write(lo, hi, bytes) {
		for (let i = 0; i < 28; i = i + 7) {
			const shift = lo >>> i;
			const hasNext = !(shift >>> 7 == 0 && hi == 0);
			const byte = (hasNext ? shift | 128 : shift) & 255;
			bytes.push(byte);
			if (!hasNext) return;
		}
		const splitBits = lo >>> 28 & 15 | (hi & 7) << 4;
		const hasMoreBits = !(hi >> 3 == 0);
		bytes.push((hasMoreBits ? splitBits | 128 : splitBits) & 255);
		if (!hasMoreBits) return;
		for (let i = 3; i < 31; i = i + 7) {
			const shift = hi >>> i;
			const hasNext = !(shift >>> 7 == 0);
			const byte = (hasNext ? shift | 128 : shift) & 255;
			bytes.push(byte);
			if (!hasNext) return;
		}
		bytes.push(hi >>> 31 & 1);
	}
	var TWO_PWR_32_DBL = 4294967296;
	/**
	* Parse decimal string of 64 bit integer value as two JS numbers.
	*
	* Copyright 2008 Google Inc.  All rights reserved.
	*
	* See https://github.com/protocolbuffers/protobuf-javascript/blob/a428c58273abad07c66071d9753bc4d1289de426/experimental/runtime/int64.js#L10
	*/
	function int64FromString(dec) {
		const minus = dec[0] === "-";
		if (minus) dec = dec.slice(1);
		const base = 1e6;
		let lowBits = 0;
		let highBits = 0;
		function add1e6digit(begin, end) {
			const digit1e6 = Number(dec.slice(begin, end));
			highBits *= base;
			lowBits = lowBits * base + digit1e6;
			if (lowBits >= TWO_PWR_32_DBL) {
				highBits = highBits + (lowBits / TWO_PWR_32_DBL | 0);
				lowBits = lowBits % TWO_PWR_32_DBL;
			}
		}
		add1e6digit(-24, -18);
		add1e6digit(-18, -12);
		add1e6digit(-12, -6);
		add1e6digit(-6);
		return minus ? negate(lowBits, highBits) : newBits(lowBits, highBits);
	}
	/**
	* Losslessly converts a 64-bit signed integer in 32:32 split representation
	* into a decimal string.
	*
	* Copyright 2008 Google Inc.  All rights reserved.
	*
	* See https://github.com/protocolbuffers/protobuf-javascript/blob/a428c58273abad07c66071d9753bc4d1289de426/experimental/runtime/int64.js#L10
	*/
	function int64ToString(lo, hi) {
		let bits = newBits(lo, hi);
		const negative = bits.hi & 2147483648;
		if (negative) bits = negate(bits.lo, bits.hi);
		const result = uInt64ToString(bits.lo, bits.hi);
		return negative ? "-" + result : result;
	}
	/**
	* Losslessly converts a 64-bit unsigned integer in 32:32 split representation
	* into a decimal string.
	*
	* Copyright 2008 Google Inc.  All rights reserved.
	*
	* See https://github.com/protocolbuffers/protobuf-javascript/blob/a428c58273abad07c66071d9753bc4d1289de426/experimental/runtime/int64.js#L10
	*/
	function uInt64ToString(lo, hi) {
		({lo, hi} = toUnsigned(lo, hi));
		if (hi <= 2097151) return String(TWO_PWR_32_DBL * hi + lo);
		const low = lo & 16777215;
		const mid = (lo >>> 24 | hi << 8) & 16777215;
		const high = hi >> 16 & 65535;
		let digitA = low + mid * 6777216 + high * 6710656;
		let digitB = mid + high * 8147497;
		let digitC = high * 2;
		const base = 1e7;
		if (digitA >= base) {
			digitB += Math.floor(digitA / base);
			digitA %= base;
		}
		if (digitB >= base) {
			digitC += Math.floor(digitB / base);
			digitB %= base;
		}
		return digitC.toString() + decimalFrom1e7WithLeadingZeros(digitB) + decimalFrom1e7WithLeadingZeros(digitA);
	}
	function toUnsigned(lo, hi) {
		return {
			lo: lo >>> 0,
			hi: hi >>> 0
		};
	}
	function newBits(lo, hi) {
		return {
			lo: lo | 0,
			hi: hi | 0
		};
	}
	/**
	* Returns two's compliment negation of input.
	* @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators#Signed_32-bit_integers
	*/
	function negate(lowBits, highBits) {
		highBits = ~highBits;
		if (lowBits) lowBits = ~lowBits + 1;
		else highBits += 1;
		return newBits(lowBits, highBits);
	}
	/**
	* Returns decimal representation of digit1e7 with leading zeros.
	*/
	var decimalFrom1e7WithLeadingZeros = (digit1e7) => {
		const partial = String(digit1e7);
		return "0000000".slice(partial.length) + partial;
	};
	/**
	* Write a 32 bit varint, signed or unsigned. Same as `varint64write(0, value, bytes)`
	*
	* Copyright 2008 Google Inc.  All rights reserved.
	*
	* See https://github.com/protocolbuffers/protobuf/blob/1b18833f4f2a2f681f4e4a25cdf3b0a43115ec26/js/binary/encoder.js#L144
	*/
	function varint32write(value, bytes) {
		if (value >= 0) {
			while (value > 127) {
				bytes.push(value & 127 | 128);
				value = value >>> 7;
			}
			bytes.push(value);
		} else {
			for (let i = 0; i < 9; i++) {
				bytes.push(value & 127 | 128);
				value = value >> 7;
			}
			bytes.push(1);
		}
	}
	/**
	* Read an unsigned 32 bit varint.
	*
	* See https://github.com/protocolbuffers/protobuf/blob/8a71927d74a4ce34efe2d8769fda198f52d20d12/js/experimental/runtime/kernel/buffer_decoder.js#L220
	*/
	function varint32read() {
		let b = this.buf[this.pos++];
		let result = b & 127;
		if ((b & 128) == 0) {
			this.assertBounds();
			return result;
		}
		b = this.buf[this.pos++];
		result |= (b & 127) << 7;
		if ((b & 128) == 0) {
			this.assertBounds();
			return result;
		}
		b = this.buf[this.pos++];
		result |= (b & 127) << 14;
		if ((b & 128) == 0) {
			this.assertBounds();
			return result;
		}
		b = this.buf[this.pos++];
		result |= (b & 127) << 21;
		if ((b & 128) == 0) {
			this.assertBounds();
			return result;
		}
		b = this.buf[this.pos++];
		result |= (b & 15) << 28;
		for (let readBytes = 5; (b & 128) !== 0 && readBytes < 10; readBytes++) b = this.buf[this.pos++];
		if ((b & 128) != 0) throw new Error("invalid varint");
		this.assertBounds();
		return result >>> 0;
	}
	/**
	* encode zig zag
	*/
	function zzEncode(lo, hi) {
		let mask = hi >> 31;
		hi = ((hi << 1 | lo >>> 31) ^ mask) >>> 0;
		lo = (lo << 1 ^ mask) >>> 0;
		return [lo, hi];
	}
	/**
	* decode zig zag
	*/
	function zzDecode(lo, hi) {
		let mask = -(lo & 1);
		lo = ((lo >>> 1 | hi << 31) ^ mask) >>> 0;
		hi = (hi >>> 1 ^ mask) >>> 0;
		return [lo, hi];
	}
	/**
	* unsigned int32 without moving pos.
	*/
	function readUInt32(buf, pos) {
		return (buf[pos] | buf[pos + 1] << 8 | buf[pos + 2] << 16) + buf[pos + 3] * 16777216;
	}
	/**
	* signed int32 without moving pos.
	*/
	function readInt32(buf, pos) {
		return (buf[pos] | buf[pos + 1] << 8 | buf[pos + 2] << 16) + (buf[pos + 3] << 24);
	}
	/**
	* writing varint32 to pos
	*/
	function writeVarint32(val, buf, pos) {
		while (val > 127) {
			buf[pos++] = val & 127 | 128;
			val >>>= 7;
		}
		buf[pos] = val;
	}
	/**
	* writing varint64 to pos
	*/
	function writeVarint64(val, buf, pos) {
		while (val.hi) {
			buf[pos++] = val.lo & 127 | 128;
			val.lo = (val.lo >>> 7 | val.hi << 25) >>> 0;
			val.hi >>>= 7;
		}
		while (val.lo > 127) {
			buf[pos++] = val.lo & 127 | 128;
			val.lo = val.lo >>> 7;
		}
		buf[pos++] = val.lo;
	}
	function int64Length(lo, hi) {
		let part0 = lo, part1 = (lo >>> 28 | hi << 4) >>> 0, part2 = hi >>> 24;
		return part2 === 0 ? part1 === 0 ? part0 < 16384 ? part0 < 128 ? 1 : 2 : part0 < 2097152 ? 3 : 4 : part1 < 16384 ? part1 < 128 ? 5 : 6 : part1 < 2097152 ? 7 : 8 : part2 < 128 ? 9 : 10;
	}
	function writeFixed32(val, buf, pos) {
		buf[pos] = val & 255;
		buf[pos + 1] = val >>> 8 & 255;
		buf[pos + 2] = val >>> 16 & 255;
		buf[pos + 3] = val >>> 24;
	}
	function writeByte(val, buf, pos) {
		buf[pos] = val & 255;
	}
}));
//#endregion
//#region node_modules/cosmjs-types/binary.js
var require_binary = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* This file and any referenced files were automatically generated by @hyperweb/telescope@1.17.4
	* DO NOT MODIFY BY HAND. Instead, download the latest proto files for your chain
	* and run the transpile command or npm scripts command that is used to regenerate this bundle.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BinaryWriter = exports.BinaryReader = exports.WireType = void 0;
	var utf8_1 = require_utf8$1();
	var varint_1 = require_varint();
	var WireType;
	(function(WireType) {
		WireType[WireType["Varint"] = 0] = "Varint";
		WireType[WireType["Fixed64"] = 1] = "Fixed64";
		WireType[WireType["Bytes"] = 2] = "Bytes";
		WireType[WireType["Fixed32"] = 5] = "Fixed32";
	})(WireType || (exports.WireType = WireType = {}));
	var BinaryReader = class {
		buf;
		pos;
		type;
		len;
		assertBounds() {
			if (this.pos > this.len) throw new RangeError("premature EOF");
		}
		constructor(buf) {
			this.buf = buf ? new Uint8Array(buf) : new Uint8Array(0);
			this.pos = 0;
			this.type = 0;
			this.len = this.buf.length;
		}
		tag() {
			const tag = this.uint32(), fieldNo = tag >>> 3, wireType = tag & 7;
			if (fieldNo <= 0 || wireType < 0 || wireType > 5) throw new Error("illegal tag: field no " + fieldNo + " wire type " + wireType);
			return [
				fieldNo,
				wireType,
				tag
			];
		}
		skip(length) {
			if (typeof length === "number") {
				if (this.pos + length > this.len) throw indexOutOfRange(this, length);
				this.pos += length;
			} else do
				if (this.pos >= this.len) throw indexOutOfRange(this);
			while (this.buf[this.pos++] & 128);
			return this;
		}
		skipType(wireType) {
			switch (wireType) {
				case WireType.Varint:
					this.skip();
					break;
				case WireType.Fixed64:
					this.skip(8);
					break;
				case WireType.Bytes:
					this.skip(this.uint32());
					break;
				case 3:
					while ((wireType = this.uint32() & 7) !== 4) this.skipType(wireType);
					break;
				case WireType.Fixed32:
					this.skip(4);
					break;
				/* istanbul ignore next */
				default: throw Error("invalid wire type " + wireType + " at offset " + this.pos);
			}
			return this;
		}
		uint32() {
			return varint_1.varint32read.bind(this)();
		}
		int32() {
			return this.uint32() | 0;
		}
		sint32() {
			const num = this.uint32();
			return num % 2 === 1 ? (num + 1) / -2 : num / 2;
		}
		fixed32() {
			const val = (0, varint_1.readUInt32)(this.buf, this.pos);
			this.pos += 4;
			return val;
		}
		sfixed32() {
			const val = (0, varint_1.readInt32)(this.buf, this.pos);
			this.pos += 4;
			return val;
		}
		int64() {
			const [lo, hi] = varint_1.varint64read.bind(this)();
			return BigInt((0, varint_1.int64ToString)(lo, hi));
		}
		uint64() {
			const [lo, hi] = varint_1.varint64read.bind(this)();
			return BigInt((0, varint_1.uInt64ToString)(lo, hi));
		}
		sint64() {
			let [lo, hi] = varint_1.varint64read.bind(this)();
			[lo, hi] = (0, varint_1.zzDecode)(lo, hi);
			return BigInt((0, varint_1.int64ToString)(lo, hi));
		}
		fixed64() {
			const lo = this.sfixed32();
			const hi = this.sfixed32();
			return BigInt((0, varint_1.uInt64ToString)(lo, hi));
		}
		sfixed64() {
			const lo = this.sfixed32();
			const hi = this.sfixed32();
			return BigInt((0, varint_1.int64ToString)(lo, hi));
		}
		float() {
			throw new Error("float not supported");
		}
		double() {
			throw new Error("double not supported");
		}
		bool() {
			const [lo, hi] = varint_1.varint64read.bind(this)();
			return lo !== 0 || hi !== 0;
		}
		bytes() {
			const len = this.uint32(), start = this.pos;
			this.pos += len;
			this.assertBounds();
			return this.buf.subarray(start, start + len);
		}
		string() {
			const bytes = this.bytes();
			return (0, utf8_1.utf8Read)(bytes, 0, bytes.length);
		}
	};
	exports.BinaryReader = BinaryReader;
	var Op = class {
		fn;
		len;
		val;
		next;
		constructor(fn, len, val) {
			this.fn = fn;
			this.len = len;
			this.val = val;
		}
		proceed(buf, pos) {
			if (this.fn) this.fn(this.val, buf, pos);
		}
	};
	var State = class {
		head;
		tail;
		len;
		next;
		constructor(writer) {
			this.head = writer.head;
			this.tail = writer.tail;
			this.len = writer.len;
			this.next = writer.states;
		}
	};
	exports.BinaryWriter = class BinaryWriter {
		len = 0;
		head;
		tail;
		states;
		constructor() {
			this.head = new Op(null, 0, 0);
			this.tail = this.head;
			this.states = null;
		}
		static create() {
			return new BinaryWriter();
		}
		static alloc(size) {
			if (typeof Uint8Array !== "undefined") return pool((size) => new Uint8Array(size), Uint8Array.prototype.subarray)(size);
			else return new Array(size);
		}
		_push(fn, len, val) {
			this.tail = this.tail.next = new Op(fn, len, val);
			this.len += len;
			return this;
		}
		finish() {
			let head = this.head.next, pos = 0;
			const buf = BinaryWriter.alloc(this.len);
			while (head) {
				head.proceed(buf, pos);
				pos += head.len;
				head = head.next;
			}
			return buf;
		}
		fork() {
			this.states = new State(this);
			this.head = this.tail = new Op(null, 0, 0);
			this.len = 0;
			return this;
		}
		reset() {
			if (this.states) {
				this.head = this.states.head;
				this.tail = this.states.tail;
				this.len = this.states.len;
				this.states = this.states.next;
			} else {
				this.head = this.tail = new Op(null, 0, 0);
				this.len = 0;
			}
			return this;
		}
		ldelim() {
			const head = this.head, tail = this.tail, len = this.len;
			this.reset().uint32(len);
			if (len) {
				this.tail.next = head.next;
				this.tail = tail;
				this.len += len;
			}
			return this;
		}
		tag(fieldNo, type) {
			return this.uint32((fieldNo << 3 | type) >>> 0);
		}
		uint32(value) {
			this.len += (this.tail = this.tail.next = new Op(varint_1.writeVarint32, (value = value >>> 0) < 128 ? 1 : value < 16384 ? 2 : value < 2097152 ? 3 : value < 268435456 ? 4 : 5, value)).len;
			return this;
		}
		int32(value) {
			return value < 0 ? this._push(varint_1.writeVarint64, 10, (0, varint_1.int64FromString)(value.toString())) : this.uint32(value);
		}
		sint32(value) {
			return this.uint32((value << 1 ^ value >> 31) >>> 0);
		}
		int64(value) {
			const { lo, hi } = (0, varint_1.int64FromString)(value.toString());
			return this._push(varint_1.writeVarint64, (0, varint_1.int64Length)(lo, hi), {
				lo,
				hi
			});
		}
		uint64 = BinaryWriter.prototype.int64;
		sint64(value) {
			let { lo, hi } = (0, varint_1.int64FromString)(value.toString());
			[lo, hi] = (0, varint_1.zzEncode)(lo, hi);
			return this._push(varint_1.writeVarint64, (0, varint_1.int64Length)(lo, hi), {
				lo,
				hi
			});
		}
		fixed64(value) {
			const { lo, hi } = (0, varint_1.int64FromString)(value.toString());
			return this._push(varint_1.writeFixed32, 4, lo)._push(varint_1.writeFixed32, 4, hi);
		}
		sfixed64 = BinaryWriter.prototype.fixed64;
		bool(value) {
			return this._push(varint_1.writeByte, 1, value ? 1 : 0);
		}
		fixed32(value) {
			return this._push(varint_1.writeFixed32, 4, value >>> 0);
		}
		sfixed32 = BinaryWriter.prototype.fixed32;
		float(value) {
			throw new Error("float not supported" + value);
		}
		double(value) {
			throw new Error("double not supported" + value);
		}
		bytes(value) {
			const len = value.length >>> 0;
			if (!len) return this._push(varint_1.writeByte, 1, 0);
			return this.uint32(len)._push(writeBytes, len, value);
		}
		string(value) {
			const len = (0, utf8_1.utf8Length)(value);
			return len ? this.uint32(len)._push(utf8_1.utf8Write, len, value) : this._push(varint_1.writeByte, 1, 0);
		}
	};
	function writeBytes(val, buf, pos) {
		if (typeof Uint8Array !== "undefined") buf.set(val, pos);
		else for (let i = 0; i < val.length; ++i) buf[pos + i] = val[i];
	}
	function pool(alloc, slice, size) {
		const SIZE = size || 8192;
		const MAX = SIZE >>> 1;
		let slab = null;
		let offset = SIZE;
		return function pool_alloc(size) {
			if (size < 1 || size > MAX) return alloc(size);
			if (offset + size > SIZE) {
				slab = alloc(SIZE);
				offset = 0;
			}
			const buf = slice.call(slab, offset, offset += size);
			if (offset & 7) offset = (offset | 7) + 1;
			return buf;
		};
	}
	function indexOutOfRange(reader, writeLength) {
		return RangeError("index out of range: " + reader.pos + " + " + (writeLength || 1) + " > " + reader.len);
	}
}));
//#endregion
//#region node_modules/cosmjs-types/helpers.js
var require_helpers = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* This file and any referenced files were automatically generated by @hyperweb/telescope@1.17.4
	* DO NOT MODIFY BY HAND. Instead, download the latest proto files for your chain
	* and run the transpile command or npm scripts command that is used to regenerate this bundle.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.setPaginationParams = void 0;
	exports.bytesFromBase64 = bytesFromBase64;
	exports.base64FromBytes = base64FromBytes;
	exports.omitDefault = omitDefault;
	exports.toDuration = toDuration;
	exports.fromDuration = fromDuration;
	exports.isSet = isSet;
	exports.isObject = isObject;
	exports.isRpc = isRpc;
	exports.toTimestamp = toTimestamp;
	exports.fromTimestamp = fromTimestamp;
	exports.fromJsonTimestamp = fromJsonTimestamp;
	var globalThis = (() => {
		if (typeof globalThis !== "undefined") return globalThis;
		if (typeof self !== "undefined") return self;
		if (typeof window !== "undefined") return window;
		if (typeof global !== "undefined") return global;
		throw "Unable to locate global object";
	})();
	var atob = globalThis.atob || ((b64) => globalThis.Buffer.from(b64, "base64").toString("binary"));
	function bytesFromBase64(b64) {
		const bin = atob(b64);
		const arr = new Uint8Array(bin.length);
		for (let i = 0; i < bin.length; ++i) arr[i] = bin.charCodeAt(i);
		return arr;
	}
	var btoa = globalThis.btoa || ((bin) => globalThis.Buffer.from(bin, "binary").toString("base64"));
	function base64FromBytes(arr) {
		const bin = [];
		arr.forEach((byte) => {
			bin.push(String.fromCharCode(byte));
		});
		return btoa(bin.join(""));
	}
	function omitDefault(input) {
		if (typeof input === "string") return input === "" ? void 0 : input;
		if (typeof input === "number") return input === 0 ? void 0 : input;
		if (typeof input === "boolean") return input === false ? void 0 : input;
		if (typeof input === "bigint") return input === BigInt(0) ? void 0 : input;
		throw new Error(`Got unsupported type ${typeof input}`);
	}
	function toDuration(duration) {
		return {
			seconds: BigInt(Math.floor(parseInt(duration) / 1e9)),
			nanos: parseInt(duration) % 1e9
		};
	}
	function fromDuration(duration) {
		return (parseInt(duration.seconds.toString()) * 1e9 + duration.nanos).toString();
	}
	function isSet(value) {
		return value !== null && value !== void 0;
	}
	function isObject(value) {
		return typeof value === "object" && value !== null;
	}
	var setPaginationParams = (options, pagination) => {
		if (!pagination) return options;
		if (typeof pagination?.countTotal !== "undefined") options.params["pagination.count_total"] = pagination.countTotal;
		if (typeof pagination?.key !== "undefined") options.params["pagination.key"] = Buffer.from(pagination.key).toString("base64");
		if (typeof pagination?.limit !== "undefined") options.params["pagination.limit"] = pagination.limit.toString();
		if (typeof pagination?.offset !== "undefined") options.params["pagination.offset"] = pagination.offset.toString();
		if (typeof pagination?.reverse !== "undefined") options.params["pagination.reverse"] = pagination.reverse;
		return options;
	};
	exports.setPaginationParams = setPaginationParams;
	function isRpc(rpc) {
		return rpc !== null && rpc !== void 0 && typeof rpc.request === "function";
	}
	function toTimestamp(date) {
		return {
			seconds: numberToLong(date.getTime() / 1e3),
			nanos: date.getTime() % 1e3 * 1e6
		};
	}
	function fromTimestamp(t) {
		let millis = Number(t.seconds) * 1e3;
		millis += t.nanos / 1e6;
		return new Date(millis);
	}
	var timestampFromJSON = (object) => {
		return {
			seconds: isSet(object.seconds) ? BigInt(object.seconds.toString()) : BigInt(0),
			nanos: isSet(object.nanos) ? Number(object.nanos) : 0
		};
	};
	function fromJsonTimestamp(o) {
		if (o instanceof Date) return toTimestamp(o);
		else if (typeof o === "string") return toTimestamp(new Date(o));
		else return timestampFromJSON(o);
	}
	function numberToLong(number) {
		return BigInt(Math.trunc(number));
	}
}));
//#endregion
//#region node_modules/cosmjs-types/google/protobuf/any.js
var require_any = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Any = exports.protobufPackage = void 0;
	var binary_1 = require_binary();
	var helpers_1 = require_helpers();
	exports.protobufPackage = "google.protobuf";
	function createBaseAny() {
		return {
			typeUrl: "",
			value: new Uint8Array()
		};
	}
	exports.Any = {
		typeUrl: "/google.protobuf.Any",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.typeUrl !== "") writer.uint32(10).string(message.typeUrl);
			if (message.value.length !== 0) writer.uint32(18).bytes(message.value);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseAny();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.typeUrl = reader.string();
						break;
					case 2:
						message.value = reader.bytes();
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseAny();
			if ((0, helpers_1.isSet)(object.typeUrl)) obj.typeUrl = String(object.typeUrl);
			if ((0, helpers_1.isSet)(object.value)) obj.value = (0, helpers_1.bytesFromBase64)(object.value);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.typeUrl !== void 0 && (obj.typeUrl = message.typeUrl);
			message.value !== void 0 && (obj.value = (0, helpers_1.base64FromBytes)(message.value !== void 0 ? message.value : new Uint8Array()));
			return obj;
		},
		fromPartial(object) {
			const message = createBaseAny();
			message.typeUrl = object.typeUrl ?? "";
			message.value = object.value ?? new Uint8Array();
			return message;
		}
	};
}));
//#endregion
//#region node_modules/cosmjs-types/google/protobuf/timestamp.js
var require_timestamp = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Timestamp = exports.protobufPackage = void 0;
	var binary_1 = require_binary();
	var helpers_1 = require_helpers();
	exports.protobufPackage = "google.protobuf";
	function createBaseTimestamp() {
		return {
			seconds: BigInt(0),
			nanos: 0
		};
	}
	exports.Timestamp = {
		typeUrl: "/google.protobuf.Timestamp",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.seconds !== BigInt(0)) writer.uint32(8).int64(message.seconds);
			if (message.nanos !== 0) writer.uint32(16).int32(message.nanos);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseTimestamp();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.seconds = reader.int64();
						break;
					case 2:
						message.nanos = reader.int32();
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseTimestamp();
			if ((0, helpers_1.isSet)(object.seconds)) obj.seconds = BigInt(object.seconds.toString());
			if ((0, helpers_1.isSet)(object.nanos)) obj.nanos = Number(object.nanos);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.seconds !== void 0 && (obj.seconds = (message.seconds || BigInt(0)).toString());
			message.nanos !== void 0 && (obj.nanos = Math.round(message.nanos));
			return obj;
		},
		fromPartial(object) {
			const message = createBaseTimestamp();
			if (object.seconds !== void 0 && object.seconds !== null) message.seconds = BigInt(object.seconds.toString());
			message.nanos = object.nanos ?? 0;
			return message;
		}
	};
}));
//#endregion
//#region node_modules/cosmjs-types/cosmos/crypto/multisig/v1beta1/multisig.js
var require_multisig$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CompactBitArray = exports.MultiSignature = exports.protobufPackage = void 0;
	var binary_1 = require_binary();
	var helpers_1 = require_helpers();
	exports.protobufPackage = "cosmos.crypto.multisig.v1beta1";
	function createBaseMultiSignature() {
		return { signatures: [] };
	}
	exports.MultiSignature = {
		typeUrl: "/cosmos.crypto.multisig.v1beta1.MultiSignature",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			for (const v of message.signatures) writer.uint32(10).bytes(v);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseMultiSignature();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.signatures.push(reader.bytes());
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseMultiSignature();
			if (Array.isArray(object?.signatures)) obj.signatures = object.signatures.map((e) => (0, helpers_1.bytesFromBase64)(e));
			return obj;
		},
		toJSON(message) {
			const obj = {};
			if (message.signatures) obj.signatures = message.signatures.map((e) => (0, helpers_1.base64FromBytes)(e !== void 0 ? e : new Uint8Array()));
			else obj.signatures = [];
			return obj;
		},
		fromPartial(object) {
			const message = createBaseMultiSignature();
			message.signatures = object.signatures?.map((e) => e) || [];
			return message;
		}
	};
	function createBaseCompactBitArray() {
		return {
			extraBitsStored: 0,
			elems: new Uint8Array()
		};
	}
	exports.CompactBitArray = {
		typeUrl: "/cosmos.crypto.multisig.v1beta1.CompactBitArray",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.extraBitsStored !== 0) writer.uint32(8).uint32(message.extraBitsStored);
			if (message.elems.length !== 0) writer.uint32(18).bytes(message.elems);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseCompactBitArray();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.extraBitsStored = reader.uint32();
						break;
					case 2:
						message.elems = reader.bytes();
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseCompactBitArray();
			if ((0, helpers_1.isSet)(object.extraBitsStored)) obj.extraBitsStored = Number(object.extraBitsStored);
			if ((0, helpers_1.isSet)(object.elems)) obj.elems = (0, helpers_1.bytesFromBase64)(object.elems);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.extraBitsStored !== void 0 && (obj.extraBitsStored = Math.round(message.extraBitsStored));
			message.elems !== void 0 && (obj.elems = (0, helpers_1.base64FromBytes)(message.elems !== void 0 ? message.elems : new Uint8Array()));
			return obj;
		},
		fromPartial(object) {
			const message = createBaseCompactBitArray();
			message.extraBitsStored = object.extraBitsStored ?? 0;
			message.elems = object.elems ?? new Uint8Array();
			return message;
		}
	};
}));
//#endregion
//#region node_modules/cosmjs-types/cosmos/tx/signing/v1beta1/signing.js
var require_signing$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SignatureDescriptor_Data_Multi = exports.SignatureDescriptor_Data_Single = exports.SignatureDescriptor_Data = exports.SignatureDescriptor = exports.SignatureDescriptors = exports.SignMode = exports.protobufPackage = void 0;
	exports.signModeFromJSON = signModeFromJSON;
	exports.signModeToJSON = signModeToJSON;
	var multisig_1 = require_multisig$1();
	var any_1 = require_any();
	var binary_1 = require_binary();
	var helpers_1 = require_helpers();
	exports.protobufPackage = "cosmos.tx.signing.v1beta1";
	/**
	* SignMode represents a signing mode with its own security guarantees.
	*
	* This enum should be considered a registry of all known sign modes
	* in the Cosmos ecosystem. Apps are not expected to support all known
	* sign modes. Apps that would like to support custom  sign modes are
	* encouraged to open a small PR against this file to add a new case
	* to this SignMode enum describing their sign mode so that different
	* apps have a consistent version of this enum.
	*/
	var SignMode;
	(function(SignMode) {
		/**
		* SIGN_MODE_UNSPECIFIED - SIGN_MODE_UNSPECIFIED specifies an unknown signing mode and will be
		* rejected.
		*/
		SignMode[SignMode["SIGN_MODE_UNSPECIFIED"] = 0] = "SIGN_MODE_UNSPECIFIED";
		/**
		* SIGN_MODE_DIRECT - SIGN_MODE_DIRECT specifies a signing mode which uses SignDoc and is
		* verified with raw bytes from Tx.
		*/
		SignMode[SignMode["SIGN_MODE_DIRECT"] = 1] = "SIGN_MODE_DIRECT";
		/**
		* SIGN_MODE_TEXTUAL - SIGN_MODE_TEXTUAL is a future signing mode that will verify some
		* human-readable textual representation on top of the binary representation
		* from SIGN_MODE_DIRECT.
		*
		* Since: cosmos-sdk 0.50
		*/
		SignMode[SignMode["SIGN_MODE_TEXTUAL"] = 2] = "SIGN_MODE_TEXTUAL";
		/**
		* SIGN_MODE_DIRECT_AUX - SIGN_MODE_DIRECT_AUX specifies a signing mode which uses
		* SignDocDirectAux. As opposed to SIGN_MODE_DIRECT, this sign mode does not
		* require signers signing over other signers' `signer_info`.
		*
		* Since: cosmos-sdk 0.46
		*/
		SignMode[SignMode["SIGN_MODE_DIRECT_AUX"] = 3] = "SIGN_MODE_DIRECT_AUX";
		/**
		* SIGN_MODE_LEGACY_AMINO_JSON - SIGN_MODE_LEGACY_AMINO_JSON is a backwards compatibility mode which uses
		* Amino JSON and will be removed in the future.
		*/
		SignMode[SignMode["SIGN_MODE_LEGACY_AMINO_JSON"] = 127] = "SIGN_MODE_LEGACY_AMINO_JSON";
		/**
		* SIGN_MODE_EIP_191 - SIGN_MODE_EIP_191 specifies the sign mode for EIP 191 signing on the Cosmos
		* SDK. Ref: https://eips.ethereum.org/EIPS/eip-191
		*
		* Currently, SIGN_MODE_EIP_191 is registered as a SignMode enum variant,
		* but is not implemented on the SDK by default. To enable EIP-191, you need
		* to pass a custom `TxConfig` that has an implementation of
		* `SignModeHandler` for EIP-191. The SDK may decide to fully support
		* EIP-191 in the future.
		*
		* Since: cosmos-sdk 0.45.2
		*/
		SignMode[SignMode["SIGN_MODE_EIP_191"] = 191] = "SIGN_MODE_EIP_191";
		SignMode[SignMode["UNRECOGNIZED"] = -1] = "UNRECOGNIZED";
	})(SignMode || (exports.SignMode = SignMode = {}));
	function signModeFromJSON(object) {
		switch (object) {
			case 0:
			case "SIGN_MODE_UNSPECIFIED": return SignMode.SIGN_MODE_UNSPECIFIED;
			case 1:
			case "SIGN_MODE_DIRECT": return SignMode.SIGN_MODE_DIRECT;
			case 2:
			case "SIGN_MODE_TEXTUAL": return SignMode.SIGN_MODE_TEXTUAL;
			case 3:
			case "SIGN_MODE_DIRECT_AUX": return SignMode.SIGN_MODE_DIRECT_AUX;
			case 127:
			case "SIGN_MODE_LEGACY_AMINO_JSON": return SignMode.SIGN_MODE_LEGACY_AMINO_JSON;
			case 191:
			case "SIGN_MODE_EIP_191": return SignMode.SIGN_MODE_EIP_191;
			default: return SignMode.UNRECOGNIZED;
		}
	}
	function signModeToJSON(object) {
		switch (object) {
			case SignMode.SIGN_MODE_UNSPECIFIED: return "SIGN_MODE_UNSPECIFIED";
			case SignMode.SIGN_MODE_DIRECT: return "SIGN_MODE_DIRECT";
			case SignMode.SIGN_MODE_TEXTUAL: return "SIGN_MODE_TEXTUAL";
			case SignMode.SIGN_MODE_DIRECT_AUX: return "SIGN_MODE_DIRECT_AUX";
			case SignMode.SIGN_MODE_LEGACY_AMINO_JSON: return "SIGN_MODE_LEGACY_AMINO_JSON";
			case SignMode.SIGN_MODE_EIP_191: return "SIGN_MODE_EIP_191";
			case SignMode.UNRECOGNIZED:
			default: return "UNRECOGNIZED";
		}
	}
	function createBaseSignatureDescriptors() {
		return { signatures: [] };
	}
	exports.SignatureDescriptors = {
		typeUrl: "/cosmos.tx.signing.v1beta1.SignatureDescriptors",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			for (const v of message.signatures) exports.SignatureDescriptor.encode(v, writer.uint32(10).fork()).ldelim();
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseSignatureDescriptors();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.signatures.push(exports.SignatureDescriptor.decode(reader, reader.uint32()));
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseSignatureDescriptors();
			if (Array.isArray(object?.signatures)) obj.signatures = object.signatures.map((e) => exports.SignatureDescriptor.fromJSON(e));
			return obj;
		},
		toJSON(message) {
			const obj = {};
			if (message.signatures) obj.signatures = message.signatures.map((e) => e ? exports.SignatureDescriptor.toJSON(e) : void 0);
			else obj.signatures = [];
			return obj;
		},
		fromPartial(object) {
			const message = createBaseSignatureDescriptors();
			message.signatures = object.signatures?.map((e) => exports.SignatureDescriptor.fromPartial(e)) || [];
			return message;
		}
	};
	function createBaseSignatureDescriptor() {
		return {
			publicKey: void 0,
			data: void 0,
			sequence: BigInt(0)
		};
	}
	exports.SignatureDescriptor = {
		typeUrl: "/cosmos.tx.signing.v1beta1.SignatureDescriptor",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.publicKey !== void 0) any_1.Any.encode(message.publicKey, writer.uint32(10).fork()).ldelim();
			if (message.data !== void 0) exports.SignatureDescriptor_Data.encode(message.data, writer.uint32(18).fork()).ldelim();
			if (message.sequence !== BigInt(0)) writer.uint32(24).uint64(message.sequence);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseSignatureDescriptor();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.publicKey = any_1.Any.decode(reader, reader.uint32());
						break;
					case 2:
						message.data = exports.SignatureDescriptor_Data.decode(reader, reader.uint32());
						break;
					case 3:
						message.sequence = reader.uint64();
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseSignatureDescriptor();
			if ((0, helpers_1.isSet)(object.publicKey)) obj.publicKey = any_1.Any.fromJSON(object.publicKey);
			if ((0, helpers_1.isSet)(object.data)) obj.data = exports.SignatureDescriptor_Data.fromJSON(object.data);
			if ((0, helpers_1.isSet)(object.sequence)) obj.sequence = BigInt(object.sequence.toString());
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.publicKey !== void 0 && (obj.publicKey = message.publicKey ? any_1.Any.toJSON(message.publicKey) : void 0);
			message.data !== void 0 && (obj.data = message.data ? exports.SignatureDescriptor_Data.toJSON(message.data) : void 0);
			message.sequence !== void 0 && (obj.sequence = (message.sequence || BigInt(0)).toString());
			return obj;
		},
		fromPartial(object) {
			const message = createBaseSignatureDescriptor();
			if (object.publicKey !== void 0 && object.publicKey !== null) message.publicKey = any_1.Any.fromPartial(object.publicKey);
			if (object.data !== void 0 && object.data !== null) message.data = exports.SignatureDescriptor_Data.fromPartial(object.data);
			if (object.sequence !== void 0 && object.sequence !== null) message.sequence = BigInt(object.sequence.toString());
			return message;
		}
	};
	function createBaseSignatureDescriptor_Data() {
		return {
			single: void 0,
			multi: void 0
		};
	}
	exports.SignatureDescriptor_Data = {
		typeUrl: "/cosmos.tx.signing.v1beta1.Data",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.single !== void 0) exports.SignatureDescriptor_Data_Single.encode(message.single, writer.uint32(10).fork()).ldelim();
			if (message.multi !== void 0) exports.SignatureDescriptor_Data_Multi.encode(message.multi, writer.uint32(18).fork()).ldelim();
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseSignatureDescriptor_Data();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.single = exports.SignatureDescriptor_Data_Single.decode(reader, reader.uint32());
						break;
					case 2:
						message.multi = exports.SignatureDescriptor_Data_Multi.decode(reader, reader.uint32());
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseSignatureDescriptor_Data();
			if ((0, helpers_1.isSet)(object.single)) obj.single = exports.SignatureDescriptor_Data_Single.fromJSON(object.single);
			if ((0, helpers_1.isSet)(object.multi)) obj.multi = exports.SignatureDescriptor_Data_Multi.fromJSON(object.multi);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.single !== void 0 && (obj.single = message.single ? exports.SignatureDescriptor_Data_Single.toJSON(message.single) : void 0);
			message.multi !== void 0 && (obj.multi = message.multi ? exports.SignatureDescriptor_Data_Multi.toJSON(message.multi) : void 0);
			return obj;
		},
		fromPartial(object) {
			const message = createBaseSignatureDescriptor_Data();
			if (object.single !== void 0 && object.single !== null) message.single = exports.SignatureDescriptor_Data_Single.fromPartial(object.single);
			if (object.multi !== void 0 && object.multi !== null) message.multi = exports.SignatureDescriptor_Data_Multi.fromPartial(object.multi);
			return message;
		}
	};
	function createBaseSignatureDescriptor_Data_Single() {
		return {
			mode: 0,
			signature: new Uint8Array()
		};
	}
	exports.SignatureDescriptor_Data_Single = {
		typeUrl: "/cosmos.tx.signing.v1beta1.Single",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.mode !== 0) writer.uint32(8).int32(message.mode);
			if (message.signature.length !== 0) writer.uint32(18).bytes(message.signature);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseSignatureDescriptor_Data_Single();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.mode = reader.int32();
						break;
					case 2:
						message.signature = reader.bytes();
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseSignatureDescriptor_Data_Single();
			if ((0, helpers_1.isSet)(object.mode)) obj.mode = signModeFromJSON(object.mode);
			if ((0, helpers_1.isSet)(object.signature)) obj.signature = (0, helpers_1.bytesFromBase64)(object.signature);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.mode !== void 0 && (obj.mode = signModeToJSON(message.mode));
			message.signature !== void 0 && (obj.signature = (0, helpers_1.base64FromBytes)(message.signature !== void 0 ? message.signature : new Uint8Array()));
			return obj;
		},
		fromPartial(object) {
			const message = createBaseSignatureDescriptor_Data_Single();
			message.mode = object.mode ?? 0;
			message.signature = object.signature ?? new Uint8Array();
			return message;
		}
	};
	function createBaseSignatureDescriptor_Data_Multi() {
		return {
			bitarray: void 0,
			signatures: []
		};
	}
	exports.SignatureDescriptor_Data_Multi = {
		typeUrl: "/cosmos.tx.signing.v1beta1.Multi",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.bitarray !== void 0) multisig_1.CompactBitArray.encode(message.bitarray, writer.uint32(10).fork()).ldelim();
			for (const v of message.signatures) exports.SignatureDescriptor_Data.encode(v, writer.uint32(18).fork()).ldelim();
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseSignatureDescriptor_Data_Multi();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.bitarray = multisig_1.CompactBitArray.decode(reader, reader.uint32());
						break;
					case 2:
						message.signatures.push(exports.SignatureDescriptor_Data.decode(reader, reader.uint32()));
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseSignatureDescriptor_Data_Multi();
			if ((0, helpers_1.isSet)(object.bitarray)) obj.bitarray = multisig_1.CompactBitArray.fromJSON(object.bitarray);
			if (Array.isArray(object?.signatures)) obj.signatures = object.signatures.map((e) => exports.SignatureDescriptor_Data.fromJSON(e));
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.bitarray !== void 0 && (obj.bitarray = message.bitarray ? multisig_1.CompactBitArray.toJSON(message.bitarray) : void 0);
			if (message.signatures) obj.signatures = message.signatures.map((e) => e ? exports.SignatureDescriptor_Data.toJSON(e) : void 0);
			else obj.signatures = [];
			return obj;
		},
		fromPartial(object) {
			const message = createBaseSignatureDescriptor_Data_Multi();
			if (object.bitarray !== void 0 && object.bitarray !== null) message.bitarray = multisig_1.CompactBitArray.fromPartial(object.bitarray);
			message.signatures = object.signatures?.map((e) => exports.SignatureDescriptor_Data.fromPartial(e)) || [];
			return message;
		}
	};
}));
//#endregion
//#region node_modules/cosmjs-types/cosmos/base/v1beta1/coin.js
var require_coin = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DecProto = exports.IntProto = exports.DecCoin = exports.Coin = exports.protobufPackage = void 0;
	var binary_1 = require_binary();
	var helpers_1 = require_helpers();
	exports.protobufPackage = "cosmos.base.v1beta1";
	function createBaseCoin() {
		return {
			denom: "",
			amount: ""
		};
	}
	exports.Coin = {
		typeUrl: "/cosmos.base.v1beta1.Coin",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.denom !== "") writer.uint32(10).string(message.denom);
			if (message.amount !== "") writer.uint32(18).string(message.amount);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseCoin();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.denom = reader.string();
						break;
					case 2:
						message.amount = reader.string();
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseCoin();
			if ((0, helpers_1.isSet)(object.denom)) obj.denom = String(object.denom);
			if ((0, helpers_1.isSet)(object.amount)) obj.amount = String(object.amount);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.denom !== void 0 && (obj.denom = message.denom);
			message.amount !== void 0 && (obj.amount = message.amount);
			return obj;
		},
		fromPartial(object) {
			const message = createBaseCoin();
			message.denom = object.denom ?? "";
			message.amount = object.amount ?? "";
			return message;
		}
	};
	function createBaseDecCoin() {
		return {
			denom: "",
			amount: ""
		};
	}
	exports.DecCoin = {
		typeUrl: "/cosmos.base.v1beta1.DecCoin",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.denom !== "") writer.uint32(10).string(message.denom);
			if (message.amount !== "") writer.uint32(18).string(message.amount);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseDecCoin();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.denom = reader.string();
						break;
					case 2:
						message.amount = reader.string();
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseDecCoin();
			if ((0, helpers_1.isSet)(object.denom)) obj.denom = String(object.denom);
			if ((0, helpers_1.isSet)(object.amount)) obj.amount = String(object.amount);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.denom !== void 0 && (obj.denom = message.denom);
			message.amount !== void 0 && (obj.amount = message.amount);
			return obj;
		},
		fromPartial(object) {
			const message = createBaseDecCoin();
			message.denom = object.denom ?? "";
			message.amount = object.amount ?? "";
			return message;
		}
	};
	function createBaseIntProto() {
		return { int: "" };
	}
	exports.IntProto = {
		typeUrl: "/cosmos.base.v1beta1.IntProto",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.int !== "") writer.uint32(10).string(message.int);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseIntProto();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.int = reader.string();
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseIntProto();
			if ((0, helpers_1.isSet)(object.int)) obj.int = String(object.int);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.int !== void 0 && (obj.int = message.int);
			return obj;
		},
		fromPartial(object) {
			const message = createBaseIntProto();
			message.int = object.int ?? "";
			return message;
		}
	};
	function createBaseDecProto() {
		return { dec: "" };
	}
	exports.DecProto = {
		typeUrl: "/cosmos.base.v1beta1.DecProto",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.dec !== "") writer.uint32(10).string(message.dec);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseDecProto();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.dec = reader.string();
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseDecProto();
			if ((0, helpers_1.isSet)(object.dec)) obj.dec = String(object.dec);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.dec !== void 0 && (obj.dec = message.dec);
			return obj;
		},
		fromPartial(object) {
			const message = createBaseDecProto();
			message.dec = object.dec ?? "";
			return message;
		}
	};
}));
//#endregion
//#region node_modules/cosmjs-types/cosmos/tx/v1beta1/tx.js
var require_tx$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AuxSignerData = exports.Tip = exports.Fee = exports.ModeInfo_Multi = exports.ModeInfo_Single = exports.ModeInfo = exports.SignerInfo = exports.AuthInfo = exports.TxBody = exports.SignDocDirectAux = exports.SignDoc = exports.TxRaw = exports.Tx = exports.protobufPackage = void 0;
	var any_1 = require_any();
	var timestamp_1 = require_timestamp();
	var signing_1 = require_signing$1();
	var multisig_1 = require_multisig$1();
	var coin_1 = require_coin();
	var binary_1 = require_binary();
	var helpers_1 = require_helpers();
	exports.protobufPackage = "cosmos.tx.v1beta1";
	function createBaseTx() {
		return {
			body: void 0,
			authInfo: void 0,
			signatures: []
		};
	}
	exports.Tx = {
		typeUrl: "/cosmos.tx.v1beta1.Tx",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.body !== void 0) exports.TxBody.encode(message.body, writer.uint32(10).fork()).ldelim();
			if (message.authInfo !== void 0) exports.AuthInfo.encode(message.authInfo, writer.uint32(18).fork()).ldelim();
			for (const v of message.signatures) writer.uint32(26).bytes(v);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseTx();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.body = exports.TxBody.decode(reader, reader.uint32());
						break;
					case 2:
						message.authInfo = exports.AuthInfo.decode(reader, reader.uint32());
						break;
					case 3:
						message.signatures.push(reader.bytes());
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseTx();
			if ((0, helpers_1.isSet)(object.body)) obj.body = exports.TxBody.fromJSON(object.body);
			if ((0, helpers_1.isSet)(object.authInfo)) obj.authInfo = exports.AuthInfo.fromJSON(object.authInfo);
			if (Array.isArray(object?.signatures)) obj.signatures = object.signatures.map((e) => (0, helpers_1.bytesFromBase64)(e));
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.body !== void 0 && (obj.body = message.body ? exports.TxBody.toJSON(message.body) : void 0);
			message.authInfo !== void 0 && (obj.authInfo = message.authInfo ? exports.AuthInfo.toJSON(message.authInfo) : void 0);
			if (message.signatures) obj.signatures = message.signatures.map((e) => (0, helpers_1.base64FromBytes)(e !== void 0 ? e : new Uint8Array()));
			else obj.signatures = [];
			return obj;
		},
		fromPartial(object) {
			const message = createBaseTx();
			if (object.body !== void 0 && object.body !== null) message.body = exports.TxBody.fromPartial(object.body);
			if (object.authInfo !== void 0 && object.authInfo !== null) message.authInfo = exports.AuthInfo.fromPartial(object.authInfo);
			message.signatures = object.signatures?.map((e) => e) || [];
			return message;
		}
	};
	function createBaseTxRaw() {
		return {
			bodyBytes: new Uint8Array(),
			authInfoBytes: new Uint8Array(),
			signatures: []
		};
	}
	exports.TxRaw = {
		typeUrl: "/cosmos.tx.v1beta1.TxRaw",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.bodyBytes.length !== 0) writer.uint32(10).bytes(message.bodyBytes);
			if (message.authInfoBytes.length !== 0) writer.uint32(18).bytes(message.authInfoBytes);
			for (const v of message.signatures) writer.uint32(26).bytes(v);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseTxRaw();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.bodyBytes = reader.bytes();
						break;
					case 2:
						message.authInfoBytes = reader.bytes();
						break;
					case 3:
						message.signatures.push(reader.bytes());
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseTxRaw();
			if ((0, helpers_1.isSet)(object.bodyBytes)) obj.bodyBytes = (0, helpers_1.bytesFromBase64)(object.bodyBytes);
			if ((0, helpers_1.isSet)(object.authInfoBytes)) obj.authInfoBytes = (0, helpers_1.bytesFromBase64)(object.authInfoBytes);
			if (Array.isArray(object?.signatures)) obj.signatures = object.signatures.map((e) => (0, helpers_1.bytesFromBase64)(e));
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.bodyBytes !== void 0 && (obj.bodyBytes = (0, helpers_1.base64FromBytes)(message.bodyBytes !== void 0 ? message.bodyBytes : new Uint8Array()));
			message.authInfoBytes !== void 0 && (obj.authInfoBytes = (0, helpers_1.base64FromBytes)(message.authInfoBytes !== void 0 ? message.authInfoBytes : new Uint8Array()));
			if (message.signatures) obj.signatures = message.signatures.map((e) => (0, helpers_1.base64FromBytes)(e !== void 0 ? e : new Uint8Array()));
			else obj.signatures = [];
			return obj;
		},
		fromPartial(object) {
			const message = createBaseTxRaw();
			message.bodyBytes = object.bodyBytes ?? new Uint8Array();
			message.authInfoBytes = object.authInfoBytes ?? new Uint8Array();
			message.signatures = object.signatures?.map((e) => e) || [];
			return message;
		}
	};
	function createBaseSignDoc() {
		return {
			bodyBytes: new Uint8Array(),
			authInfoBytes: new Uint8Array(),
			chainId: "",
			accountNumber: BigInt(0)
		};
	}
	exports.SignDoc = {
		typeUrl: "/cosmos.tx.v1beta1.SignDoc",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.bodyBytes.length !== 0) writer.uint32(10).bytes(message.bodyBytes);
			if (message.authInfoBytes.length !== 0) writer.uint32(18).bytes(message.authInfoBytes);
			if (message.chainId !== "") writer.uint32(26).string(message.chainId);
			if (message.accountNumber !== BigInt(0)) writer.uint32(32).uint64(message.accountNumber);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseSignDoc();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.bodyBytes = reader.bytes();
						break;
					case 2:
						message.authInfoBytes = reader.bytes();
						break;
					case 3:
						message.chainId = reader.string();
						break;
					case 4:
						message.accountNumber = reader.uint64();
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseSignDoc();
			if ((0, helpers_1.isSet)(object.bodyBytes)) obj.bodyBytes = (0, helpers_1.bytesFromBase64)(object.bodyBytes);
			if ((0, helpers_1.isSet)(object.authInfoBytes)) obj.authInfoBytes = (0, helpers_1.bytesFromBase64)(object.authInfoBytes);
			if ((0, helpers_1.isSet)(object.chainId)) obj.chainId = String(object.chainId);
			if ((0, helpers_1.isSet)(object.accountNumber)) obj.accountNumber = BigInt(object.accountNumber.toString());
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.bodyBytes !== void 0 && (obj.bodyBytes = (0, helpers_1.base64FromBytes)(message.bodyBytes !== void 0 ? message.bodyBytes : new Uint8Array()));
			message.authInfoBytes !== void 0 && (obj.authInfoBytes = (0, helpers_1.base64FromBytes)(message.authInfoBytes !== void 0 ? message.authInfoBytes : new Uint8Array()));
			message.chainId !== void 0 && (obj.chainId = message.chainId);
			message.accountNumber !== void 0 && (obj.accountNumber = (message.accountNumber || BigInt(0)).toString());
			return obj;
		},
		fromPartial(object) {
			const message = createBaseSignDoc();
			message.bodyBytes = object.bodyBytes ?? new Uint8Array();
			message.authInfoBytes = object.authInfoBytes ?? new Uint8Array();
			message.chainId = object.chainId ?? "";
			if (object.accountNumber !== void 0 && object.accountNumber !== null) message.accountNumber = BigInt(object.accountNumber.toString());
			return message;
		}
	};
	function createBaseSignDocDirectAux() {
		return {
			bodyBytes: new Uint8Array(),
			publicKey: void 0,
			chainId: "",
			accountNumber: BigInt(0),
			sequence: BigInt(0),
			tip: void 0
		};
	}
	exports.SignDocDirectAux = {
		typeUrl: "/cosmos.tx.v1beta1.SignDocDirectAux",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.bodyBytes.length !== 0) writer.uint32(10).bytes(message.bodyBytes);
			if (message.publicKey !== void 0) any_1.Any.encode(message.publicKey, writer.uint32(18).fork()).ldelim();
			if (message.chainId !== "") writer.uint32(26).string(message.chainId);
			if (message.accountNumber !== BigInt(0)) writer.uint32(32).uint64(message.accountNumber);
			if (message.sequence !== BigInt(0)) writer.uint32(40).uint64(message.sequence);
			if (message.tip !== void 0) exports.Tip.encode(message.tip, writer.uint32(50).fork()).ldelim();
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseSignDocDirectAux();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.bodyBytes = reader.bytes();
						break;
					case 2:
						message.publicKey = any_1.Any.decode(reader, reader.uint32());
						break;
					case 3:
						message.chainId = reader.string();
						break;
					case 4:
						message.accountNumber = reader.uint64();
						break;
					case 5:
						message.sequence = reader.uint64();
						break;
					case 6:
						message.tip = exports.Tip.decode(reader, reader.uint32());
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseSignDocDirectAux();
			if ((0, helpers_1.isSet)(object.bodyBytes)) obj.bodyBytes = (0, helpers_1.bytesFromBase64)(object.bodyBytes);
			if ((0, helpers_1.isSet)(object.publicKey)) obj.publicKey = any_1.Any.fromJSON(object.publicKey);
			if ((0, helpers_1.isSet)(object.chainId)) obj.chainId = String(object.chainId);
			if ((0, helpers_1.isSet)(object.accountNumber)) obj.accountNumber = BigInt(object.accountNumber.toString());
			if ((0, helpers_1.isSet)(object.sequence)) obj.sequence = BigInt(object.sequence.toString());
			if ((0, helpers_1.isSet)(object.tip)) obj.tip = exports.Tip.fromJSON(object.tip);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.bodyBytes !== void 0 && (obj.bodyBytes = (0, helpers_1.base64FromBytes)(message.bodyBytes !== void 0 ? message.bodyBytes : new Uint8Array()));
			message.publicKey !== void 0 && (obj.publicKey = message.publicKey ? any_1.Any.toJSON(message.publicKey) : void 0);
			message.chainId !== void 0 && (obj.chainId = message.chainId);
			message.accountNumber !== void 0 && (obj.accountNumber = (message.accountNumber || BigInt(0)).toString());
			message.sequence !== void 0 && (obj.sequence = (message.sequence || BigInt(0)).toString());
			message.tip !== void 0 && (obj.tip = message.tip ? exports.Tip.toJSON(message.tip) : void 0);
			return obj;
		},
		fromPartial(object) {
			const message = createBaseSignDocDirectAux();
			message.bodyBytes = object.bodyBytes ?? new Uint8Array();
			if (object.publicKey !== void 0 && object.publicKey !== null) message.publicKey = any_1.Any.fromPartial(object.publicKey);
			message.chainId = object.chainId ?? "";
			if (object.accountNumber !== void 0 && object.accountNumber !== null) message.accountNumber = BigInt(object.accountNumber.toString());
			if (object.sequence !== void 0 && object.sequence !== null) message.sequence = BigInt(object.sequence.toString());
			if (object.tip !== void 0 && object.tip !== null) message.tip = exports.Tip.fromPartial(object.tip);
			return message;
		}
	};
	function createBaseTxBody() {
		return {
			messages: [],
			memo: "",
			timeoutHeight: BigInt(0),
			unordered: false,
			timeoutTimestamp: void 0,
			extensionOptions: [],
			nonCriticalExtensionOptions: []
		};
	}
	exports.TxBody = {
		typeUrl: "/cosmos.tx.v1beta1.TxBody",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			for (const v of message.messages) any_1.Any.encode(v, writer.uint32(10).fork()).ldelim();
			if (message.memo !== "") writer.uint32(18).string(message.memo);
			if (message.timeoutHeight !== BigInt(0)) writer.uint32(24).uint64(message.timeoutHeight);
			if (message.unordered === true) writer.uint32(32).bool(message.unordered);
			if (message.timeoutTimestamp !== void 0) timestamp_1.Timestamp.encode(message.timeoutTimestamp, writer.uint32(42).fork()).ldelim();
			for (const v of message.extensionOptions) any_1.Any.encode(v, writer.uint32(8186).fork()).ldelim();
			for (const v of message.nonCriticalExtensionOptions) any_1.Any.encode(v, writer.uint32(16378).fork()).ldelim();
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseTxBody();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.messages.push(any_1.Any.decode(reader, reader.uint32()));
						break;
					case 2:
						message.memo = reader.string();
						break;
					case 3:
						message.timeoutHeight = reader.uint64();
						break;
					case 4:
						message.unordered = reader.bool();
						break;
					case 5:
						message.timeoutTimestamp = timestamp_1.Timestamp.decode(reader, reader.uint32());
						break;
					case 1023:
						message.extensionOptions.push(any_1.Any.decode(reader, reader.uint32()));
						break;
					case 2047:
						message.nonCriticalExtensionOptions.push(any_1.Any.decode(reader, reader.uint32()));
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseTxBody();
			if (Array.isArray(object?.messages)) obj.messages = object.messages.map((e) => any_1.Any.fromJSON(e));
			if ((0, helpers_1.isSet)(object.memo)) obj.memo = String(object.memo);
			if ((0, helpers_1.isSet)(object.timeoutHeight)) obj.timeoutHeight = BigInt(object.timeoutHeight.toString());
			if ((0, helpers_1.isSet)(object.unordered)) obj.unordered = Boolean(object.unordered);
			if ((0, helpers_1.isSet)(object.timeoutTimestamp)) obj.timeoutTimestamp = (0, helpers_1.fromJsonTimestamp)(object.timeoutTimestamp);
			if (Array.isArray(object?.extensionOptions)) obj.extensionOptions = object.extensionOptions.map((e) => any_1.Any.fromJSON(e));
			if (Array.isArray(object?.nonCriticalExtensionOptions)) obj.nonCriticalExtensionOptions = object.nonCriticalExtensionOptions.map((e) => any_1.Any.fromJSON(e));
			return obj;
		},
		toJSON(message) {
			const obj = {};
			if (message.messages) obj.messages = message.messages.map((e) => e ? any_1.Any.toJSON(e) : void 0);
			else obj.messages = [];
			message.memo !== void 0 && (obj.memo = message.memo);
			message.timeoutHeight !== void 0 && (obj.timeoutHeight = (message.timeoutHeight || BigInt(0)).toString());
			message.unordered !== void 0 && (obj.unordered = message.unordered);
			message.timeoutTimestamp !== void 0 && (obj.timeoutTimestamp = (0, helpers_1.fromTimestamp)(message.timeoutTimestamp).toISOString());
			if (message.extensionOptions) obj.extensionOptions = message.extensionOptions.map((e) => e ? any_1.Any.toJSON(e) : void 0);
			else obj.extensionOptions = [];
			if (message.nonCriticalExtensionOptions) obj.nonCriticalExtensionOptions = message.nonCriticalExtensionOptions.map((e) => e ? any_1.Any.toJSON(e) : void 0);
			else obj.nonCriticalExtensionOptions = [];
			return obj;
		},
		fromPartial(object) {
			const message = createBaseTxBody();
			message.messages = object.messages?.map((e) => any_1.Any.fromPartial(e)) || [];
			message.memo = object.memo ?? "";
			if (object.timeoutHeight !== void 0 && object.timeoutHeight !== null) message.timeoutHeight = BigInt(object.timeoutHeight.toString());
			message.unordered = object.unordered ?? false;
			if (object.timeoutTimestamp !== void 0 && object.timeoutTimestamp !== null) message.timeoutTimestamp = timestamp_1.Timestamp.fromPartial(object.timeoutTimestamp);
			message.extensionOptions = object.extensionOptions?.map((e) => any_1.Any.fromPartial(e)) || [];
			message.nonCriticalExtensionOptions = object.nonCriticalExtensionOptions?.map((e) => any_1.Any.fromPartial(e)) || [];
			return message;
		}
	};
	function createBaseAuthInfo() {
		return {
			signerInfos: [],
			fee: void 0,
			tip: void 0
		};
	}
	exports.AuthInfo = {
		typeUrl: "/cosmos.tx.v1beta1.AuthInfo",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			for (const v of message.signerInfos) exports.SignerInfo.encode(v, writer.uint32(10).fork()).ldelim();
			if (message.fee !== void 0) exports.Fee.encode(message.fee, writer.uint32(18).fork()).ldelim();
			if (message.tip !== void 0) exports.Tip.encode(message.tip, writer.uint32(26).fork()).ldelim();
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseAuthInfo();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.signerInfos.push(exports.SignerInfo.decode(reader, reader.uint32()));
						break;
					case 2:
						message.fee = exports.Fee.decode(reader, reader.uint32());
						break;
					case 3:
						message.tip = exports.Tip.decode(reader, reader.uint32());
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseAuthInfo();
			if (Array.isArray(object?.signerInfos)) obj.signerInfos = object.signerInfos.map((e) => exports.SignerInfo.fromJSON(e));
			if ((0, helpers_1.isSet)(object.fee)) obj.fee = exports.Fee.fromJSON(object.fee);
			if ((0, helpers_1.isSet)(object.tip)) obj.tip = exports.Tip.fromJSON(object.tip);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			if (message.signerInfos) obj.signerInfos = message.signerInfos.map((e) => e ? exports.SignerInfo.toJSON(e) : void 0);
			else obj.signerInfos = [];
			message.fee !== void 0 && (obj.fee = message.fee ? exports.Fee.toJSON(message.fee) : void 0);
			message.tip !== void 0 && (obj.tip = message.tip ? exports.Tip.toJSON(message.tip) : void 0);
			return obj;
		},
		fromPartial(object) {
			const message = createBaseAuthInfo();
			message.signerInfos = object.signerInfos?.map((e) => exports.SignerInfo.fromPartial(e)) || [];
			if (object.fee !== void 0 && object.fee !== null) message.fee = exports.Fee.fromPartial(object.fee);
			if (object.tip !== void 0 && object.tip !== null) message.tip = exports.Tip.fromPartial(object.tip);
			return message;
		}
	};
	function createBaseSignerInfo() {
		return {
			publicKey: void 0,
			modeInfo: void 0,
			sequence: BigInt(0)
		};
	}
	exports.SignerInfo = {
		typeUrl: "/cosmos.tx.v1beta1.SignerInfo",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.publicKey !== void 0) any_1.Any.encode(message.publicKey, writer.uint32(10).fork()).ldelim();
			if (message.modeInfo !== void 0) exports.ModeInfo.encode(message.modeInfo, writer.uint32(18).fork()).ldelim();
			if (message.sequence !== BigInt(0)) writer.uint32(24).uint64(message.sequence);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseSignerInfo();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.publicKey = any_1.Any.decode(reader, reader.uint32());
						break;
					case 2:
						message.modeInfo = exports.ModeInfo.decode(reader, reader.uint32());
						break;
					case 3:
						message.sequence = reader.uint64();
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseSignerInfo();
			if ((0, helpers_1.isSet)(object.publicKey)) obj.publicKey = any_1.Any.fromJSON(object.publicKey);
			if ((0, helpers_1.isSet)(object.modeInfo)) obj.modeInfo = exports.ModeInfo.fromJSON(object.modeInfo);
			if ((0, helpers_1.isSet)(object.sequence)) obj.sequence = BigInt(object.sequence.toString());
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.publicKey !== void 0 && (obj.publicKey = message.publicKey ? any_1.Any.toJSON(message.publicKey) : void 0);
			message.modeInfo !== void 0 && (obj.modeInfo = message.modeInfo ? exports.ModeInfo.toJSON(message.modeInfo) : void 0);
			message.sequence !== void 0 && (obj.sequence = (message.sequence || BigInt(0)).toString());
			return obj;
		},
		fromPartial(object) {
			const message = createBaseSignerInfo();
			if (object.publicKey !== void 0 && object.publicKey !== null) message.publicKey = any_1.Any.fromPartial(object.publicKey);
			if (object.modeInfo !== void 0 && object.modeInfo !== null) message.modeInfo = exports.ModeInfo.fromPartial(object.modeInfo);
			if (object.sequence !== void 0 && object.sequence !== null) message.sequence = BigInt(object.sequence.toString());
			return message;
		}
	};
	function createBaseModeInfo() {
		return {
			single: void 0,
			multi: void 0
		};
	}
	exports.ModeInfo = {
		typeUrl: "/cosmos.tx.v1beta1.ModeInfo",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.single !== void 0) exports.ModeInfo_Single.encode(message.single, writer.uint32(10).fork()).ldelim();
			if (message.multi !== void 0) exports.ModeInfo_Multi.encode(message.multi, writer.uint32(18).fork()).ldelim();
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseModeInfo();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.single = exports.ModeInfo_Single.decode(reader, reader.uint32());
						break;
					case 2:
						message.multi = exports.ModeInfo_Multi.decode(reader, reader.uint32());
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseModeInfo();
			if ((0, helpers_1.isSet)(object.single)) obj.single = exports.ModeInfo_Single.fromJSON(object.single);
			if ((0, helpers_1.isSet)(object.multi)) obj.multi = exports.ModeInfo_Multi.fromJSON(object.multi);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.single !== void 0 && (obj.single = message.single ? exports.ModeInfo_Single.toJSON(message.single) : void 0);
			message.multi !== void 0 && (obj.multi = message.multi ? exports.ModeInfo_Multi.toJSON(message.multi) : void 0);
			return obj;
		},
		fromPartial(object) {
			const message = createBaseModeInfo();
			if (object.single !== void 0 && object.single !== null) message.single = exports.ModeInfo_Single.fromPartial(object.single);
			if (object.multi !== void 0 && object.multi !== null) message.multi = exports.ModeInfo_Multi.fromPartial(object.multi);
			return message;
		}
	};
	function createBaseModeInfo_Single() {
		return { mode: 0 };
	}
	exports.ModeInfo_Single = {
		typeUrl: "/cosmos.tx.v1beta1.Single",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.mode !== 0) writer.uint32(8).int32(message.mode);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseModeInfo_Single();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.mode = reader.int32();
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseModeInfo_Single();
			if ((0, helpers_1.isSet)(object.mode)) obj.mode = (0, signing_1.signModeFromJSON)(object.mode);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.mode !== void 0 && (obj.mode = (0, signing_1.signModeToJSON)(message.mode));
			return obj;
		},
		fromPartial(object) {
			const message = createBaseModeInfo_Single();
			message.mode = object.mode ?? 0;
			return message;
		}
	};
	function createBaseModeInfo_Multi() {
		return {
			bitarray: void 0,
			modeInfos: []
		};
	}
	exports.ModeInfo_Multi = {
		typeUrl: "/cosmos.tx.v1beta1.Multi",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.bitarray !== void 0) multisig_1.CompactBitArray.encode(message.bitarray, writer.uint32(10).fork()).ldelim();
			for (const v of message.modeInfos) exports.ModeInfo.encode(v, writer.uint32(18).fork()).ldelim();
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseModeInfo_Multi();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.bitarray = multisig_1.CompactBitArray.decode(reader, reader.uint32());
						break;
					case 2:
						message.modeInfos.push(exports.ModeInfo.decode(reader, reader.uint32()));
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseModeInfo_Multi();
			if ((0, helpers_1.isSet)(object.bitarray)) obj.bitarray = multisig_1.CompactBitArray.fromJSON(object.bitarray);
			if (Array.isArray(object?.modeInfos)) obj.modeInfos = object.modeInfos.map((e) => exports.ModeInfo.fromJSON(e));
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.bitarray !== void 0 && (obj.bitarray = message.bitarray ? multisig_1.CompactBitArray.toJSON(message.bitarray) : void 0);
			if (message.modeInfos) obj.modeInfos = message.modeInfos.map((e) => e ? exports.ModeInfo.toJSON(e) : void 0);
			else obj.modeInfos = [];
			return obj;
		},
		fromPartial(object) {
			const message = createBaseModeInfo_Multi();
			if (object.bitarray !== void 0 && object.bitarray !== null) message.bitarray = multisig_1.CompactBitArray.fromPartial(object.bitarray);
			message.modeInfos = object.modeInfos?.map((e) => exports.ModeInfo.fromPartial(e)) || [];
			return message;
		}
	};
	function createBaseFee() {
		return {
			amount: [],
			gasLimit: BigInt(0),
			payer: "",
			granter: ""
		};
	}
	exports.Fee = {
		typeUrl: "/cosmos.tx.v1beta1.Fee",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			for (const v of message.amount) coin_1.Coin.encode(v, writer.uint32(10).fork()).ldelim();
			if (message.gasLimit !== BigInt(0)) writer.uint32(16).uint64(message.gasLimit);
			if (message.payer !== "") writer.uint32(26).string(message.payer);
			if (message.granter !== "") writer.uint32(34).string(message.granter);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseFee();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.amount.push(coin_1.Coin.decode(reader, reader.uint32()));
						break;
					case 2:
						message.gasLimit = reader.uint64();
						break;
					case 3:
						message.payer = reader.string();
						break;
					case 4:
						message.granter = reader.string();
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseFee();
			if (Array.isArray(object?.amount)) obj.amount = object.amount.map((e) => coin_1.Coin.fromJSON(e));
			if ((0, helpers_1.isSet)(object.gasLimit)) obj.gasLimit = BigInt(object.gasLimit.toString());
			if ((0, helpers_1.isSet)(object.payer)) obj.payer = String(object.payer);
			if ((0, helpers_1.isSet)(object.granter)) obj.granter = String(object.granter);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			if (message.amount) obj.amount = message.amount.map((e) => e ? coin_1.Coin.toJSON(e) : void 0);
			else obj.amount = [];
			message.gasLimit !== void 0 && (obj.gasLimit = (message.gasLimit || BigInt(0)).toString());
			message.payer !== void 0 && (obj.payer = message.payer);
			message.granter !== void 0 && (obj.granter = message.granter);
			return obj;
		},
		fromPartial(object) {
			const message = createBaseFee();
			message.amount = object.amount?.map((e) => coin_1.Coin.fromPartial(e)) || [];
			if (object.gasLimit !== void 0 && object.gasLimit !== null) message.gasLimit = BigInt(object.gasLimit.toString());
			message.payer = object.payer ?? "";
			message.granter = object.granter ?? "";
			return message;
		}
	};
	function createBaseTip() {
		return {
			amount: [],
			tipper: ""
		};
	}
	exports.Tip = {
		typeUrl: "/cosmos.tx.v1beta1.Tip",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			for (const v of message.amount) coin_1.Coin.encode(v, writer.uint32(10).fork()).ldelim();
			if (message.tipper !== "") writer.uint32(18).string(message.tipper);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseTip();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.amount.push(coin_1.Coin.decode(reader, reader.uint32()));
						break;
					case 2:
						message.tipper = reader.string();
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseTip();
			if (Array.isArray(object?.amount)) obj.amount = object.amount.map((e) => coin_1.Coin.fromJSON(e));
			if ((0, helpers_1.isSet)(object.tipper)) obj.tipper = String(object.tipper);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			if (message.amount) obj.amount = message.amount.map((e) => e ? coin_1.Coin.toJSON(e) : void 0);
			else obj.amount = [];
			message.tipper !== void 0 && (obj.tipper = message.tipper);
			return obj;
		},
		fromPartial(object) {
			const message = createBaseTip();
			message.amount = object.amount?.map((e) => coin_1.Coin.fromPartial(e)) || [];
			message.tipper = object.tipper ?? "";
			return message;
		}
	};
	function createBaseAuxSignerData() {
		return {
			address: "",
			signDoc: void 0,
			mode: 0,
			sig: new Uint8Array()
		};
	}
	exports.AuxSignerData = {
		typeUrl: "/cosmos.tx.v1beta1.AuxSignerData",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.address !== "") writer.uint32(10).string(message.address);
			if (message.signDoc !== void 0) exports.SignDocDirectAux.encode(message.signDoc, writer.uint32(18).fork()).ldelim();
			if (message.mode !== 0) writer.uint32(24).int32(message.mode);
			if (message.sig.length !== 0) writer.uint32(34).bytes(message.sig);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseAuxSignerData();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.address = reader.string();
						break;
					case 2:
						message.signDoc = exports.SignDocDirectAux.decode(reader, reader.uint32());
						break;
					case 3:
						message.mode = reader.int32();
						break;
					case 4:
						message.sig = reader.bytes();
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseAuxSignerData();
			if ((0, helpers_1.isSet)(object.address)) obj.address = String(object.address);
			if ((0, helpers_1.isSet)(object.signDoc)) obj.signDoc = exports.SignDocDirectAux.fromJSON(object.signDoc);
			if ((0, helpers_1.isSet)(object.mode)) obj.mode = (0, signing_1.signModeFromJSON)(object.mode);
			if ((0, helpers_1.isSet)(object.sig)) obj.sig = (0, helpers_1.bytesFromBase64)(object.sig);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.address !== void 0 && (obj.address = message.address);
			message.signDoc !== void 0 && (obj.signDoc = message.signDoc ? exports.SignDocDirectAux.toJSON(message.signDoc) : void 0);
			message.mode !== void 0 && (obj.mode = (0, signing_1.signModeToJSON)(message.mode));
			message.sig !== void 0 && (obj.sig = (0, helpers_1.base64FromBytes)(message.sig !== void 0 ? message.sig : new Uint8Array()));
			return obj;
		},
		fromPartial(object) {
			const message = createBaseAuxSignerData();
			message.address = object.address ?? "";
			if (object.signDoc !== void 0 && object.signDoc !== null) message.signDoc = exports.SignDocDirectAux.fromPartial(object.signDoc);
			message.mode = object.mode ?? 0;
			message.sig = object.sig ?? new Uint8Array();
			return message;
		}
	};
}));
//#endregion
//#region node_modules/@cosmjs/proto-signing/build/decode.js
var require_decode = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.decodeTxRaw = decodeTxRaw;
	var tx_1 = require_tx$2();
	/**
	* Takes a serialized TxRaw (the bytes stored in Tendermint) and decodes it into something usable.
	*/
	function decodeTxRaw(tx) {
		const txRaw = tx_1.TxRaw.decode(tx);
		return {
			authInfo: tx_1.AuthInfo.decode(txRaw.authInfoBytes),
			body: tx_1.TxBody.decode(txRaw.bodyBytes),
			signatures: txRaw.signatures
		};
	}
}));
//#endregion
//#region node_modules/@cosmjs/utils/build/arrays.js
var require_arrays = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.arrayContentEquals = arrayContentEquals;
	exports.arrayContentStartsWith = arrayContentStartsWith;
	/**
	* Compares the content of two arrays-like objects for equality.
	*
	* Equality is defined as having equal length and element values, where element equality means `===` returning `true`.
	*
	* This allows you to compare the content of a Buffer, Uint8Array or number[], ignoring the specific type.
	* As a consequence, this returns different results than Jasmine's `toEqual`, which ensures elements have the same type.
	*/
	function arrayContentEquals(a, b) {
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; ++i) if (a[i] !== b[i]) return false;
		return true;
	}
	/**
	* Checks if `a` starts with the contents of `b`.
	*
	* This requires equality of the element values, where element equality means `===` returning `true`.
	*
	* This allows you to compare the content of a Buffer, Uint8Array or number[], ignoring the specific type.
	* As a consequence, this returns different results than Jasmine's `toEqual`, which ensures elements have the same type.
	*/
	function arrayContentStartsWith(a, b) {
		if (a.length < b.length) return false;
		for (let i = 0; i < b.length; ++i) if (a[i] !== b[i]) return false;
		return true;
	}
}));
//#endregion
//#region node_modules/@cosmjs/utils/build/assert.js
var require_assert = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.assert = assert;
	exports.assertDefined = assertDefined;
	exports.assertDefinedAndNotNull = assertDefinedAndNotNull;
	function assert(condition, msg) {
		if (!condition) throw new Error(msg || "condition is not truthy");
	}
	function assertDefined(value, msg) {
		if (value === void 0) throw new Error(msg ?? "value is undefined");
	}
	function assertDefinedAndNotNull(value, msg) {
		if (value === void 0 || value === null) throw new Error(msg ?? "value is undefined or null");
	}
}));
//#endregion
//#region node_modules/@cosmjs/utils/build/sleep.js
var require_sleep = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.sleep = sleep;
	async function sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}));
//#endregion
//#region node_modules/@cosmjs/utils/build/typechecks.js
var require_typechecks = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isNonNullObject = isNonNullObject;
	exports.isUint8Array = isUint8Array;
	exports.isDefined = isDefined;
	/**
	* Checks if data is a non-null object (i.e. matches the TypeScript object type).
	*
	* Note: this returns true for arrays, which are objects in JavaScript
	* even though array and object are different types in JSON.
	*
	* @see https://www.typescriptlang.org/docs/handbook/basic-types.html#object
	*/
	function isNonNullObject(data) {
		return typeof data === "object" && data !== null;
	}
	/**
	* Checks if data is an Uint8Array. Note: Buffer is treated as not a Uint8Array
	*/
	function isUint8Array(data) {
		if (!isNonNullObject(data)) return false;
		if (Object.prototype.toString.call(data) !== "[object Uint8Array]") return false;
		if (typeof Buffer !== "undefined" && typeof Buffer.isBuffer !== "undefined") {
			if (Buffer.isBuffer(data)) return false;
		}
		return true;
	}
	/**
	* Checks if input is not undefined in a TypeScript-friendly way.
	*
	* This is convenient to use in e.g. `Array.filter` as it will convert
	* the type of a `Array<Foo | undefined>` to `Array<Foo>`.
	*/
	function isDefined(value) {
		return value !== void 0;
	}
}));
//#endregion
//#region node_modules/@cosmjs/utils/build/index.js
var require_build$5 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isUint8Array = exports.isNonNullObject = exports.isDefined = exports.sleep = exports.assertDefinedAndNotNull = exports.assertDefined = exports.assert = exports.arrayContentStartsWith = exports.arrayContentEquals = void 0;
	var arrays_1 = require_arrays();
	Object.defineProperty(exports, "arrayContentEquals", {
		enumerable: true,
		get: function() {
			return arrays_1.arrayContentEquals;
		}
	});
	Object.defineProperty(exports, "arrayContentStartsWith", {
		enumerable: true,
		get: function() {
			return arrays_1.arrayContentStartsWith;
		}
	});
	var assert_1 = require_assert();
	Object.defineProperty(exports, "assert", {
		enumerable: true,
		get: function() {
			return assert_1.assert;
		}
	});
	Object.defineProperty(exports, "assertDefined", {
		enumerable: true,
		get: function() {
			return assert_1.assertDefined;
		}
	});
	Object.defineProperty(exports, "assertDefinedAndNotNull", {
		enumerable: true,
		get: function() {
			return assert_1.assertDefinedAndNotNull;
		}
	});
	var sleep_1 = require_sleep();
	Object.defineProperty(exports, "sleep", {
		enumerable: true,
		get: function() {
			return sleep_1.sleep;
		}
	});
	var typechecks_1 = require_typechecks();
	Object.defineProperty(exports, "isDefined", {
		enumerable: true,
		get: function() {
			return typechecks_1.isDefined;
		}
	});
	Object.defineProperty(exports, "isNonNullObject", {
		enumerable: true,
		get: function() {
			return typechecks_1.isNonNullObject;
		}
	});
	Object.defineProperty(exports, "isUint8Array", {
		enumerable: true,
		get: function() {
			return typechecks_1.isUint8Array;
		}
	});
}));
//#endregion
//#region node_modules/hash-wasm/dist/index.esm.js
var index_esm_exports = /* @__PURE__ */ __exportAll({
	adler32: () => adler32,
	argon2Verify: () => argon2Verify,
	argon2d: () => argon2d,
	argon2i: () => argon2i,
	argon2id: () => argon2id,
	bcrypt: () => bcrypt,
	bcryptVerify: () => bcryptVerify,
	blake2b: () => blake2b,
	blake2s: () => blake2s,
	blake3: () => blake3,
	crc32: () => crc32,
	crc64: () => crc64,
	createAdler32: () => createAdler32,
	createBLAKE2b: () => createBLAKE2b,
	createBLAKE2s: () => createBLAKE2s,
	createBLAKE3: () => createBLAKE3,
	createCRC32: () => createCRC32,
	createCRC64: () => createCRC64,
	createHMAC: () => createHMAC,
	createKeccak: () => createKeccak,
	createMD4: () => createMD4,
	createMD5: () => createMD5,
	createRIPEMD160: () => createRIPEMD160,
	createSHA1: () => createSHA1,
	createSHA224: () => createSHA224,
	createSHA256: () => createSHA256,
	createSHA3: () => createSHA3,
	createSHA384: () => createSHA384,
	createSHA512: () => createSHA512,
	createSM3: () => createSM3,
	createWhirlpool: () => createWhirlpool,
	createXXHash128: () => createXXHash128,
	createXXHash3: () => createXXHash3,
	createXXHash32: () => createXXHash32,
	createXXHash64: () => createXXHash64,
	keccak: () => keccak,
	md4: () => md4,
	md5: () => md5,
	pbkdf2: () => pbkdf2,
	ripemd160: () => ripemd160,
	scrypt: () => scrypt,
	sha1: () => sha1,
	sha224: () => sha224,
	sha256: () => sha256,
	sha3: () => sha3,
	sha384: () => sha384,
	sha512: () => sha512,
	sm3: () => sm3,
	whirlpool: () => whirlpool,
	xxhash128: () => xxhash128,
	xxhash3: () => xxhash3,
	xxhash32: () => xxhash32,
	xxhash64: () => xxhash64
});
/*!
* hash-wasm (https://www.npmjs.com/package/hash-wasm)
* (c) Dani Biro
* @license MIT
*/
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function __awaiter(thisArg, _arguments, P, generator) {
	function adopt(value) {
		return value instanceof P ? value : new P(function(resolve) {
			resolve(value);
		});
	}
	return new (P || (P = Promise))(function(resolve, reject) {
		function fulfilled(value) {
			try {
				step(generator.next(value));
			} catch (e) {
				reject(e);
			}
		}
		function rejected(value) {
			try {
				step(generator["throw"](value));
			} catch (e) {
				reject(e);
			}
		}
		function step(result) {
			result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
		}
		step((generator = generator.apply(thisArg, _arguments || [])).next());
	});
}
function getGlobal() {
	if (typeof globalThis !== "undefined") return globalThis;
	if (typeof self !== "undefined") return self;
	if (typeof window !== "undefined") return window;
	return global;
}
function intArrayToString(arr, len) {
	return String.fromCharCode(...arr.subarray(0, len));
}
function hexCharCodesToInt(a, b) {
	return (a & 15) + (a >> 6 | a >> 3 & 8) << 4 | (b & 15) + (b >> 6 | b >> 3 & 8);
}
function writeHexToUInt8(buf, str) {
	const size = str.length >> 1;
	for (let i = 0; i < size; i++) {
		const index = i << 1;
		buf[i] = hexCharCodesToInt(str.charCodeAt(index), str.charCodeAt(index + 1));
	}
}
function hexStringEqualsUInt8(str, buf) {
	if (str.length !== buf.length * 2) return false;
	for (let i = 0; i < buf.length; i++) {
		const strIndex = i << 1;
		if (buf[i] !== hexCharCodesToInt(str.charCodeAt(strIndex), str.charCodeAt(strIndex + 1))) return false;
	}
	return true;
}
function getDigestHex(tmpBuffer, input, hashLength) {
	let p = 0;
	for (let i = 0; i < hashLength; i++) {
		let nibble = input[i] >>> 4;
		tmpBuffer[p++] = nibble > 9 ? nibble + alpha : nibble + digit;
		nibble = input[i] & 15;
		tmpBuffer[p++] = nibble > 9 ? nibble + alpha : nibble + digit;
	}
	return String.fromCharCode.apply(null, tmpBuffer);
}
function encodeBase64(data, pad = true) {
	const len = data.length;
	const extraBytes = len % 3;
	const parts = [];
	const len2 = len - extraBytes;
	for (let i = 0; i < len2; i += 3) {
		const tmp = (data[i] << 16 & 16711680) + (data[i + 1] << 8 & 65280) + (data[i + 2] & 255);
		const triplet = base64Chars.charAt(tmp >> 18 & 63) + base64Chars.charAt(tmp >> 12 & 63) + base64Chars.charAt(tmp >> 6 & 63) + base64Chars.charAt(tmp & 63);
		parts.push(triplet);
	}
	if (extraBytes === 1) {
		const tmp = data[len - 1];
		const a = base64Chars.charAt(tmp >> 2);
		const b = base64Chars.charAt(tmp << 4 & 63);
		parts.push(`${a}${b}`);
		if (pad) parts.push("==");
	} else if (extraBytes === 2) {
		const tmp = (data[len - 2] << 8) + data[len - 1];
		const a = base64Chars.charAt(tmp >> 10);
		const b = base64Chars.charAt(tmp >> 4 & 63);
		const c = base64Chars.charAt(tmp << 2 & 63);
		parts.push(`${a}${b}${c}`);
		if (pad) parts.push("=");
	}
	return parts.join("");
}
function getDecodeBase64Length(data) {
	let bufferLength = Math.floor(data.length * .75);
	const len = data.length;
	if (data[len - 1] === "=") {
		bufferLength -= 1;
		if (data[len - 2] === "=") bufferLength -= 1;
	}
	return bufferLength;
}
function decodeBase64(data) {
	const bufferLength = getDecodeBase64Length(data);
	const len = data.length;
	const bytes = new Uint8Array(bufferLength);
	let p = 0;
	for (let i = 0; i < len; i += 4) {
		const encoded1 = base64Lookup[data.charCodeAt(i)];
		const encoded2 = base64Lookup[data.charCodeAt(i + 1)];
		const encoded3 = base64Lookup[data.charCodeAt(i + 2)];
		const encoded4 = base64Lookup[data.charCodeAt(i + 3)];
		bytes[p] = encoded1 << 2 | encoded2 >> 4;
		p += 1;
		bytes[p] = (encoded2 & 15) << 4 | encoded3 >> 2;
		p += 1;
		bytes[p] = (encoded3 & 3) << 6 | encoded4 & 63;
		p += 1;
	}
	return bytes;
}
function WASMInterface(binary, hashLength) {
	return __awaiter(this, void 0, void 0, function* () {
		let wasmInstance = null;
		let memoryView = null;
		let initialized = false;
		if (typeof WebAssembly === "undefined") throw new Error("WebAssembly is not supported in this environment!");
		const writeMemory = (data, offset = 0) => {
			memoryView.set(data, offset);
		};
		const getMemory = () => memoryView;
		const getExports = () => wasmInstance.exports;
		const setMemorySize = (totalSize) => {
			wasmInstance.exports.Hash_SetMemorySize(totalSize);
			const arrayOffset = wasmInstance.exports.Hash_GetBuffer();
			const memoryBuffer = wasmInstance.exports.memory.buffer;
			memoryView = new Uint8Array(memoryBuffer, arrayOffset, totalSize);
		};
		const getStateSize = () => {
			return new DataView(wasmInstance.exports.memory.buffer).getUint32(wasmInstance.exports.STATE_SIZE, true);
		};
		const loadWASMPromise = wasmMutex.dispatch(() => __awaiter(this, void 0, void 0, function* () {
			if (!wasmModuleCache.has(binary.name)) {
				const asm = decodeBase64(binary.data);
				const promise = WebAssembly.compile(asm);
				wasmModuleCache.set(binary.name, promise);
			}
			const module = yield wasmModuleCache.get(binary.name);
			wasmInstance = yield WebAssembly.instantiate(module, {});
		}));
		const setupInterface = () => __awaiter(this, void 0, void 0, function* () {
			if (!wasmInstance) yield loadWASMPromise;
			const arrayOffset = wasmInstance.exports.Hash_GetBuffer();
			const memoryBuffer = wasmInstance.exports.memory.buffer;
			memoryView = new Uint8Array(memoryBuffer, arrayOffset, MAX_HEAP);
		});
		const init = (bits = null) => {
			initialized = true;
			wasmInstance.exports.Hash_Init(bits);
		};
		const updateUInt8Array = (data) => {
			let read = 0;
			while (read < data.length) {
				const chunk = data.subarray(read, read + MAX_HEAP);
				read += chunk.length;
				memoryView.set(chunk);
				wasmInstance.exports.Hash_Update(chunk.length);
			}
		};
		const update = (data) => {
			if (!initialized) throw new Error("update() called before init()");
			updateUInt8Array(getUInt8Buffer(data));
		};
		const digestChars = new Uint8Array(hashLength * 2);
		const digest = (outputType, padding = null) => {
			if (!initialized) throw new Error("digest() called before init()");
			initialized = false;
			wasmInstance.exports.Hash_Final(padding);
			if (outputType === "binary") return memoryView.slice(0, hashLength);
			return getDigestHex(digestChars, memoryView, hashLength);
		};
		const save = () => {
			if (!initialized) throw new Error("save() can only be called after init() and before digest()");
			const stateOffset = wasmInstance.exports.Hash_GetState();
			const stateLength = getStateSize();
			const memoryBuffer = wasmInstance.exports.memory.buffer;
			const internalState = new Uint8Array(memoryBuffer, stateOffset, stateLength);
			const prefixedState = new Uint8Array(WASM_FUNC_HASH_LENGTH + stateLength);
			writeHexToUInt8(prefixedState, binary.hash);
			prefixedState.set(internalState, WASM_FUNC_HASH_LENGTH);
			return prefixedState;
		};
		const load = (state) => {
			if (!(state instanceof Uint8Array)) throw new Error("load() expects an Uint8Array generated by save()");
			const stateOffset = wasmInstance.exports.Hash_GetState();
			const stateLength = getStateSize();
			const overallLength = WASM_FUNC_HASH_LENGTH + stateLength;
			const memoryBuffer = wasmInstance.exports.memory.buffer;
			if (state.length !== overallLength) throw new Error(`Bad state length (expected ${overallLength} bytes, got ${state.length})`);
			if (!hexStringEqualsUInt8(binary.hash, state.subarray(0, WASM_FUNC_HASH_LENGTH))) throw new Error("This state was written by an incompatible hash implementation");
			const internalState = state.subarray(WASM_FUNC_HASH_LENGTH);
			new Uint8Array(memoryBuffer, stateOffset, stateLength).set(internalState);
			initialized = true;
		};
		const isDataShort = (data) => {
			if (typeof data === "string") return data.length < MAX_HEAP / 4;
			return data.byteLength < MAX_HEAP;
		};
		let canSimplify = isDataShort;
		switch (binary.name) {
			case "argon2":
			case "scrypt":
				canSimplify = () => true;
				break;
			case "blake2b":
			case "blake2s":
				canSimplify = (data, initParam) => initParam <= 512 && isDataShort(data);
				break;
			case "blake3":
				canSimplify = (data, initParam) => initParam === 0 && isDataShort(data);
				break;
			case "xxhash64":
			case "xxhash3":
			case "xxhash128":
			case "crc64":
				canSimplify = () => false;
				break;
		}
		const calculate = (data, initParam = null, digestParam = null) => {
			if (!canSimplify(data, initParam)) {
				init(initParam);
				update(data);
				return digest("hex", digestParam);
			}
			const buffer = getUInt8Buffer(data);
			memoryView.set(buffer);
			wasmInstance.exports.Hash_Calculate(buffer.length, initParam, digestParam);
			return getDigestHex(digestChars, memoryView, hashLength);
		};
		yield setupInterface();
		return {
			getMemory,
			writeMemory,
			getExports,
			setMemorySize,
			init,
			update,
			digest,
			save,
			load,
			calculate,
			hashLength
		};
	});
}
function lockedCreate(mutex, binary, hashLength) {
	return __awaiter(this, void 0, void 0, function* () {
		const unlock = yield mutex.lock();
		const wasm = yield WASMInterface(binary, hashLength);
		unlock();
		return wasm;
	});
}
/**
* Calculates Adler-32 hash. The resulting 32-bit hash is stored in
* network byte order (big-endian).
*
* @param data Input data (string, Buffer or TypedArray)
* @returns Computed hash as a hexadecimal string
*/
function adler32(data) {
	if (wasmCache$l === null) return lockedCreate(mutex$l, wasmJson$l, 4).then((wasm) => {
		wasmCache$l = wasm;
		return wasmCache$l.calculate(data);
	});
	try {
		const hash = wasmCache$l.calculate(data);
		return Promise.resolve(hash);
	} catch (err) {
		return Promise.reject(err);
	}
}
/**
* Creates a new Adler-32 hash instance
*/
function createAdler32() {
	return WASMInterface(wasmJson$l, 4).then((wasm) => {
		wasm.init();
		const obj = {
			init: () => {
				wasm.init();
				return obj;
			},
			update: (data) => {
				wasm.update(data);
				return obj;
			},
			digest: (outputType) => wasm.digest(outputType),
			save: () => wasm.save(),
			load: (data) => {
				wasm.load(data);
				return obj;
			},
			blockSize: 4,
			digestSize: 4
		};
		return obj;
	});
}
function validateBits$4(bits) {
	if (!Number.isInteger(bits) || bits < 8 || bits > 512 || bits % 8 !== 0) return /* @__PURE__ */ new Error("Invalid variant! Valid values: 8, 16, ..., 512");
	return null;
}
function getInitParam$1(outputBits, keyBits) {
	return outputBits | keyBits << 16;
}
/**
* Calculates BLAKE2b hash
* @param data Input data (string, Buffer or TypedArray)
* @param bits Number of output bits, which has to be a number
*             divisible by 8, between 8 and 512. Defaults to 512.
* @param key Optional key (string, Buffer or TypedArray). Maximum length is 64 bytes.
* @returns Computed hash as a hexadecimal string
*/
function blake2b(data, bits = 512, key = null) {
	if (validateBits$4(bits)) return Promise.reject(validateBits$4(bits));
	let keyBuffer = null;
	let initParam = bits;
	if (key !== null) {
		keyBuffer = getUInt8Buffer(key);
		if (keyBuffer.length > 64) return Promise.reject(/* @__PURE__ */ new Error("Max key length is 64 bytes"));
		initParam = getInitParam$1(bits, keyBuffer.length);
	}
	const hashLength = bits / 8;
	if (wasmCache$k === null || wasmCache$k.hashLength !== hashLength) return lockedCreate(mutex$k, wasmJson$j, hashLength).then((wasm) => {
		wasmCache$k = wasm;
		if (initParam > 512) wasmCache$k.writeMemory(keyBuffer);
		return wasmCache$k.calculate(data, initParam);
	});
	try {
		if (initParam > 512) wasmCache$k.writeMemory(keyBuffer);
		const hash = wasmCache$k.calculate(data, initParam);
		return Promise.resolve(hash);
	} catch (err) {
		return Promise.reject(err);
	}
}
/**
* Creates a new BLAKE2b hash instance
* @param bits Number of output bits, which has to be a number
*             divisible by 8, between 8 and 512. Defaults to 512.
* @param key Optional key (string, Buffer or TypedArray). Maximum length is 64 bytes.
*/
function createBLAKE2b(bits = 512, key = null) {
	if (validateBits$4(bits)) return Promise.reject(validateBits$4(bits));
	let keyBuffer = null;
	let initParam = bits;
	if (key !== null) {
		keyBuffer = getUInt8Buffer(key);
		if (keyBuffer.length > 64) return Promise.reject(/* @__PURE__ */ new Error("Max key length is 64 bytes"));
		initParam = getInitParam$1(bits, keyBuffer.length);
	}
	const outputSize = bits / 8;
	return WASMInterface(wasmJson$j, outputSize).then((wasm) => {
		if (initParam > 512) wasm.writeMemory(keyBuffer);
		wasm.init(initParam);
		const obj = {
			init: initParam > 512 ? () => {
				wasm.writeMemory(keyBuffer);
				wasm.init(initParam);
				return obj;
			} : () => {
				wasm.init(initParam);
				return obj;
			},
			update: (data) => {
				wasm.update(data);
				return obj;
			},
			digest: (outputType) => wasm.digest(outputType),
			save: () => wasm.save(),
			load: (data) => {
				wasm.load(data);
				return obj;
			},
			blockSize: 128,
			digestSize: outputSize
		};
		return obj;
	});
}
function encodeResult(salt, options, res) {
	const parameters = [
		`m=${options.memorySize}`,
		`t=${options.iterations}`,
		`p=${options.parallelism}`
	].join(",");
	return `$argon2${options.hashType}$v=19$${parameters}$${encodeBase64(salt, false)}$${encodeBase64(res, false)}`;
}
function int32LE(x) {
	uint32View.setInt32(0, x, true);
	return new Uint8Array(uint32View.buffer);
}
function hashFunc(blake512, buf, len) {
	return __awaiter(this, void 0, void 0, function* () {
		if (len <= 64) {
			const blake = yield createBLAKE2b(len * 8);
			blake.update(int32LE(len));
			blake.update(buf);
			return blake.digest("binary");
		}
		const r = Math.ceil(len / 32) - 2;
		const ret = new Uint8Array(len);
		blake512.init();
		blake512.update(int32LE(len));
		blake512.update(buf);
		let vp = blake512.digest("binary");
		ret.set(vp.subarray(0, 32), 0);
		for (let i = 1; i < r; i++) {
			blake512.init();
			blake512.update(vp);
			vp = blake512.digest("binary");
			ret.set(vp.subarray(0, 32), i * 32);
		}
		const partialBytesNeeded = len - 32 * r;
		let blakeSmall;
		if (partialBytesNeeded === 64) {
			blakeSmall = blake512;
			blakeSmall.init();
		} else blakeSmall = yield createBLAKE2b(partialBytesNeeded * 8);
		blakeSmall.update(vp);
		vp = blakeSmall.digest("binary");
		ret.set(vp.subarray(0, partialBytesNeeded), r * 32);
		return ret;
	});
}
function getHashType(type) {
	switch (type) {
		case "d": return 0;
		case "i": return 1;
		default: return 2;
	}
}
function argon2Internal(options) {
	return __awaiter(this, void 0, void 0, function* () {
		var _a;
		const { parallelism, iterations, hashLength } = options;
		const password = getUInt8Buffer(options.password);
		const salt = getUInt8Buffer(options.salt);
		const version = 19;
		const hashType = getHashType(options.hashType);
		const { memorySize } = options;
		const secret = getUInt8Buffer((_a = options.secret) !== null && _a !== void 0 ? _a : "");
		const [argon2Interface, blake512] = yield Promise.all([WASMInterface(wasmJson$k, 1024), createBLAKE2b(512)]);
		argon2Interface.setMemorySize(memorySize * 1024 + 1024);
		const initVector = new Uint8Array(24);
		const initVectorView = new DataView(initVector.buffer);
		initVectorView.setInt32(0, parallelism, true);
		initVectorView.setInt32(4, hashLength, true);
		initVectorView.setInt32(8, memorySize, true);
		initVectorView.setInt32(12, iterations, true);
		initVectorView.setInt32(16, version, true);
		initVectorView.setInt32(20, hashType, true);
		argon2Interface.writeMemory(initVector, memorySize * 1024);
		blake512.init();
		blake512.update(initVector);
		blake512.update(int32LE(password.length));
		blake512.update(password);
		blake512.update(int32LE(salt.length));
		blake512.update(salt);
		blake512.update(int32LE(secret.length));
		blake512.update(secret);
		blake512.update(int32LE(0));
		const lanes = Math.floor(memorySize / (parallelism * 4)) * 4;
		const param = new Uint8Array(72);
		const H0 = blake512.digest("binary");
		param.set(H0);
		for (let lane = 0; lane < parallelism; lane++) {
			param.set(int32LE(0), 64);
			param.set(int32LE(lane), 68);
			let position = lane * lanes;
			let chunk = yield hashFunc(blake512, param, 1024);
			argon2Interface.writeMemory(chunk, position * 1024);
			position += 1;
			param.set(int32LE(1), 64);
			chunk = yield hashFunc(blake512, param, 1024);
			argon2Interface.writeMemory(chunk, position * 1024);
		}
		const C = new Uint8Array(1024);
		writeHexToUInt8(C, argon2Interface.calculate(new Uint8Array([]), memorySize));
		const res = yield hashFunc(blake512, C, hashLength);
		if (options.outputType === "hex") return getDigestHex(new Uint8Array(hashLength * 2), res, hashLength);
		if (options.outputType === "encoded") return encodeResult(salt, options, res);
		return res;
	});
}
/**
* Calculates hash using the argon2i password-hashing function
* @returns Computed hash
*/
function argon2i(options) {
	return __awaiter(this, void 0, void 0, function* () {
		validateOptions$3(options);
		return argon2Internal(Object.assign(Object.assign({}, options), { hashType: "i" }));
	});
}
/**
* Calculates hash using the argon2id password-hashing function
* @returns Computed hash
*/
function argon2id(options) {
	return __awaiter(this, void 0, void 0, function* () {
		validateOptions$3(options);
		return argon2Internal(Object.assign(Object.assign({}, options), { hashType: "id" }));
	});
}
/**
* Calculates hash using the argon2d password-hashing function
* @returns Computed hash
*/
function argon2d(options) {
	return __awaiter(this, void 0, void 0, function* () {
		validateOptions$3(options);
		return argon2Internal(Object.assign(Object.assign({}, options), { hashType: "d" }));
	});
}
/**
* Verifies password using the argon2 password-hashing function
* @returns True if the encoded hash matches the password
*/
function argon2Verify(options) {
	return __awaiter(this, void 0, void 0, function* () {
		validateVerifyOptions$1(options);
		const params = getHashParameters(options.password, options.hash, options.secret);
		validateOptions$3(params);
		const hashStart = options.hash.lastIndexOf("$") + 1;
		return (yield argon2Internal(params)).substring(hashStart) === options.hash.substring(hashStart);
	});
}
function validateBits$3(bits) {
	if (!Number.isInteger(bits) || bits < 8 || bits > 256 || bits % 8 !== 0) return /* @__PURE__ */ new Error("Invalid variant! Valid values: 8, 16, ..., 256");
	return null;
}
function getInitParam(outputBits, keyBits) {
	return outputBits | keyBits << 16;
}
/**
* Calculates BLAKE2s hash
* @param data Input data (string, Buffer or TypedArray)
* @param bits Number of output bits, which has to be a number
*             divisible by 8, between 8 and 256. Defaults to 256.
* @param key Optional key (string, Buffer or TypedArray). Maximum length is 32 bytes.
* @returns Computed hash as a hexadecimal string
*/
function blake2s(data, bits = 256, key = null) {
	if (validateBits$3(bits)) return Promise.reject(validateBits$3(bits));
	let keyBuffer = null;
	let initParam = bits;
	if (key !== null) {
		keyBuffer = getUInt8Buffer(key);
		if (keyBuffer.length > 32) return Promise.reject(/* @__PURE__ */ new Error("Max key length is 32 bytes"));
		initParam = getInitParam(bits, keyBuffer.length);
	}
	const hashLength = bits / 8;
	if (wasmCache$j === null || wasmCache$j.hashLength !== hashLength) return lockedCreate(mutex$j, wasmJson$i, hashLength).then((wasm) => {
		wasmCache$j = wasm;
		if (initParam > 512) wasmCache$j.writeMemory(keyBuffer);
		return wasmCache$j.calculate(data, initParam);
	});
	try {
		if (initParam > 512) wasmCache$j.writeMemory(keyBuffer);
		const hash = wasmCache$j.calculate(data, initParam);
		return Promise.resolve(hash);
	} catch (err) {
		return Promise.reject(err);
	}
}
/**
* Creates a new BLAKE2s hash instance
* @param bits Number of output bits, which has to be a number
*             divisible by 8, between 8 and 256. Defaults to 256.
* @param key Optional key (string, Buffer or TypedArray). Maximum length is 32 bytes.
*/
function createBLAKE2s(bits = 256, key = null) {
	if (validateBits$3(bits)) return Promise.reject(validateBits$3(bits));
	let keyBuffer = null;
	let initParam = bits;
	if (key !== null) {
		keyBuffer = getUInt8Buffer(key);
		if (keyBuffer.length > 32) return Promise.reject(/* @__PURE__ */ new Error("Max key length is 32 bytes"));
		initParam = getInitParam(bits, keyBuffer.length);
	}
	const outputSize = bits / 8;
	return WASMInterface(wasmJson$i, outputSize).then((wasm) => {
		if (initParam > 512) wasm.writeMemory(keyBuffer);
		wasm.init(initParam);
		const obj = {
			init: initParam > 512 ? () => {
				wasm.writeMemory(keyBuffer);
				wasm.init(initParam);
				return obj;
			} : () => {
				wasm.init(initParam);
				return obj;
			},
			update: (data) => {
				wasm.update(data);
				return obj;
			},
			digest: (outputType) => wasm.digest(outputType),
			save: () => wasm.save(),
			load: (data) => {
				wasm.load(data);
				return obj;
			},
			blockSize: 64,
			digestSize: outputSize
		};
		return obj;
	});
}
function validateBits$2(bits) {
	if (!Number.isInteger(bits) || bits < 8 || bits % 8 !== 0) return /* @__PURE__ */ new Error("Invalid variant! Valid values: 8, 16, ...");
	return null;
}
/**
* Calculates BLAKE3 hash
* @param data Input data (string, Buffer or TypedArray)
* @param bits Number of output bits, which has to be a number
*             divisible by 8. Defaults to 256.
* @param key Optional key (string, Buffer or TypedArray). Length should be 32 bytes.
* @returns Computed hash as a hexadecimal string
*/
function blake3(data, bits = 256, key = null) {
	if (validateBits$2(bits)) return Promise.reject(validateBits$2(bits));
	let keyBuffer = null;
	let initParam = 0;
	if (key !== null) {
		keyBuffer = getUInt8Buffer(key);
		if (keyBuffer.length !== 32) return Promise.reject(/* @__PURE__ */ new Error("Key length must be exactly 32 bytes"));
		initParam = 32;
	}
	const hashLength = bits / 8;
	const digestParam = hashLength;
	if (wasmCache$i === null || wasmCache$i.hashLength !== hashLength) return lockedCreate(mutex$i, wasmJson$h, hashLength).then((wasm) => {
		wasmCache$i = wasm;
		if (initParam === 32) wasmCache$i.writeMemory(keyBuffer);
		return wasmCache$i.calculate(data, initParam, digestParam);
	});
	try {
		if (initParam === 32) wasmCache$i.writeMemory(keyBuffer);
		const hash = wasmCache$i.calculate(data, initParam, digestParam);
		return Promise.resolve(hash);
	} catch (err) {
		return Promise.reject(err);
	}
}
/**
* Creates a new BLAKE3 hash instance
* @param bits Number of output bits, which has to be a number
*             divisible by 8. Defaults to 256.
* @param key Optional key (string, Buffer or TypedArray). Length should be 32 bytes.
*/
function createBLAKE3(bits = 256, key = null) {
	if (validateBits$2(bits)) return Promise.reject(validateBits$2(bits));
	let keyBuffer = null;
	let initParam = 0;
	if (key !== null) {
		keyBuffer = getUInt8Buffer(key);
		if (keyBuffer.length !== 32) return Promise.reject(/* @__PURE__ */ new Error("Key length must be exactly 32 bytes"));
		initParam = 32;
	}
	const outputSize = bits / 8;
	const digestParam = outputSize;
	return WASMInterface(wasmJson$h, outputSize).then((wasm) => {
		if (initParam === 32) wasm.writeMemory(keyBuffer);
		wasm.init(initParam);
		const obj = {
			init: initParam === 32 ? () => {
				wasm.writeMemory(keyBuffer);
				wasm.init(initParam);
				return obj;
			} : () => {
				wasm.init(initParam);
				return obj;
			},
			update: (data) => {
				wasm.update(data);
				return obj;
			},
			digest: (outputType) => wasm.digest(outputType, digestParam),
			save: () => wasm.save(),
			load: (data) => {
				wasm.load(data);
				return obj;
			},
			blockSize: 64,
			digestSize: outputSize
		};
		return obj;
	});
}
function validatePoly(poly) {
	if (!Number.isInteger(poly) || poly < 0 || poly > 4294967295) return /* @__PURE__ */ new Error("Polynomial must be a valid 32-bit long unsigned integer");
	return null;
}
/**
* Calculates CRC-32 hash
* @param data Input data (string, Buffer or TypedArray)
* @param polynomial Input polynomial (defaults to 0xedb88320, for CRC32C use 0x82f63b78)
* @returns Computed hash as a hexadecimal string
*/
function crc32(data, polynomial = 3988292384) {
	if (validatePoly(polynomial)) return Promise.reject(validatePoly(polynomial));
	if (wasmCache$h === null) return lockedCreate(mutex$h, wasmJson$g, 4).then((wasm) => {
		wasmCache$h = wasm;
		return wasmCache$h.calculate(data, polynomial);
	});
	try {
		const hash = wasmCache$h.calculate(data, polynomial);
		return Promise.resolve(hash);
	} catch (err) {
		return Promise.reject(err);
	}
}
/**
* Creates a new CRC-32 hash instance
* @param polynomial Input polynomial (defaults to 0xedb88320, for CRC32C use 0x82f63b78)
*/
function createCRC32(polynomial = 3988292384) {
	if (validatePoly(polynomial)) return Promise.reject(validatePoly(polynomial));
	return WASMInterface(wasmJson$g, 4).then((wasm) => {
		wasm.init(polynomial);
		const obj = {
			init: () => {
				wasm.init(polynomial);
				return obj;
			},
			update: (data) => {
				wasm.update(data);
				return obj;
			},
			digest: (outputType) => wasm.digest(outputType),
			save: () => wasm.save(),
			load: (data) => {
				wasm.load(data);
				return obj;
			},
			blockSize: 4,
			digestSize: 4
		};
		return obj;
	});
}
function parsePoly(poly) {
	const errText = "Polynomial must be provided as a 16 char long hex string";
	if (typeof poly !== "string" || poly.length !== 16) return {
		hi: 0,
		lo: 0,
		err: new Error(errText)
	};
	const hi = Number(`0x${poly.slice(0, 8)}`);
	const lo = Number(`0x${poly.slice(8)}`);
	if (Number.isNaN(hi) || Number.isNaN(lo)) return {
		hi,
		lo,
		err: new Error(errText)
	};
	return {
		hi,
		lo,
		err: null
	};
}
function writePoly(arr, lo, hi) {
	const buffer = new DataView(arr);
	buffer.setUint32(0, lo, true);
	buffer.setUint32(4, hi, true);
}
/**
* Calculates CRC-64 hash
* @param data Input data (string, Buffer or TypedArray)
* @param polynomial Input polynomial (defaults to 'c96c5795d7870f42' - ECMA)
* @returns Computed hash as a hexadecimal string
*/
function crc64(data, polynomial = "c96c5795d7870f42") {
	const { hi, lo, err } = parsePoly(polynomial);
	if (err !== null) return Promise.reject(err);
	if (wasmCache$g === null) return lockedCreate(mutex$g, wasmJson$f, 8).then((wasm) => {
		wasmCache$g = wasm;
		writePoly(polyBuffer.buffer, lo, hi);
		wasmCache$g.writeMemory(polyBuffer);
		return wasmCache$g.calculate(data);
	});
	try {
		writePoly(polyBuffer.buffer, lo, hi);
		wasmCache$g.writeMemory(polyBuffer);
		const hash = wasmCache$g.calculate(data);
		return Promise.resolve(hash);
	} catch (err) {
		return Promise.reject(err);
	}
}
/**
* Creates a new CRC-64 hash instance
* @param polynomial Input polynomial (defaults to 'c96c5795d7870f42' - ECMA)
*/
function createCRC64(polynomial = "c96c5795d7870f42") {
	const { hi, lo, err } = parsePoly(polynomial);
	if (err !== null) return Promise.reject(err);
	return WASMInterface(wasmJson$f, 8).then((wasm) => {
		const instanceBuffer = new Uint8Array(8);
		writePoly(instanceBuffer.buffer, lo, hi);
		wasm.writeMemory(instanceBuffer);
		wasm.init();
		const obj = {
			init: () => {
				wasm.writeMemory(instanceBuffer);
				wasm.init();
				return obj;
			},
			update: (data) => {
				wasm.update(data);
				return obj;
			},
			digest: (outputType) => wasm.digest(outputType),
			save: () => wasm.save(),
			load: (data) => {
				wasm.load(data);
				return obj;
			},
			blockSize: 8,
			digestSize: 8
		};
		return obj;
	});
}
/**
* Calculates MD4 hash
* @param data Input data (string, Buffer or TypedArray)
* @returns Computed hash as a hexadecimal string
*/
function md4(data) {
	if (wasmCache$f === null) return lockedCreate(mutex$f, wasmJson$e, 16).then((wasm) => {
		wasmCache$f = wasm;
		return wasmCache$f.calculate(data);
	});
	try {
		const hash = wasmCache$f.calculate(data);
		return Promise.resolve(hash);
	} catch (err) {
		return Promise.reject(err);
	}
}
/**
* Creates a new MD4 hash instance
*/
function createMD4() {
	return WASMInterface(wasmJson$e, 16).then((wasm) => {
		wasm.init();
		const obj = {
			init: () => {
				wasm.init();
				return obj;
			},
			update: (data) => {
				wasm.update(data);
				return obj;
			},
			digest: (outputType) => wasm.digest(outputType),
			save: () => wasm.save(),
			load: (data) => {
				wasm.load(data);
				return obj;
			},
			blockSize: 64,
			digestSize: 16
		};
		return obj;
	});
}
/**
* Calculates MD5 hash
* @param data Input data (string, Buffer or TypedArray)
* @returns Computed hash as a hexadecimal string
*/
function md5(data) {
	if (wasmCache$e === null) return lockedCreate(mutex$e, wasmJson$d, 16).then((wasm) => {
		wasmCache$e = wasm;
		return wasmCache$e.calculate(data);
	});
	try {
		const hash = wasmCache$e.calculate(data);
		return Promise.resolve(hash);
	} catch (err) {
		return Promise.reject(err);
	}
}
/**
* Creates a new MD5 hash instance
*/
function createMD5() {
	return WASMInterface(wasmJson$d, 16).then((wasm) => {
		wasm.init();
		const obj = {
			init: () => {
				wasm.init();
				return obj;
			},
			update: (data) => {
				wasm.update(data);
				return obj;
			},
			digest: (outputType) => wasm.digest(outputType),
			save: () => wasm.save(),
			load: (data) => {
				wasm.load(data);
				return obj;
			},
			blockSize: 64,
			digestSize: 16
		};
		return obj;
	});
}
/**
* Calculates SHA-1 hash
* @param data Input data (string, Buffer or TypedArray)
* @returns Computed hash as a hexadecimal string
*/
function sha1(data) {
	if (wasmCache$d === null) return lockedCreate(mutex$d, wasmJson$c, 20).then((wasm) => {
		wasmCache$d = wasm;
		return wasmCache$d.calculate(data);
	});
	try {
		const hash = wasmCache$d.calculate(data);
		return Promise.resolve(hash);
	} catch (err) {
		return Promise.reject(err);
	}
}
/**
* Creates a new SHA-1 hash instance
*/
function createSHA1() {
	return WASMInterface(wasmJson$c, 20).then((wasm) => {
		wasm.init();
		const obj = {
			init: () => {
				wasm.init();
				return obj;
			},
			update: (data) => {
				wasm.update(data);
				return obj;
			},
			digest: (outputType) => wasm.digest(outputType),
			save: () => wasm.save(),
			load: (data) => {
				wasm.load(data);
				return obj;
			},
			blockSize: 64,
			digestSize: 20
		};
		return obj;
	});
}
function validateBits$1(bits) {
	if (![
		224,
		256,
		384,
		512
	].includes(bits)) return /* @__PURE__ */ new Error("Invalid variant! Valid values: 224, 256, 384, 512");
	return null;
}
/**
* Calculates SHA-3 hash
* @param data Input data (string, Buffer or TypedArray)
* @param bits Number of output bits. Valid values: 224, 256, 384, 512
* @returns Computed hash as a hexadecimal string
*/
function sha3(data, bits = 512) {
	if (validateBits$1(bits)) return Promise.reject(validateBits$1(bits));
	const hashLength = bits / 8;
	if (wasmCache$c === null || wasmCache$c.hashLength !== hashLength) return lockedCreate(mutex$c, wasmJson$b, hashLength).then((wasm) => {
		wasmCache$c = wasm;
		return wasmCache$c.calculate(data, bits, 6);
	});
	try {
		const hash = wasmCache$c.calculate(data, bits, 6);
		return Promise.resolve(hash);
	} catch (err) {
		return Promise.reject(err);
	}
}
/**
* Creates a new SHA-3 hash instance
* @param bits Number of output bits. Valid values: 224, 256, 384, 512
*/
function createSHA3(bits = 512) {
	if (validateBits$1(bits)) return Promise.reject(validateBits$1(bits));
	const outputSize = bits / 8;
	return WASMInterface(wasmJson$b, outputSize).then((wasm) => {
		wasm.init(bits);
		const obj = {
			init: () => {
				wasm.init(bits);
				return obj;
			},
			update: (data) => {
				wasm.update(data);
				return obj;
			},
			digest: (outputType) => wasm.digest(outputType, 6),
			save: () => wasm.save(),
			load: (data) => {
				wasm.load(data);
				return obj;
			},
			blockSize: 200 - 2 * outputSize,
			digestSize: outputSize
		};
		return obj;
	});
}
function validateBits(bits) {
	if (![
		224,
		256,
		384,
		512
	].includes(bits)) return /* @__PURE__ */ new Error("Invalid variant! Valid values: 224, 256, 384, 512");
	return null;
}
/**
* Calculates Keccak hash
* @param data Input data (string, Buffer or TypedArray)
* @param bits Number of output bits. Valid values: 224, 256, 384, 512
* @returns Computed hash as a hexadecimal string
*/
function keccak(data, bits = 512) {
	if (validateBits(bits)) return Promise.reject(validateBits(bits));
	const hashLength = bits / 8;
	if (wasmCache$b === null || wasmCache$b.hashLength !== hashLength) return lockedCreate(mutex$b, wasmJson$b, hashLength).then((wasm) => {
		wasmCache$b = wasm;
		return wasmCache$b.calculate(data, bits, 1);
	});
	try {
		const hash = wasmCache$b.calculate(data, bits, 1);
		return Promise.resolve(hash);
	} catch (err) {
		return Promise.reject(err);
	}
}
/**
* Creates a new Keccak hash instance
* @param bits Number of output bits. Valid values: 224, 256, 384, 512
*/
function createKeccak(bits = 512) {
	if (validateBits(bits)) return Promise.reject(validateBits(bits));
	const outputSize = bits / 8;
	return WASMInterface(wasmJson$b, outputSize).then((wasm) => {
		wasm.init(bits);
		const obj = {
			init: () => {
				wasm.init(bits);
				return obj;
			},
			update: (data) => {
				wasm.update(data);
				return obj;
			},
			digest: (outputType) => wasm.digest(outputType, 1),
			save: () => wasm.save(),
			load: (data) => {
				wasm.load(data);
				return obj;
			},
			blockSize: 200 - 2 * outputSize,
			digestSize: outputSize
		};
		return obj;
	});
}
/**
* Calculates SHA-2 (SHA-224) hash
* @param data Input data (string, Buffer or TypedArray)
* @returns Computed hash as a hexadecimal string
*/
function sha224(data) {
	if (wasmCache$a === null) return lockedCreate(mutex$a, wasmJson$a, 28).then((wasm) => {
		wasmCache$a = wasm;
		return wasmCache$a.calculate(data, 224);
	});
	try {
		const hash = wasmCache$a.calculate(data, 224);
		return Promise.resolve(hash);
	} catch (err) {
		return Promise.reject(err);
	}
}
/**
* Creates a new SHA-2 (SHA-224) hash instance
*/
function createSHA224() {
	return WASMInterface(wasmJson$a, 28).then((wasm) => {
		wasm.init(224);
		const obj = {
			init: () => {
				wasm.init(224);
				return obj;
			},
			update: (data) => {
				wasm.update(data);
				return obj;
			},
			digest: (outputType) => wasm.digest(outputType),
			save: () => wasm.save(),
			load: (data) => {
				wasm.load(data);
				return obj;
			},
			blockSize: 64,
			digestSize: 28
		};
		return obj;
	});
}
/**
* Calculates SHA-2 (SHA-256) hash
* @param data Input data (string, Buffer or TypedArray)
* @returns Computed hash as a hexadecimal string
*/
function sha256(data) {
	if (wasmCache$9 === null) return lockedCreate(mutex$9, wasmJson$a, 32).then((wasm) => {
		wasmCache$9 = wasm;
		return wasmCache$9.calculate(data, 256);
	});
	try {
		const hash = wasmCache$9.calculate(data, 256);
		return Promise.resolve(hash);
	} catch (err) {
		return Promise.reject(err);
	}
}
/**
* Creates a new SHA-2 (SHA-256) hash instance
*/
function createSHA256() {
	return WASMInterface(wasmJson$a, 32).then((wasm) => {
		wasm.init(256);
		const obj = {
			init: () => {
				wasm.init(256);
				return obj;
			},
			update: (data) => {
				wasm.update(data);
				return obj;
			},
			digest: (outputType) => wasm.digest(outputType),
			save: () => wasm.save(),
			load: (data) => {
				wasm.load(data);
				return obj;
			},
			blockSize: 64,
			digestSize: 32
		};
		return obj;
	});
}
/**
* Calculates SHA-2 (SHA-384) hash
* @param data Input data (string, Buffer or TypedArray)
* @returns Computed hash as a hexadecimal string
*/
function sha384(data) {
	if (wasmCache$8 === null) return lockedCreate(mutex$8, wasmJson$9, 48).then((wasm) => {
		wasmCache$8 = wasm;
		return wasmCache$8.calculate(data, 384);
	});
	try {
		const hash = wasmCache$8.calculate(data, 384);
		return Promise.resolve(hash);
	} catch (err) {
		return Promise.reject(err);
	}
}
/**
* Creates a new SHA-2 (SHA-384) hash instance
*/
function createSHA384() {
	return WASMInterface(wasmJson$9, 48).then((wasm) => {
		wasm.init(384);
		const obj = {
			init: () => {
				wasm.init(384);
				return obj;
			},
			update: (data) => {
				wasm.update(data);
				return obj;
			},
			digest: (outputType) => wasm.digest(outputType),
			save: () => wasm.save(),
			load: (data) => {
				wasm.load(data);
				return obj;
			},
			blockSize: 128,
			digestSize: 48
		};
		return obj;
	});
}
/**
* Calculates SHA-2 (SHA-512) hash
* @param data Input data (string, Buffer or TypedArray)
* @returns Computed hash as a hexadecimal string
*/
function sha512(data) {
	if (wasmCache$7 === null) return lockedCreate(mutex$7, wasmJson$9, 64).then((wasm) => {
		wasmCache$7 = wasm;
		return wasmCache$7.calculate(data, 512);
	});
	try {
		const hash = wasmCache$7.calculate(data, 512);
		return Promise.resolve(hash);
	} catch (err) {
		return Promise.reject(err);
	}
}
/**
* Creates a new SHA-2 (SHA-512) hash instance
*/
function createSHA512() {
	return WASMInterface(wasmJson$9, 64).then((wasm) => {
		wasm.init(512);
		const obj = {
			init: () => {
				wasm.init(512);
				return obj;
			},
			update: (data) => {
				wasm.update(data);
				return obj;
			},
			digest: (outputType) => wasm.digest(outputType),
			save: () => wasm.save(),
			load: (data) => {
				wasm.load(data);
				return obj;
			},
			blockSize: 128,
			digestSize: 64
		};
		return obj;
	});
}
function validateSeed$3(seed) {
	if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295) return /* @__PURE__ */ new Error("Seed must be a valid 32-bit long unsigned integer.");
	return null;
}
/**
* Calculates xxHash32 hash
* @param data Input data (string, Buffer or TypedArray)
* @param seed Number used to initialize the internal state of the algorithm (defaults to 0)
* @returns Computed hash as a hexadecimal string
*/
function xxhash32(data, seed = 0) {
	if (validateSeed$3(seed)) return Promise.reject(validateSeed$3(seed));
	if (wasmCache$6 === null) return lockedCreate(mutex$6, wasmJson$8, 4).then((wasm) => {
		wasmCache$6 = wasm;
		return wasmCache$6.calculate(data, seed);
	});
	try {
		const hash = wasmCache$6.calculate(data, seed);
		return Promise.resolve(hash);
	} catch (err) {
		return Promise.reject(err);
	}
}
/**
* Creates a new xxHash32 hash instance
* @param data Input data (string, Buffer or TypedArray)
* @param seed Number used to initialize the internal state of the algorithm (defaults to 0)
*/
function createXXHash32(seed = 0) {
	if (validateSeed$3(seed)) return Promise.reject(validateSeed$3(seed));
	return WASMInterface(wasmJson$8, 4).then((wasm) => {
		wasm.init(seed);
		const obj = {
			init: () => {
				wasm.init(seed);
				return obj;
			},
			update: (data) => {
				wasm.update(data);
				return obj;
			},
			digest: (outputType) => wasm.digest(outputType),
			save: () => wasm.save(),
			load: (data) => {
				wasm.load(data);
				return obj;
			},
			blockSize: 16,
			digestSize: 4
		};
		return obj;
	});
}
function validateSeed$2(seed) {
	if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295) return /* @__PURE__ */ new Error("Seed must be given as two valid 32-bit long unsigned integers (lo + high).");
	return null;
}
function writeSeed$2(arr, low, high) {
	const buffer = new DataView(arr);
	buffer.setUint32(0, low, true);
	buffer.setUint32(4, high, true);
}
/**
* Calculates xxHash64 hash
* @param data Input data (string, Buffer or TypedArray)
* @param seedLow Lower 32 bits of the number used to
*  initialize the internal state of the algorithm (defaults to 0)
* @param seedHigh Higher 32 bits of the number used to
*  initialize the internal state of the algorithm (defaults to 0)
* @returns Computed hash as a hexadecimal string
*/
function xxhash64(data, seedLow = 0, seedHigh = 0) {
	if (validateSeed$2(seedLow)) return Promise.reject(validateSeed$2(seedLow));
	if (validateSeed$2(seedHigh)) return Promise.reject(validateSeed$2(seedHigh));
	if (wasmCache$5 === null) return lockedCreate(mutex$5, wasmJson$7, 8).then((wasm) => {
		wasmCache$5 = wasm;
		writeSeed$2(seedBuffer$2.buffer, seedLow, seedHigh);
		wasmCache$5.writeMemory(seedBuffer$2);
		return wasmCache$5.calculate(data);
	});
	try {
		writeSeed$2(seedBuffer$2.buffer, seedLow, seedHigh);
		wasmCache$5.writeMemory(seedBuffer$2);
		const hash = wasmCache$5.calculate(data);
		return Promise.resolve(hash);
	} catch (err) {
		return Promise.reject(err);
	}
}
/**
* Creates a new xxHash64 hash instance
* @param seedLow Lower 32 bits of the number used to
*  initialize the internal state of the algorithm (defaults to 0)
* @param seedHigh Higher 32 bits of the number used to
*  initialize the internal state of the algorithm (defaults to 0)
*/
function createXXHash64(seedLow = 0, seedHigh = 0) {
	if (validateSeed$2(seedLow)) return Promise.reject(validateSeed$2(seedLow));
	if (validateSeed$2(seedHigh)) return Promise.reject(validateSeed$2(seedHigh));
	return WASMInterface(wasmJson$7, 8).then((wasm) => {
		const instanceBuffer = new Uint8Array(8);
		writeSeed$2(instanceBuffer.buffer, seedLow, seedHigh);
		wasm.writeMemory(instanceBuffer);
		wasm.init();
		const obj = {
			init: () => {
				wasm.writeMemory(instanceBuffer);
				wasm.init();
				return obj;
			},
			update: (data) => {
				wasm.update(data);
				return obj;
			},
			digest: (outputType) => wasm.digest(outputType),
			save: () => wasm.save(),
			load: (data) => {
				wasm.load(data);
				return obj;
			},
			blockSize: 32,
			digestSize: 8
		};
		return obj;
	});
}
function validateSeed$1(seed) {
	if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295) return /* @__PURE__ */ new Error("Seed must be given as two valid 32-bit long unsigned integers (lo + high).");
	return null;
}
function writeSeed$1(arr, low, high) {
	const buffer = new DataView(arr);
	buffer.setUint32(0, low, true);
	buffer.setUint32(4, high, true);
}
/**
* Calculates xxHash3 hash
* @param data Input data (string, Buffer or TypedArray)
* @param seedLow Lower 32 bits of the number used to
*  initialize the internal state of the algorithm (defaults to 0)
* @param seedHigh Higher 32 bits of the number used to
*  initialize the internal state of the algorithm (defaults to 0)
* @returns Computed hash as a hexadecimal string
*/
function xxhash3(data, seedLow = 0, seedHigh = 0) {
	if (validateSeed$1(seedLow)) return Promise.reject(validateSeed$1(seedLow));
	if (validateSeed$1(seedHigh)) return Promise.reject(validateSeed$1(seedHigh));
	if (wasmCache$4 === null) return lockedCreate(mutex$4, wasmJson$6, 8).then((wasm) => {
		wasmCache$4 = wasm;
		writeSeed$1(seedBuffer$1.buffer, seedLow, seedHigh);
		wasmCache$4.writeMemory(seedBuffer$1);
		return wasmCache$4.calculate(data);
	});
	try {
		writeSeed$1(seedBuffer$1.buffer, seedLow, seedHigh);
		wasmCache$4.writeMemory(seedBuffer$1);
		const hash = wasmCache$4.calculate(data);
		return Promise.resolve(hash);
	} catch (err) {
		return Promise.reject(err);
	}
}
/**
* Creates a new xxHash3 hash instance
* @param seedLow Lower 32 bits of the number used to
*  initialize the internal state of the algorithm (defaults to 0)
* @param seedHigh Higher 32 bits of the number used to
*  initialize the internal state of the algorithm (defaults to 0)
*/
function createXXHash3(seedLow = 0, seedHigh = 0) {
	if (validateSeed$1(seedLow)) return Promise.reject(validateSeed$1(seedLow));
	if (validateSeed$1(seedHigh)) return Promise.reject(validateSeed$1(seedHigh));
	return WASMInterface(wasmJson$6, 8).then((wasm) => {
		const instanceBuffer = new Uint8Array(8);
		writeSeed$1(instanceBuffer.buffer, seedLow, seedHigh);
		wasm.writeMemory(instanceBuffer);
		wasm.init();
		const obj = {
			init: () => {
				wasm.writeMemory(instanceBuffer);
				wasm.init();
				return obj;
			},
			update: (data) => {
				wasm.update(data);
				return obj;
			},
			digest: (outputType) => wasm.digest(outputType),
			save: () => wasm.save(),
			load: (data) => {
				wasm.load(data);
				return obj;
			},
			blockSize: 512,
			digestSize: 8
		};
		return obj;
	});
}
function validateSeed(seed) {
	if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295) return /* @__PURE__ */ new Error("Seed must be given as two valid 32-bit long unsigned integers (lo + high).");
	return null;
}
function writeSeed(arr, low, high) {
	const buffer = new DataView(arr);
	buffer.setUint32(0, low, true);
	buffer.setUint32(4, high, true);
}
/**
* Calculates xxHash128 hash
* @param data Input data (string, Buffer or TypedArray)
* @param seedLow Lower 32 bits of the number used to
*  initialize the internal state of the algorithm (defaults to 0)
* @param seedHigh Higher 32 bits of the number used to
*  initialize the internal state of the algorithm (defaults to 0)
* @returns Computed hash as a hexadecimal string
*/
function xxhash128(data, seedLow = 0, seedHigh = 0) {
	if (validateSeed(seedLow)) return Promise.reject(validateSeed(seedLow));
	if (validateSeed(seedHigh)) return Promise.reject(validateSeed(seedHigh));
	if (wasmCache$3 === null) return lockedCreate(mutex$3, wasmJson$5, 16).then((wasm) => {
		wasmCache$3 = wasm;
		writeSeed(seedBuffer.buffer, seedLow, seedHigh);
		wasmCache$3.writeMemory(seedBuffer);
		return wasmCache$3.calculate(data);
	});
	try {
		writeSeed(seedBuffer.buffer, seedLow, seedHigh);
		wasmCache$3.writeMemory(seedBuffer);
		const hash = wasmCache$3.calculate(data);
		return Promise.resolve(hash);
	} catch (err) {
		return Promise.reject(err);
	}
}
/**
* Creates a new xxHash128 hash instance
* @param seedLow Lower 32 bits of the number used to
*  initialize the internal state of the algorithm (defaults to 0)
* @param seedHigh Higher 32 bits of the number used to
*  initialize the internal state of the algorithm (defaults to 0)
*/
function createXXHash128(seedLow = 0, seedHigh = 0) {
	if (validateSeed(seedLow)) return Promise.reject(validateSeed(seedLow));
	if (validateSeed(seedHigh)) return Promise.reject(validateSeed(seedHigh));
	return WASMInterface(wasmJson$5, 16).then((wasm) => {
		const instanceBuffer = new Uint8Array(8);
		writeSeed(instanceBuffer.buffer, seedLow, seedHigh);
		wasm.writeMemory(instanceBuffer);
		wasm.init();
		const obj = {
			init: () => {
				wasm.writeMemory(instanceBuffer);
				wasm.init();
				return obj;
			},
			update: (data) => {
				wasm.update(data);
				return obj;
			},
			digest: (outputType) => wasm.digest(outputType),
			save: () => wasm.save(),
			load: (data) => {
				wasm.load(data);
				return obj;
			},
			blockSize: 512,
			digestSize: 16
		};
		return obj;
	});
}
/**
* Calculates RIPEMD-160 hash
* @param data Input data (string, Buffer or TypedArray)
* @returns Computed hash as a hexadecimal string
*/
function ripemd160(data) {
	if (wasmCache$2 === null) return lockedCreate(mutex$2, wasmJson$4, 20).then((wasm) => {
		wasmCache$2 = wasm;
		return wasmCache$2.calculate(data);
	});
	try {
		const hash = wasmCache$2.calculate(data);
		return Promise.resolve(hash);
	} catch (err) {
		return Promise.reject(err);
	}
}
/**
* Creates a new RIPEMD-160 hash instance
*/
function createRIPEMD160() {
	return WASMInterface(wasmJson$4, 20).then((wasm) => {
		wasm.init();
		const obj = {
			init: () => {
				wasm.init();
				return obj;
			},
			update: (data) => {
				wasm.update(data);
				return obj;
			},
			digest: (outputType) => wasm.digest(outputType),
			save: () => wasm.save(),
			load: (data) => {
				wasm.load(data);
				return obj;
			},
			blockSize: 64,
			digestSize: 20
		};
		return obj;
	});
}
function calculateKeyBuffer(hasher, key) {
	const { blockSize } = hasher;
	const buf = getUInt8Buffer(key);
	if (buf.length > blockSize) {
		hasher.update(buf);
		const uintArr = hasher.digest("binary");
		hasher.init();
		return uintArr;
	}
	return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
}
function calculateHmac(hasher, key) {
	hasher.init();
	const { blockSize } = hasher;
	const keyBuf = calculateKeyBuffer(hasher, key);
	const keyBuffer = new Uint8Array(blockSize);
	keyBuffer.set(keyBuf);
	const opad = new Uint8Array(blockSize);
	for (let i = 0; i < blockSize; i++) {
		const v = keyBuffer[i];
		opad[i] = v ^ 92;
		keyBuffer[i] = v ^ 54;
	}
	hasher.update(keyBuffer);
	const obj = {
		init: () => {
			hasher.init();
			hasher.update(keyBuffer);
			return obj;
		},
		update: (data) => {
			hasher.update(data);
			return obj;
		},
		digest: ((outputType) => {
			const uintArr = hasher.digest("binary");
			hasher.init();
			hasher.update(opad);
			hasher.update(uintArr);
			return hasher.digest(outputType);
		}),
		save: () => {
			throw new Error("save() not supported");
		},
		load: () => {
			throw new Error("load() not supported");
		},
		blockSize: hasher.blockSize,
		digestSize: hasher.digestSize
	};
	return obj;
}
/**
* Calculates HMAC hash
* @param hash Hash algorithm to use. It has to be the return value of a function like createSHA1()
* @param key Key (string, Buffer or TypedArray)
*/
function createHMAC(hash, key) {
	if (!hash || !hash.then) throw new Error("Invalid hash function is provided! Usage: createHMAC(createMD5(), \"key\").");
	return hash.then((hasher) => calculateHmac(hasher, key));
}
function calculatePBKDF2(digest, salt, iterations, hashLength, outputType) {
	return __awaiter(this, void 0, void 0, function* () {
		const DK = new Uint8Array(hashLength);
		const block1 = new Uint8Array(salt.length + 4);
		const block1View = new DataView(block1.buffer);
		const saltBuffer = getUInt8Buffer(salt);
		const saltUIntBuffer = new Uint8Array(saltBuffer.buffer, saltBuffer.byteOffset, saltBuffer.length);
		block1.set(saltUIntBuffer);
		let destPos = 0;
		const hLen = digest.digestSize;
		const l = Math.ceil(hashLength / hLen);
		let T = null;
		let U = null;
		for (let i = 1; i <= l; i++) {
			block1View.setUint32(salt.length, i);
			digest.init();
			digest.update(block1);
			T = digest.digest("binary");
			U = T.slice();
			for (let j = 1; j < iterations; j++) {
				digest.init();
				digest.update(U);
				U = digest.digest("binary");
				for (let k = 0; k < hLen; k++) T[k] ^= U[k];
			}
			DK.set(T.subarray(0, hashLength - destPos), destPos);
			destPos += hLen;
		}
		if (outputType === "binary") return DK;
		return getDigestHex(new Uint8Array(hashLength * 2), DK, hashLength);
	});
}
/**
* Generates a new PBKDF2 hash for the supplied password
*/
function pbkdf2(options) {
	return __awaiter(this, void 0, void 0, function* () {
		validateOptions$2(options);
		return calculatePBKDF2(yield createHMAC(options.hashFunction, options.password), options.salt, options.iterations, options.hashLength, options.outputType);
	});
}
function scryptInternal(options) {
	return __awaiter(this, void 0, void 0, function* () {
		const { costFactor, blockSize, parallelism, hashLength } = options;
		const SHA256Hasher = createSHA256();
		const blockData = yield pbkdf2({
			password: options.password,
			salt: options.salt,
			iterations: 1,
			hashLength: 128 * blockSize * parallelism,
			hashFunction: SHA256Hasher,
			outputType: "binary"
		});
		const scryptInterface = yield WASMInterface(wasmJson$3, 0);
		const VSize = 128 * blockSize * costFactor;
		const XYSize = 256 * blockSize;
		scryptInterface.setMemorySize(blockData.length + VSize + XYSize);
		scryptInterface.writeMemory(blockData, 0);
		scryptInterface.getExports().scrypt(blockSize, costFactor, parallelism);
		const expensiveSalt = scryptInterface.getMemory().subarray(0, 128 * blockSize * parallelism);
		const outputData = yield pbkdf2({
			password: options.password,
			salt: expensiveSalt,
			iterations: 1,
			hashLength,
			hashFunction: SHA256Hasher,
			outputType: "binary"
		});
		if (options.outputType === "hex") return getDigestHex(new Uint8Array(hashLength * 2), outputData, hashLength);
		return outputData;
	});
}
/**
* Calculates hash using the scrypt password-based key derivation function
* @returns Computed hash as a hexadecimal string or as
*          Uint8Array depending on the outputType option
*/
function scrypt(options) {
	return __awaiter(this, void 0, void 0, function* () {
		validateOptions$1(options);
		return scryptInternal(options);
	});
}
function bcryptInternal(options) {
	return __awaiter(this, void 0, void 0, function* () {
		const { costFactor, password, salt } = options;
		const bcryptInterface = yield WASMInterface(wasmJson$2, 0);
		bcryptInterface.writeMemory(getUInt8Buffer(salt), 0);
		const passwordBuffer = getUInt8Buffer(password);
		bcryptInterface.writeMemory(passwordBuffer, 16);
		const shouldEncode = options.outputType === "encoded" ? 1 : 0;
		bcryptInterface.getExports().bcrypt(passwordBuffer.length, costFactor, shouldEncode);
		const memory = bcryptInterface.getMemory();
		if (options.outputType === "encoded") return intArrayToString(memory, 60);
		if (options.outputType === "hex") return getDigestHex(new Uint8Array(48), memory, 24);
		return memory.slice(0, 24);
	});
}
/**
* Calculates hash using the bcrypt password-hashing function
* @returns Computed hash
*/
function bcrypt(options) {
	return __awaiter(this, void 0, void 0, function* () {
		validateOptions(options);
		return bcryptInternal(options);
	});
}
/**
* Verifies password using bcrypt password-hashing function
* @returns True if the encoded hash matches the password
*/
function bcryptVerify(options) {
	return __awaiter(this, void 0, void 0, function* () {
		validateVerifyOptions(options);
		const { hash, password } = options;
		const bcryptInterface = yield WASMInterface(wasmJson$2, 0);
		bcryptInterface.writeMemory(getUInt8Buffer(hash), 0);
		const passwordBuffer = getUInt8Buffer(password);
		bcryptInterface.writeMemory(passwordBuffer, 60);
		return !!bcryptInterface.getExports().bcrypt_verify(passwordBuffer.length);
	});
}
/**
* Calculates Whirlpool hash
* @param data Input data (string, Buffer or TypedArray)
* @returns Computed hash as a hexadecimal string
*/
function whirlpool(data) {
	if (wasmCache$1 === null) return lockedCreate(mutex$1, wasmJson$1, 64).then((wasm) => {
		wasmCache$1 = wasm;
		return wasmCache$1.calculate(data);
	});
	try {
		const hash = wasmCache$1.calculate(data);
		return Promise.resolve(hash);
	} catch (err) {
		return Promise.reject(err);
	}
}
/**
* Creates a new Whirlpool hash instance
*/
function createWhirlpool() {
	return WASMInterface(wasmJson$1, 64).then((wasm) => {
		wasm.init();
		const obj = {
			init: () => {
				wasm.init();
				return obj;
			},
			update: (data) => {
				wasm.update(data);
				return obj;
			},
			digest: (outputType) => wasm.digest(outputType),
			save: () => wasm.save(),
			load: (data) => {
				wasm.load(data);
				return obj;
			},
			blockSize: 64,
			digestSize: 64
		};
		return obj;
	});
}
/**
* Calculates SM3 hash
* @param data Input data (string, Buffer or TypedArray)
* @returns Computed hash as a hexadecimal string
*/
function sm3(data) {
	if (wasmCache === null) return lockedCreate(mutex, wasmJson, 32).then((wasm) => {
		wasmCache = wasm;
		return wasmCache.calculate(data);
	});
	try {
		const hash = wasmCache.calculate(data);
		return Promise.resolve(hash);
	} catch (err) {
		return Promise.reject(err);
	}
}
/**
* Creates a new SM3 hash instance
*/
function createSM3() {
	return WASMInterface(wasmJson, 32).then((wasm) => {
		wasm.init();
		const obj = {
			init: () => {
				wasm.init();
				return obj;
			},
			update: (data) => {
				wasm.update(data);
				return obj;
			},
			digest: (outputType) => wasm.digest(outputType),
			save: () => wasm.save(),
			load: (data) => {
				wasm.load(data);
				return obj;
			},
			blockSize: 64,
			digestSize: 32
		};
		return obj;
	});
}
var wasmJson$l, Mutex, _a, globalObject, nodeBuffer, textEncoder, alpha, digit, getUInt8Buffer, base64Chars, base64Lookup, MAX_HEAP, WASM_FUNC_HASH_LENGTH, wasmMutex, wasmModuleCache, mutex$l, wasmCache$l, wasmJson$k, wasmJson$j, mutex$k, wasmCache$k, uint32View, validateOptions$3, getHashParameters, validateVerifyOptions$1, wasmJson$i, mutex$j, wasmCache$j, wasmJson$h, mutex$i, wasmCache$i, wasmJson$g, mutex$h, wasmCache$h, wasmJson$f, mutex$g, wasmCache$g, polyBuffer, wasmJson$e, mutex$f, wasmCache$f, wasmJson$d, mutex$e, wasmCache$e, wasmJson$c, mutex$d, wasmCache$d, wasmJson$b, mutex$c, wasmCache$c, mutex$b, wasmCache$b, wasmJson$a, mutex$a, wasmCache$a, mutex$9, wasmCache$9, wasmJson$9, mutex$8, wasmCache$8, mutex$7, wasmCache$7, wasmJson$8, mutex$6, wasmCache$6, wasmJson$7, mutex$5, wasmCache$5, seedBuffer$2, wasmJson$6, mutex$4, wasmCache$4, seedBuffer$1, wasmJson$5, mutex$3, wasmCache$3, seedBuffer, wasmJson$4, mutex$2, wasmCache$2, validateOptions$2, wasmJson$3, isPowerOfTwo, validateOptions$1, wasmJson$2, validateOptions, validateHashCharacters, validateVerifyOptions, wasmJson$1, mutex$1, wasmCache$1, wasmJson, mutex, wasmCache;
var init_index_esm = __esmMin(() => {
	wasmJson$l = {
		name: "adler32",
		data: "AGFzbQEAAAABDANgAAF/YAAAYAF/AAMHBgABAgEAAgUEAQECAgYOAn8BQYCJBQt/AEGACAsHcAgGbWVtb3J5AgAOSGFzaF9HZXRCdWZmZXIAAAlIYXNoX0luaXQAAQtIYXNoX1VwZGF0ZQACCkhhc2hfRmluYWwAAw1IYXNoX0dldFN0YXRlAAQOSGFzaF9DYWxjdWxhdGUABQpTVEFURV9TSVpFAwEK6wkGBQBBgAkLCgBBAEEBNgKECAvjCAEHf0EAKAKECCIBQf//A3EhAiABQRB2IQMCQAJAIABBAUcNACACQQAtAIAJaiIBQY+AfGogASABQfD/A0sbIgEgA2oiBEEQdCIFQYCAPGogBSAEQfD/A0sbIAFyIQEMAQsCQAJAAkACQAJAIABBEEkNAEGACSEGIABBsCtJDQFBgAkhBgNAQQAhBQNAIAYgBWoiASgCACIEQf8BcSACaiICIANqIAIgBEEIdkH/AXFqIgJqIAIgBEEQdkH/AXFqIgJqIAIgBEEYdmoiAmogAiABQQRqKAIAIgRB/wFxaiICaiACIARBCHZB/wFxaiICaiACIARBEHZB/wFxaiICaiACIARBGHZqIgJqIAIgAUEIaigCACIEQf8BcWoiAmogAiAEQQh2Qf8BcWoiAmogAiAEQRB2Qf8BcWoiAmogAiAEQRh2aiIEaiAEIAFBDGooAgAiAUH/AXFqIgRqIAQgAUEIdkH/AXFqIgRqIAQgAUEQdkH/AXFqIgRqIAQgAUEYdmoiAmohAyAFQRBqIgVBsCtHDQALIANB8f8DcCEDIAJB8f8DcCECIAZBsCtqIQYgAEHQVGoiAEGvK0sNAAsgAEUNBCAAQQ9LDQEMAgsCQCAARQ0AAkACQCAAQQNxIgUNAEGACSEBIAAhBAwBCyAAQXxxIQRBACEBA0AgAiABQYAJai0AAGoiAiADaiEDIAUgAUEBaiIBRw0ACyAFQYAJaiEBCyAAQQRJDQADQCACIAEtAABqIgUgAS0AAWoiBiABLQACaiIAIAFBA2otAABqIgIgACAGIAUgA2pqamohAyABQQRqIQEgBEF8aiIEDQALCyACQY+AfGogAiACQfD/A0sbIANB8f8DcEEQdHIhAQwECwNAIAYoAgAiAUH/AXEgAmoiBCADaiAEIAFBCHZB/wFxaiIEaiAEIAFBEHZB/wFxaiIEaiAEIAFBGHZqIgRqIAQgBkEEaigCACIBQf8BcWoiBGogBCABQQh2Qf8BcWoiBGogBCABQRB2Qf8BcWoiBGogBCABQRh2aiIEaiAEIAZBCGooAgAiAUH/AXFqIgRqIAQgAUEIdkH/AXFqIgRqIAQgAUEQdkH/AXFqIgRqIAQgAUEYdmoiBGogBCAGQQxqKAIAIgFB/wFxaiIEaiAEIAFBCHZB/wFxaiIEaiAEIAFBEHZB/wFxaiIEaiAEIAFBGHZqIgJqIQMgBkEQaiEGIABBcGoiAEEPSw0ACyAARQ0BCyAAQX9qIQcCQCAAQQNxIgVFDQAgAEF8cSEAIAUhBCAGIQEDQCACIAEtAABqIgIgA2ohAyABQQFqIQEgBEF/aiIEDQALIAYgBWohBgsgB0EDSQ0AA0AgAiAGLQAAaiIBIAYtAAFqIgQgBi0AAmoiBSAGQQNqLQAAaiICIAUgBCABIANqampqIQMgBkEEaiEGIABBfGoiAA0ACwsgA0Hx/wNwIQMgAkHx/wNwIQILIAIgA0EQdHIhAQtBACABNgKECAsxAQF/QQBBACgChAgiAEEYdCAAQYD+A3FBCHRyIABBCHZBgP4DcSAAQRh2cnI2AoAJCwUAQYQICzsAQQBBATYChAggABACQQBBACgChAgiAEEYdCAAQYD+A3FBCHRyIABBCHZBgP4DcSAAQRh2cnI2AoAJCwsVAgBBgAgLBAQAAAAAQYQICwQBAAAA",
		hash: "02ddbd17"
	};
	Mutex = class {
		constructor() {
			this.mutex = Promise.resolve();
		}
		lock() {
			let begin = () => {};
			this.mutex = this.mutex.then(() => new Promise(begin));
			return new Promise((res) => {
				begin = res;
			});
		}
		dispatch(fn) {
			return __awaiter(this, void 0, void 0, function* () {
				const unlock = yield this.lock();
				try {
					return yield Promise.resolve(fn());
				} finally {
					unlock();
				}
			});
		}
	};
	globalObject = getGlobal();
	nodeBuffer = (_a = globalObject.Buffer) !== null && _a !== void 0 ? _a : null;
	textEncoder = globalObject.TextEncoder ? new globalObject.TextEncoder() : null;
	alpha = "a".charCodeAt(0) - 10;
	digit = "0".charCodeAt(0);
	getUInt8Buffer = nodeBuffer !== null ? (data) => {
		if (typeof data === "string") {
			const buf = nodeBuffer.from(data, "utf8");
			return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
		}
		if (nodeBuffer.isBuffer(data)) return new Uint8Array(data.buffer, data.byteOffset, data.length);
		if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
		throw new Error("Invalid data type!");
	} : (data) => {
		if (typeof data === "string") return textEncoder.encode(data);
		if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
		throw new Error("Invalid data type!");
	};
	base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	base64Lookup = new Uint8Array(256);
	for (let i = 0; i < 64; i++) base64Lookup[base64Chars.charCodeAt(i)] = i;
	MAX_HEAP = 16 * 1024;
	WASM_FUNC_HASH_LENGTH = 4;
	wasmMutex = new Mutex();
	wasmModuleCache = /* @__PURE__ */ new Map();
	mutex$l = new Mutex();
	wasmCache$l = null;
	wasmJson$k = {
		name: "argon2",
		data: "AGFzbQEAAAABKQVgAX8Bf2AAAX9gEH9/f39/f39/f39/f39/f38AYAR/f39/AGACf38AAwYFAAECAwQFBgEBAoCAAgYIAX8BQZCoBAsHQQQGbWVtb3J5AgASSGFzaF9TZXRNZW1vcnlTaXplAAAOSGFzaF9HZXRCdWZmZXIAAQ5IYXNoX0NhbGN1bGF0ZQAECvEyBVgBAn9BACEBAkAgAEEAKAKICCICRg0AAkAgACACayIAQRB2IABBgIB8cSAASWoiAEAAQX9HDQBB/wHADwtBACEBQQBBACkDiAggAEEQdK18NwOICAsgAcALcAECfwJAQQAoAoAIIgANAEEAPwBBEHQiADYCgAhBACgCiAgiAUGAgCBGDQACQEGAgCAgAWsiAEEQdiAAQYCAfHEgAElqIgBAAEF/Rw0AQQAPC0EAQQApA4gIIABBEHStfDcDiAhBACgCgAghAAsgAAvcDgECfiAAIAQpAwAiECAAKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAMIBAgDCkDAIVCIIkiEDcDACAIIBAgCCkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgBCAQIAQpAwCFQiiJIhA3AwAgACAQIAApAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAwgECAMKQMAhUIwiSIQNwMAIAggECAIKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAEIBAgBCkDAIVCAYk3AwAgASAFKQMAIhAgASkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDSAQIA0pAwCFQiCJIhA3AwAgCSAQIAkpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAUgECAFKQMAhUIoiSIQNwMAIAEgECABKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACANIBAgDSkDAIVCMIkiEDcDACAJIBAgCSkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBSAQIAUpAwCFQgGJNwMAIAIgBikDACIQIAIpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIA4gECAOKQMAhUIgiSIQNwMAIAogECAKKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAGIBAgBikDAIVCKIkiEDcDACACIBAgAikDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgDiAQIA4pAwCFQjCJIhA3AwAgCiAQIAopAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAYgECAGKQMAhUIBiTcDACADIAcpAwAiECADKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAPIBAgDykDAIVCIIkiEDcDACALIBAgCykDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgByAQIAcpAwCFQiiJIhA3AwAgAyAQIAMpAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIA8gECAPKQMAhUIwiSIQNwMAIAsgECALKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAHIBAgBykDAIVCAYk3AwAgACAFKQMAIhAgACkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDyAQIA8pAwCFQiCJIhA3AwAgCiAQIAopAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAUgECAFKQMAhUIoiSIQNwMAIAAgECAAKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAPIBAgDykDAIVCMIkiEDcDACAKIBAgCikDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBSAQIAUpAwCFQgGJNwMAIAEgBikDACIQIAEpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAwgECAMKQMAhUIgiSIQNwMAIAsgECALKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACAGIBAgBikDAIVCKIkiEDcDACABIBAgASkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgDCAQIAwpAwCFQjCJIhA3AwAgCyAQIAspAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIAYgECAGKQMAhUIBiTcDACACIAcpAwAiECACKQMAIhF8IBFCAYZC/v///x+DIBBC/////w+DfnwiEDcDACANIBAgDSkDAIVCIIkiEDcDACAIIBAgCCkDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgByAQIAcpAwCFQiiJIhA3AwAgAiAQIAIpAwAiEXwgEEL/////D4MgEUIBhkL+////H4N+fCIQNwMAIA0gECANKQMAhUIwiSIQNwMAIAggECAIKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAHIBAgBykDAIVCAYk3AwAgAyAEKQMAIhAgAykDACIRfCARQgGGQv7///8fgyAQQv////8Pg358IhA3AwAgDiAQIA4pAwCFQiCJIhA3AwAgCSAQIAkpAwAiEXwgEUIBhkL+////H4MgEEL/////D4N+fCIQNwMAIAQgECAEKQMAhUIoiSIQNwMAIAMgECADKQMAIhF8IBBC/////w+DIBFCAYZC/v///x+DfnwiEDcDACAOIBAgDikDAIVCMIkiEDcDACAJIBAgCSkDACIRfCAQQv////8PgyARQgGGQv7///8fg358IhA3AwAgBCAQIAQpAwCFQgGJNwMAC98aAQN/QQAhBEEAIAIpAwAgASkDAIU3A5AIQQAgAikDCCABKQMIhTcDmAhBACACKQMQIAEpAxCFNwOgCEEAIAIpAxggASkDGIU3A6gIQQAgAikDICABKQMghTcDsAhBACACKQMoIAEpAyiFNwO4CEEAIAIpAzAgASkDMIU3A8AIQQAgAikDOCABKQM4hTcDyAhBACACKQNAIAEpA0CFNwPQCEEAIAIpA0ggASkDSIU3A9gIQQAgAikDUCABKQNQhTcD4AhBACACKQNYIAEpA1iFNwPoCEEAIAIpA2AgASkDYIU3A/AIQQAgAikDaCABKQNohTcD+AhBACACKQNwIAEpA3CFNwOACUEAIAIpA3ggASkDeIU3A4gJQQAgAikDgAEgASkDgAGFNwOQCUEAIAIpA4gBIAEpA4gBhTcDmAlBACACKQOQASABKQOQAYU3A6AJQQAgAikDmAEgASkDmAGFNwOoCUEAIAIpA6ABIAEpA6ABhTcDsAlBACACKQOoASABKQOoAYU3A7gJQQAgAikDsAEgASkDsAGFNwPACUEAIAIpA7gBIAEpA7gBhTcDyAlBACACKQPAASABKQPAAYU3A9AJQQAgAikDyAEgASkD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",
		hash: "e4cdc523"
	};
	wasmJson$j = {
		name: "blake2b",
		data: "AGFzbQEAAAABEQRgAAF/YAJ/fwBgAX8AYAAAAwoJAAECAwECAgABBQQBAQICBg4CfwFBsIsFC38AQYAICwdwCAZtZW1vcnkCAA5IYXNoX0dldEJ1ZmZlcgAACkhhc2hfRmluYWwAAwlIYXNoX0luaXQABQtIYXNoX1VwZGF0ZQAGDUhhc2hfR2V0U3RhdGUABw5IYXNoX0NhbGN1bGF0ZQAIClNUQVRFX1NJWkUDAQrTOAkFAEGACQvrAgIFfwF+AkAgAUEBSA0AAkACQAJAIAFBgAFBACgC4IoBIgJrIgNKDQAgASEEDAELQQBBADYC4IoBAkAgAkH/AEoNACACQeCJAWohBSAAIQRBACEGA0AgBSAELQAAOgAAIARBAWohBCAFQQFqIQUgAyAGQQFqIgZB/wFxSg0ACwtBAEEAKQPAiQEiB0KAAXw3A8CJAUEAQQApA8iJASAHQv9+Vq18NwPIiQFB4IkBEAIgACADaiEAAkAgASADayIEQYEBSA0AIAIgAWohBQNAQQBBACkDwIkBIgdCgAF8NwPAiQFBAEEAKQPIiQEgB0L/flatfDcDyIkBIAAQAiAAQYABaiEAIAVBgH9qIgVBgAJLDQALIAVBgH9qIQQMAQsgBEEATA0BC0EAIQUDQCAFQQAoAuCKAWpB4IkBaiAAIAVqLQAAOgAAIAQgBUEBaiIFQf8BcUoNAAsLQQBBACgC4IoBIARqNgLgigELC78uASR+QQBBACkD0IkBQQApA7CJASIBQQApA5CJAXwgACkDICICfCIDhULr+obav7X2wR+FQiCJIgRCq/DT9K/uvLc8fCIFIAGFQiiJIgYgA3wgACkDKCIBfCIHIASFQjCJIgggBXwiCSAGhUIBiSIKQQApA8iJAUEAKQOoiQEiBEEAKQOIiQF8IAApAxAiA3wiBYVCn9j52cKR2oKbf4VCIIkiC0K7zqqm2NDrs7t/fCIMIASFQiiJIg0gBXwgACkDGCIEfCIOfCAAKQNQIgV8Ig9BACkDwIkBQQApA6CJASIQQQApA4CJASIRfCAAKQMAIgZ8IhKFQtGFmu/6z5SH0QCFQiCJIhNCiJLznf/M+YTqAHwiFCAQhUIoiSIVIBJ8IAApAwgiEHwiFiAThUIwiSIXhUIgiSIYQQApA9iJAUEAKQO4iQEiE0EAKQOYiQF8IAApAzAiEnwiGYVC+cL4m5Gjs/DbAIVCIIkiGkLx7fT4paf9p6V/fCIbIBOFQiiJIhwgGXwgACkDOCITfCIZIBqFQjCJIhogG3wiG3wiHSAKhUIoiSIeIA98IAApA1giCnwiDyAYhUIwiSIYIB18Ih0gDiALhUIwiSIOIAx8Ih8gDYVCAYkiDCAWfCAAKQNAIgt8Ig0gGoVCIIkiFiAJfCIaIAyFQiiJIiAgDXwgACkDSCIJfCIhIBaFQjCJIhYgGyAchUIBiSIMIAd8IAApA2AiB3wiDSAOhUIgiSIOIBcgFHwiFHwiFyAMhUIoiSIbIA18IAApA2giDHwiHCAOhUIwiSIOIBd8IhcgG4VCAYkiGyAZIBQgFYVCAYkiFHwgACkDcCINfCIVIAiFQiCJIhkgH3wiHyAUhUIoiSIUIBV8IAApA3giCHwiFXwgDHwiIoVCIIkiI3wiJCAbhUIoiSIbICJ8IBJ8IiIgFyAYIBUgGYVCMIkiFSAffCIZIBSFQgGJIhQgIXwgDXwiH4VCIIkiGHwiFyAUhUIoiSIUIB98IAV8Ih8gGIVCMIkiGCAXfCIXIBSFQgGJIhR8IAF8IiEgFiAafCIWIBUgHSAehUIBiSIaIBx8IAl8IhyFQiCJIhV8Ih0gGoVCKIkiGiAcfCAIfCIcIBWFQjCJIhWFQiCJIh4gGSAOIBYgIIVCAYkiFiAPfCACfCIPhUIgiSIOfCIZIBaFQiiJIhYgD3wgC3wiDyAOhUIwiSIOIBl8Ihl8IiAgFIVCKIkiFCAhfCAEfCIhIB6FQjCJIh4gIHwiICAiICOFQjCJIiIgJHwiIyAbhUIBiSIbIBx8IAp8IhwgDoVCIIkiDiAXfCIXIBuFQiiJIhsgHHwgE3wiHCAOhUIwiSIOIBkgFoVCAYkiFiAffCAQfCIZICKFQiCJIh8gFSAdfCIVfCIdIBaFQiiJIhYgGXwgB3wiGSAfhUIwiSIfIB18Ih0gFoVCAYkiFiAVIBqFQgGJIhUgD3wgBnwiDyAYhUIgiSIYICN8IhogFYVCKIkiFSAPfCADfCIPfCAHfCIihUIgiSIjfCIkIBaFQiiJIhYgInwgBnwiIiAjhUIwiSIjICR8IiQgFoVCAYkiFiAOIBd8Ig4gDyAYhUIwiSIPICAgFIVCAYkiFCAZfCAKfCIXhUIgiSIYfCIZIBSFQiiJIhQgF3wgC3wiF3wgBXwiICAPIBp8Ig8gHyAOIBuFQgGJIg4gIXwgCHwiGoVCIIkiG3wiHyAOhUIoiSIOIBp8IAx8IhogG4VCMIkiG4VCIIkiISAdIB4gDyAVhUIBiSIPIBx8IAF8IhWFQiCJIhx8Ih0gD4VCKIkiDyAVfCADfCIVIByFQjCJIhwgHXwiHXwiHiAWhUIoiSIWICB8IA18IiAgIYVCMIkiISAefCIeIBogFyAYhUIwiSIXIBl8IhggFIVCAYkiFHwgCXwiGSAchUIgiSIaICR8IhwgFIVCKIkiFCAZfCACfCIZIBqFQjCJIhogHSAPhUIBiSIPICJ8IAR8Ih0gF4VCIIkiFyAbIB98Iht8Ih8gD4VCKIkiDyAdfCASfCIdIBeFQjCJIhcgH3wiHyAPhUIBiSIPIBsgDoVCAYkiDiAVfCATfCIVICOFQiCJIhsgGHwiGCAOhUIoiSIOIBV8IBB8IhV8IAx8IiKFQiCJIiN8IiQgD4VCKIkiDyAifCAHfCIiICOFQjCJIiMgJHwiJCAPhUIBiSIPIBogHHwiGiAVIBuFQjCJIhUgHiAWhUIBiSIWIB18IAR8IhuFQiCJIhx8Ih0gFoVCKIkiFiAbfCAQfCIbfCABfCIeIBUgGHwiFSAXIBogFIVCAYkiFCAgfCATfCIYhUIgiSIXfCIaIBSFQiiJIhQgGHwgCXwiGCAXhUIwiSIXhUIgiSIgIB8gISAVIA6FQgGJIg4gGXwgCnwiFYVCIIkiGXwiHyAOhUIoiSIOIBV8IA18IhUgGYVCMIkiGSAffCIffCIhIA+FQiiJIg8gHnwgBXwiHiAghUIwiSIgICF8IiEgGyAchUIwiSIbIB18IhwgFoVCAYkiFiAYfCADfCIYIBmFQiCJIhkgJHwiHSAWhUIoiSIWIBh8IBJ8IhggGYVCMIkiGSAfIA6FQgGJIg4gInwgAnwiHyAbhUIgiSIbIBcgGnwiF3wiGiAOhUIoiSIOIB98IAZ8Ih8gG4VCMIkiGyAafCIaIA6FQgGJIg4gFSAXIBSFQgGJIhR8IAh8IhUgI4VCIIkiFyAcfCIcIBSFQiiJIhQgFXwgC3wiFXwgBXwiIoVCIIkiI3wiJCAOhUIoiSIOICJ8IAh8IiIgGiAgIBUgF4VCMIkiFSAcfCIXIBSFQgGJIhQgGHwgCXwiGIVCIIkiHHwiGiAUhUIoiSIUIBh8IAZ8IhggHIVCMIkiHCAafCIaIBSFQgGJIhR8IAR8IiAgGSAdfCIZIBUgISAPhUIBiSIPIB98IAN8Ih2FQiCJIhV8Ih8gD4VCKIkiDyAdfCACfCIdIBWFQjCJIhWFQiCJIiEgFyAbIBkgFoVCAYkiFiAefCABfCIZhUIgiSIbfCIXIBaFQiiJIhYgGXwgE3wiGSAbhUIwiSIbIBd8Ihd8Ih4gFIVCKIkiFCAgfCAMfCIgICGFQjCJIiEgHnwiHiAiICOFQjCJIiIgJHwiIyAOhUIBiSIOIB18IBJ8Ih0gG4VCIIkiGyAafCIaIA6FQiiJIg4gHXwgC3wiHSAbhUIwiSIbIBcgFoVCAYkiFiAYfCANfCIXICKFQiCJIhggFSAffCIVfCIfIBaFQiiJIhYgF3wgEHwiFyAYhUIwiSIYIB98Ih8gFoVCAYkiFiAVIA+FQgGJIg8gGXwgCnwiFSAchUIgiSIZICN8IhwgD4VCKIkiDyAVfCAHfCIVfCASfCIihUIgiSIjfCIkIBaFQiiJIhYgInwgBXwiIiAjhUIwiSIjICR8IiQgFoVCAYkiFiAbIBp8IhogFSAZhUIwiSIVIB4gFIVCAYkiFCAXfCADfCIXhUIgiSIZfCIbIBSFQiiJIhQgF3wgB3wiF3wgAnwiHiAVIBx8IhUgGCAaIA6FQgGJIg4gIHwgC3wiGoVCIIkiGHwiHCAOhUIoiSIOIBp8IAR8IhogGIVCMIkiGIVCIIkiICAfICEgFSAPhUIBiSIPIB18IAZ8IhWFQiCJIh18Ih8gD4VCKIkiDyAVfCAKfCIVIB2FQjCJIh0gH3wiH3wiISAWhUIoiSIWIB58IAx8Ih4gIIVCMIkiICAhfCIhIBogFyAZhUIwiSIXIBt8IhkgFIVCAYkiFHwgEHwiGiAdhUIgiSIbICR8Ih0gFIVCKIkiFCAafCAJfCIaIBuFQjCJIhsgHyAPhUIBiSIPICJ8IBN8Ih8gF4VCIIkiFyAYIBx8Ihh8IhwgD4VCKIkiDyAffCABfCIfIBeFQjCJIhcgHHwiHCAPhUIBiSIPIBggDoVCAYkiDiAVfCAIfCIVICOFQiCJIhggGXwiGSAOhUIoiSIOIBV8IA18IhV8IA18IiKFQiCJIiN8IiQgD4VCKIkiDyAifCAMfCIiICOFQjCJIiMgJHwiJCAPhUIBiSIPIBsgHXwiGyAVIBiFQjCJIhUgISAWhUIBiSIWIB98IBB8IhiFQiCJIh18Ih8gFoVCKIkiFiAYfCAIfCIYfCASfCIhIBUgGXwiFSAXIBsgFIVCAYkiFCAefCAHfCIZhUIgiSIXfCIbIBSFQiiJIhQgGXwgAXwiGSAXhUIwiSIXhUIgiSIeIBwgICAVIA6FQgGJIg4gGnwgAnwiFYVCIIkiGnwiHCAOhUIoiSIOIBV8IAV8IhUgGoVCMIkiGiAcfCIcfCIgIA+FQiiJIg8gIXwgBHwiISAehUIwiSIeICB8IiAgGCAdhUIwiSIYIB98Ih0gFoVCAYkiFiAZfCAGfCIZIBqFQiCJIhogJHwiHyAWhUIoiSIWIBl8IBN8IhkgGoVCMIkiGiAcIA6FQgGJIg4gInwgCXwiHCAYhUIgiSIYIBcgG3wiF3wiGyAOhUIoiSIOIBx8IAN8IhwgGIVCMIkiGCAbfCIbIA6FQgGJIg4gFSAXIBSFQgGJIhR8IAt8IhUgI4VCIIkiFyAdfCIdIBSFQiiJIhQgFXwgCnwiFXwgBHwiIoVCIIkiI3wiJCAOhUIoiSIOICJ8IAl8IiIgGyAeIBUgF4VCMIkiFSAdfCIXIBSFQgGJIhQgGXwgDHwiGYVCIIkiHXwiGyAUhUIoiSIUIBl8IAp8IhkgHYVCMIkiHSAbfCIbIBSFQgGJIhR8IAN8Ih4gGiAffCIaIBUgICAPhUIBiSIPIBx8IAd8IhyFQiCJIhV8Ih8gD4VCKIkiDyAcfCAQfCIcIBWFQjCJIhWFQiCJIiAgFyAYIBogFoVCAYkiFiAhfCATfCIahUIgiSIYfCIXIBaFQiiJIhYgGnwgDXwiGiAYhUIwiSIYIBd8Ihd8IiEgFIVCKIkiFCAefCAFfCIeICCFQjCJIiAgIXwiISAiICOFQjCJIiIgJHwiIyAOhUIBiSIOIBx8IAt8IhwgGIVCIIkiGCAbfCIbIA6FQiiJIg4gHHwgEnwiHCAYhUIwiSIYIBcgFoVCAYkiFiAZfCABfCIXICKFQiCJIhkgFSAffCIVfCIfIBaFQiiJIhYgF3wgBnwiFyAZhUIwiSIZIB98Ih8gFoVCAYkiFiAVIA+FQgGJIg8gGnwgCHwiFSAdhUIgiSIaICN8Ih0gD4VCKIkiDyAVfCACfCIVfCANfCIihUIgiSIjfCIkIBaFQiiJIhYgInwgCXwiIiAjhUIwiSIjICR8IiQgFoVCAYkiFiAYIBt8IhggFSAahUIwiSIVICEgFIVCAYkiFCAXfCASfCIXhUIgiSIafCIbIBSFQiiJIhQgF3wgCHwiF3wgB3wiISAVIB18IhUgGSAYIA6FQgGJIg4gHnwgBnwiGIVCIIkiGXwiHSAOhUIoiSIOIBh8IAt8IhggGYVCMIkiGYVCIIkiHiAfICAgFSAPhUIBiSIPIBx8IAp8IhWFQiCJIhx8Ih8gD4VCKIkiDyAVfCAEfCIVIByFQjCJIhwgH3wiH3wiICAWhUIoiSIWICF8IAN8IiEgHoVCMIkiHiAgfCIgIBggFyAahUIwiSIXIBt8IhogFIVCAYkiFHwgBXwiGCAchUIgiSIbICR8IhwgFIVCKIkiFCAYfCABfCIYIBuFQjCJIhsgHyAPhUIBiSIPICJ8IAx8Ih8gF4VCIIkiFyAZIB18Ihl8Ih0gD4VCKIkiDyAffCATfCIfIBeFQjCJIhcgHXwiHSAPhUIBiSIPIBkgDoVCAYkiDiAVfCAQfCIVICOFQiCJIhkgGnwiGiAOhUIoiSIOIBV8IAJ8IhV8IBN8IiKFQiCJIiN8IiQgD4VCKIkiDyAifCASfCIiICOFQjCJIiMgJHwiJCAPhUIBiSIPIBsgHHwiGyAVIBmFQjCJIhUgICAWhUIBiSIWIB98IAt8IhmFQiCJIhx8Ih8gFoVCKIkiFiAZfCACfCIZfCAJfCIgIBUgGnwiFSAXIBsgFIVCAYkiFCAhfCAFfCIahUIgiSIXfCIbIBSFQiiJIhQgGnwgA3wiGiAXhUIwiSIXhUIgiSIhIB0gHiAVIA6FQgGJIg4gGHwgEHwiFYVCIIkiGHwiHSAOhUIoiSIOIBV8IAF8IhUgGIVCMIkiGCAdfCIdfCIeIA+FQiiJIg8gIHwgDXwiICAhhUIwiSIhIB58Ih4gGSAchUIwiSIZIB98IhwgFoVCAYkiFiAafCAIfCIaIBiFQiCJIhggJHwiHyAWhUIoiSIWIBp8IAp8IhogGIVCMIkiGCAdIA6FQgGJIg4gInwgBHwiHSAZhUIgiSIZIBcgG3wiF3wiGyAOhUIoiSIOIB18IAd8Ih0gGYVCMIkiGSAbfCIbIA6FQgGJIg4gFSAXIBSFQgGJIhR8IAx8IhUgI4VCIIkiFyAcfCIcIBSFQiiJIhQgFXwgBnwiFXwgEnwiIoVCIIkiI3wiJCAOhUIoiSIOICJ8IBN8IiIgGyAhIBUgF4VCMIkiFSAcfCIXIBSFQgGJIhQgGnwgBnwiGoVCIIkiHHwiGyAUhUIoiSIUIBp8IBB8IhogHIVCMIkiHCAbfCIbIBSFQgGJIhR8IA18IiEgGCAffCIYIBUgHiAPhUIBiSIPIB18IAJ8Ih2FQiCJIhV8Ih4gD4VCKIkiDyAdfCABfCIdIBWFQjCJIhWFQiCJIh8gFyAZIBggFoVCAYkiFiAgfCADfCIYhUIgiSIZfCIXIBaFQiiJIhYgGHwgBHwiGCAZhUIwiSIZIBd8Ihd8IiAgFIVCKIkiFCAhfCAIfCIhIB+FQjCJIh8gIHwiICAiICOFQjCJIiIgJHwiIyAOhUIBiSIOIB18IAd8Ih0gGYVCIIkiGSAbfCIbIA6FQiiJIg4gHXwgDHwiHSAZhUIwiSIZIBcgFoVCAYkiFiAafCALfCIXICKFQiCJIhogFSAefCIVfCIeIBaFQiiJIhYgF3wgCXwiFyAahUIwiSIaIB58Ih4gFoVCAYkiFiAVIA+FQgGJIg8gGHwgBXwiFSAchUIgiSIYICN8IhwgD4VCKIkiDyAVfCAKfCIVfCACfCIChUIgiSIifCIjIBaFQiiJIhYgAnwgC3wiAiAihUIwiSILICN8IiIgFoVCAYkiFiAZIBt8IhkgFSAYhUIwiSIVICAgFIVCAYkiFCAXfCANfCINhUIgiSIXfCIYIBSFQiiJIhQgDXwgBXwiBXwgEHwiECAVIBx8Ig0gGiAZIA6FQgGJIg4gIXwgDHwiDIVCIIkiFXwiGSAOhUIoiSIOIAx8IBJ8IhIgFYVCMIkiDIVCIIkiFSAeIB8gDSAPhUIBiSINIB18IAl8IgmFQiCJIg98IhogDYVCKIkiDSAJfCAIfCIJIA+FQjCJIgggGnwiD3wiGiAWhUIoiSIWIBB8IAd8IhAgEYUgDCAZfCIHIA6FQgGJIgwgCXwgCnwiCiALhUIgiSILIAUgF4VCMIkiBSAYfCIJfCIOIAyFQiiJIgwgCnwgE3wiEyALhUIwiSIKIA58IguFNwOAiQFBACADIAYgDyANhUIBiSINIAJ8fCICIAWFQiCJIgUgB3wiBiANhUIoiSIHIAJ8fCICQQApA4iJAYUgBCABIBIgCSAUhUIBiSIDfHwiASAIhUIgiSISICJ8IgkgA4VCKIkiAyABfHwiASAShUIwiSIEIAl8IhKFNwOIiQFBACATQQApA5CJAYUgECAVhUIwiSIQIBp8IhOFNwOQiQFBACABQQApA5iJAYUgAiAFhUIwiSICIAZ8IgGFNwOYiQFBACASIAOFQgGJQQApA6CJAYUgAoU3A6CJAUEAIBMgFoVCAYlBACkDqIkBhSAKhTcDqIkBQQAgASAHhUIBiUEAKQOwiQGFIASFNwOwiQFBACALIAyFQgGJQQApA7iJAYUgEIU3A7iJAQvdAgUBfwF+AX8BfgJ/IwBBwABrIgAkAAJAQQApA9CJAUIAUg0AQQBBACkDwIkBIgFBACgC4IoBIgKsfCIDNwPAiQFBAEEAKQPIiQEgAyABVK18NwPIiQECQEEALQDoigFFDQBBAEJ/NwPYiQELQQBCfzcD0IkBAkAgAkH/AEoNAEEAIQQDQCACIARqQeCJAWpBADoAACAEQQFqIgRBgAFBACgC4IoBIgJrSA0ACwtB4IkBEAIgAEEAKQOAiQE3AwAgAEEAKQOIiQE3AwggAEEAKQOQiQE3AxAgAEEAKQOYiQE3AxggAEEAKQOgiQE3AyAgAEEAKQOoiQE3AyggAEEAKQOwiQE3AzAgAEEAKQO4iQE3AzhBACgC5IoBIgVBAUgNAEEAIQRBACECA0AgBEGACWogACAEai0AADoAACAEQQFqIQQgBSACQQFqIgJB/wFxSg0ACwsgAEHAAGokAAv9AwMBfwF+AX8jAEGAAWsiAiQAQQBBgQI7AfKKAUEAIAE6APGKAUEAIAA6APCKAUGQfiEAA0AgAEGAiwFqQgA3AAAgAEH4igFqQgA3AAAgAEHwigFqQgA3AAAgAEEYaiIADQALQQAhAEEAQQApA/CKASIDQoiS853/zPmE6gCFNwOAiQFBAEEAKQP4igFCu86qptjQ67O7f4U3A4iJAUEAQQApA4CLAUKr8NP0r+68tzyFNwOQiQFBAEEAKQOIiwFC8e30+KWn/aelf4U3A5iJAUEAQQApA5CLAULRhZrv+s+Uh9EAhTcDoIkBQQBBACkDmIsBQp/Y+dnCkdqCm3+FNwOoiQFBAEEAKQOgiwFC6/qG2r+19sEfhTcDsIkBQQBBACkDqIsBQvnC+JuRo7Pw2wCFNwO4iQFBACADp0H/AXE2AuSKAQJAIAFBAUgNACACQgA3A3ggAkIANwNwIAJCADcDaCACQgA3A2AgAkIANwNYIAJCADcDUCACQgA3A0ggAkIANwNAIAJCADcDOCACQgA3AzAgAkIANwMoIAJCADcDICACQgA3AxggAkIANwMQIAJCADcDCCACQgA3AwBBACEEA0AgAiAAaiAAQYAJai0AADoAACAAQQFqIQAgBEEBaiIEQf8BcSABSA0ACyACQYABEAELIAJBgAFqJAALEgAgAEEDdkH/P3EgAEEQdhAECwkAQYAJIAAQAQsGAEGAiQELGwAgAUEDdkH/P3EgAUEQdhAEQYAJIAAQARADCwsLAQBBgAgLBPAAAAA=",
		hash: "c6f286e6"
	};
	mutex$k = new Mutex();
	wasmCache$k = null;
	uint32View = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(4));
	validateOptions$3 = (options) => {
		var _a;
		if (!options || typeof options !== "object") throw new Error("Invalid options parameter. It requires an object.");
		if (!options.password) throw new Error("Password must be specified");
		options.password = getUInt8Buffer(options.password);
		if (options.password.length < 1) throw new Error("Password must be specified");
		if (!options.salt) throw new Error("Salt must be specified");
		options.salt = getUInt8Buffer(options.salt);
		if (options.salt.length < 8) throw new Error("Salt should be at least 8 bytes long");
		options.secret = getUInt8Buffer((_a = options.secret) !== null && _a !== void 0 ? _a : "");
		if (!Number.isInteger(options.iterations) || options.iterations < 1) throw new Error("Iterations should be a positive number");
		if (!Number.isInteger(options.parallelism) || options.parallelism < 1) throw new Error("Parallelism should be a positive number");
		if (!Number.isInteger(options.hashLength) || options.hashLength < 4) throw new Error("Hash length should be at least 4 bytes.");
		if (!Number.isInteger(options.memorySize)) throw new Error("Memory size should be specified.");
		if (options.memorySize < 8 * options.parallelism) throw new Error("Memory size should be at least 8 * parallelism.");
		if (options.outputType === void 0) options.outputType = "hex";
		if (![
			"hex",
			"binary",
			"encoded"
		].includes(options.outputType)) throw new Error(`Insupported output type ${options.outputType}. Valid values: ['hex', 'binary', 'encoded']`);
	};
	getHashParameters = (password, encoded, secret) => {
		const match = encoded.match(/^\$argon2(id|i|d)\$v=([0-9]+)\$((?:[mtp]=[0-9]+,){2}[mtp]=[0-9]+)\$([A-Za-z0-9+/]+)\$([A-Za-z0-9+/]+)$/);
		if (!match) throw new Error("Invalid hash");
		const [, hashType, version, parameters, salt, hash] = match;
		if (version !== "19") throw new Error(`Unsupported version: ${version}`);
		const parsedParameters = {};
		const paramMap = {
			m: "memorySize",
			p: "parallelism",
			t: "iterations"
		};
		for (const x of parameters.split(",")) {
			const [n, v] = x.split("=");
			parsedParameters[paramMap[n]] = Number(v);
		}
		return Object.assign(Object.assign({}, parsedParameters), {
			password,
			secret,
			hashType,
			salt: decodeBase64(salt),
			hashLength: getDecodeBase64Length(hash),
			outputType: "encoded"
		});
	};
	validateVerifyOptions$1 = (options) => {
		if (!options || typeof options !== "object") throw new Error("Invalid options parameter. It requires an object.");
		if (options.hash === void 0 || typeof options.hash !== "string") throw new Error("Hash should be specified");
	};
	wasmJson$i = {
		name: "blake2s",
		data: "AGFzbQEAAAABEQRgAAF/YAJ/fwBgAX8AYAAAAwkIAAECAwICAAEFBAEBAgIGDgJ/AUGgigULfwBBgAgLB3AIBm1lbW9yeQIADkhhc2hfR2V0QnVmZmVyAAAKSGFzaF9GaW5hbAADCUhhc2hfSW5pdAAEC0hhc2hfVXBkYXRlAAUNSGFzaF9HZXRTdGF0ZQAGDkhhc2hfQ2FsY3VsYXRlAAcKU1RBVEVfU0laRQMBCr4yCAUAQYAJC6gFAQZ/AkAgAUEBSA0AAkACQAJAIAFBwABBACgC8IkBIgJrIgNKDQAgASEDDAELQQBBADYC8IkBAkAgAkHAAEYNACACQbCJAWohBAJAAkAgA0EHcSIFDQAgACEGIAMhBwwBCyAFIQcgACEGA0AgBCAGLQAAOgAAIARBAWohBCAGQQFqIQYgB0F/aiIHDQALQcAAIAIgBWprIQcLIAJBR2pBB0kNAANAIAQgBi0AADoAACAEIAYtAAE6AAEgBCAGLQACOgACIAQgBi0AAzoAAyAEIAYtAAQ6AAQgBCAGLQAFOgAFIAQgBi0ABjoABiAEIAYtAAc6AAcgBEEIaiEEIAZBCGohBiAHQXhqIgcNAAsLQQAhBEEAQQAoAqCJASIGQcAAajYCoIkBQQBBACgCpIkBIAZBv39LajYCpIkBQbCJARACIAAgA2ohAAJAIAEgA2siA0HBAEgNACACIAFqIQQDQEEAQQAoAqCJASIGQcAAajYCoIkBQQBBACgCpIkBIAZBv39LajYCpIkBIAAQAiAAQcAAaiEAIAQiBkFAaiIEQYABSw0ACyAGQYB/aiEDQQAoAvCJASECDAELQQAoAvCJASECIANFDQELIANBf2ohASACQbCJAWohBAJAAkAgA0EHcSIGDQAgAyEHDAELIANBeHEhBwNAIAQgAC0AADoAACAEQQFqIQQgAEEBaiEAIAZBf2oiBg0ACwsCQCABQQdJDQADQCAEIAAtAAA6AAAgBCAALQABOgABIAQgAC0AAjoAAiAEIAAtAAM6AAMgBCAALQAEOgAEIAQgAC0ABToABSAEIAAtAAY6AAYgBCAALQAHOgAHIARBCGohBCAAQQhqIQAgB0F4aiIHDQALC0EAKALwiQEhAiADIQQLQQAgAiAEajYC8IkBCwuXJwoBfgF/An4CfwF+B38DfgZ/AX4Sf0EAQQApA5iJASIBpyICQQApA4iJASIDp2ogACkDECIEpyIFaiIGQQApA6iJAUKrs4/8kaOz8NsAhSIHp3NBEHciCEHy5rvjA2oiCSACc0EUdyIKIAZqIARCIIinIgJqIgsgCHNBGHciDCAJaiINIApzQRl3Ig5BACkDkIkBIgRCIIinIghBACkDgIkBIg9CIIinaiAAKQMIIhCnIgZqIglBACkDoIkBQv+kuYjFkdqCm3+FIhFCIIinc0EQdyISQYXdntt7aiITIAhzQRR3IhQgCWogEEIgiKciCGoiFWogACkDKCIQpyIJaiIWIASnIhcgD6dqIAApAwAiGKciCmoiGSARp3NBEHciGkHnzKfQBmoiGyAXc0EUdyIcIBlqIBhCIIinIhdqIh0gGnNBGHciHnNBEHciHyABQiCIpyIaIANCIIinaiAAKQMYIgGnIhlqIiAgB0IgiKdzQRB3IiFBuuq/qnpqIiIgGnNBFHciIyAgaiABQiCIpyIaaiIgICFzQRh3IiEgImoiImoiJCAOc0EUdyIlIBZqIBBCIIinIg5qIhYgH3NBGHciHyAkaiIkIBUgEnNBGHciFSATaiImIBRzQRl3IhMgHWogACkDICIBpyISaiIUICFzQRB3Ih0gDWoiISATc0EUdyInIBRqIAFCIIinIg1qIhQgHXNBGHciHSAiICNzQRl3IhMgC2ogACkDMCIBpyILaiIiIBVzQRB3IhUgHiAbaiIbaiIeIBNzQRR3IiMgImogAUIgiKciE2oiIiAVc0EYdyIVIB5qIh4gI3NBGXciIyAgIBsgHHNBGXciG2ogACkDOCIBpyIAaiIcIAxzQRB3IiAgJmoiJiAbc0EUdyIbIBxqIAFCIIinIgxqIhxqIBNqIihzQRB3IilqIiogI3NBFHciIyAoaiAZaiIoIB4gHyAcICBzQRh3IhwgJmoiICAbc0EZdyIbIBRqIABqIhRzQRB3Ih9qIh4gG3NBFHciGyAUaiAJaiIUIB9zQRh3Ih8gHmoiHiAbc0EZdyIbaiACaiImIB0gIWoiHSAcICQgJXNBGXciISAiaiANaiIic0EQdyIcaiIkICFzQRR3IiEgImogDGoiIiAcc0EYdyIcc0EQdyIlICAgFSAdICdzQRl3Ih0gFmogBWoiFnNBEHciFWoiICAdc0EUdyIdIBZqIBJqIhYgFXNBGHciFSAgaiIgaiInIBtzQRR3IhsgJmogCGoiJiAlc0EYdyIlICdqIicgKCApc0EYdyIoICpqIikgI3NBGXciIyAiaiAOaiIiIBVzQRB3IhUgHmoiHiAjc0EUdyIjICJqIBpqIiIgFXNBGHciFSAgIB1zQRl3Ih0gFGogF2oiFCAoc0EQdyIgIBwgJGoiHGoiJCAdc0EUdyIdIBRqIAtqIhQgIHNBGHciICAkaiIkIB1zQRl3Ih0gHCAhc0EZdyIcIBZqIApqIhYgH3NBEHciHyApaiIhIBxzQRR3IhwgFmogBmoiFmogC2oiKHNBEHciKWoiKiAdc0EUdyIdIChqIApqIiggKXNBGHciKSAqaiIqIB1zQRl3Ih0gFSAeaiIVIBYgH3NBGHciFiAnIBtzQRl3IhsgFGogDmoiFHNBEHciHmoiHyAbc0EUdyIbIBRqIBJqIhRqIAlqIicgFiAhaiIWICAgFSAjc0EZdyIVICZqIAxqIiFzQRB3IiBqIiMgFXNBFHciFSAhaiATaiIhICBzQRh3IiBzQRB3IiYgJCAlIBYgHHNBGXciFiAiaiACaiIcc0EQdyIiaiIkIBZzQRR3IhYgHGogBmoiHCAic0EYdyIiICRqIiRqIiUgHXNBFHciHSAnaiAAaiInICZzQRh3IiYgJWoiJSAhIBQgHnNBGHciFCAfaiIeIBtzQRl3IhtqIA1qIh8gInNBEHciISAqaiIiIBtzQRR3IhsgH2ogBWoiHyAhc0EYdyIhICQgFnNBGXciFiAoaiAIaiIkIBRzQRB3IhQgICAjaiIgaiIjIBZzQRR3IhYgJGogGWoiJCAUc0EYdyIUICNqIiMgFnNBGXciFiAgIBVzQRl3IhUgHGogGmoiHCApc0EQdyIgIB5qIh4gFXNBFHciFSAcaiAXaiIcaiATaiIoc0EQdyIpaiIqIBZzQRR3IhYgKGogC2oiKCApc0EYdyIpICpqIiogFnNBGXciFiAhICJqIiEgHCAgc0EYdyIcICUgHXNBGXciHSAkaiAIaiIgc0EQdyIiaiIkIB1zQRR3Ih0gIGogF2oiIGogAmoiJSAcIB5qIhwgFCAhIBtzQRl3IhsgJ2ogGmoiHnNBEHciFGoiISAbc0EUdyIbIB5qIA1qIh4gFHNBGHciFHNBEHciJyAjICYgHCAVc0EZdyIVIB9qIA5qIhxzQRB3Ih9qIiMgFXNBFHciFSAcaiAAaiIcIB9zQRh3Ih8gI2oiI2oiJiAWc0EUdyIWICVqIAlqIiUgJ3NBGHciJyAmaiImICAgInNBGHciICAkaiIiIB1zQRl3Ih0gHmogBmoiHiAfc0EQdyIfICpqIiQgHXNBFHciHSAeaiAZaiIeIB9zQRh3Ih8gIyAVc0EZdyIVIChqIAVqIiMgIHNBEHciICAUICFqIhRqIiEgFXNBFHciFSAjaiAKaiIjICBzQRh3IiAgIWoiISAVc0EZdyIVIBwgFCAbc0EZdyIUaiAMaiIbIClzQRB3IhwgImoiIiAUc0EUdyIUIBtqIBJqIhtqIAlqIihzQRB3IilqIiogFXNBFHciFSAoaiAMaiIoICEgJyAbIBxzQRh3IhsgImoiHCAUc0EZdyIUIB5qIA1qIh5zQRB3IiJqIiEgFHNBFHciFCAeaiAKaiIeICJzQRh3IiIgIWoiISAUc0EZdyIUaiAIaiInIB8gJGoiHyAbICYgFnNBGXciFiAjaiAGaiIjc0EQdyIbaiIkIBZzQRR3IhYgI2ogBWoiIyAbc0EYdyIbc0EQdyImIBwgICAfIB1zQRl3Ih0gJWogAmoiH3NBEHciIGoiHCAdc0EUdyIdIB9qIBpqIh8gIHNBGHciICAcaiIcaiIlIBRzQRR3IhQgJ2ogE2oiJyAmc0EYdyImICVqIiUgKCApc0EYdyIoICpqIikgFXNBGXciFSAjaiAZaiIjICBzQRB3IiAgIWoiISAVc0EUdyIVICNqIBJqIiMgIHNBGHciICAcIB1zQRl3IhwgHmogAGoiHSAoc0EQdyIeIBsgJGoiG2oiJCAcc0EUdyIcIB1qIBdqIh0gHnNBGHciHiAkaiIkIBxzQRl3IhwgGyAWc0EZdyIWIB9qIA5qIhsgInNBEHciHyApaiIiIBZzQRR3IhYgG2ogC2oiG2ogGWoiKHNBEHciKWoiKiAcc0EUdyIcIChqIAlqIiggKXNBGHciKSAqaiIqIBxzQRl3IhwgICAhaiIgIBsgH3NBGHciGyAlIBRzQRl3IhQgHWogBmoiHXNBEHciH2oiISAUc0EUdyIUIB1qIAtqIh1qIAVqIiUgGyAiaiIbIB4gICAVc0EZdyIVICdqIBJqIiBzQRB3Ih5qIiIgFXNBFHciFSAgaiAIaiIgIB5zQRh3Ih5zQRB3IicgJCAmIBsgFnNBGXciFiAjaiAKaiIbc0EQdyIjaiIkIBZzQRR3IhYgG2ogDmoiGyAjc0EYdyIjICRqIiRqIiYgHHNBFHciHCAlaiATaiIlICdzQRh3IicgJmoiJiAgIB0gH3NBGHciHSAhaiIfIBRzQRl3IhRqIBdqIiAgI3NBEHciISAqaiIjIBRzQRR3IhQgIGogDWoiICAhc0EYdyIhICQgFnNBGXciFiAoaiAaaiIkIB1zQRB3Ih0gHiAiaiIeaiIiIBZzQRR3IhYgJGogAmoiJCAdc0EYdyIdICJqIiIgFnNBGXciFiAeIBVzQRl3IhUgG2ogDGoiGyApc0EQdyIeIB9qIh8gFXNBFHciFSAbaiAAaiIbaiAAaiIoc0EQdyIpaiIqIBZzQRR3IhYgKGogE2oiKCApc0EYdyIpICpqIiogFnNBGXciFiAhICNqIiEgGyAec0EYdyIbICYgHHNBGXciHCAkaiAXaiIec0EQdyIjaiIkIBxzQRR3IhwgHmogDGoiHmogGWoiJiAbIB9qIhsgHSAhIBRzQRl3IhQgJWogC2oiH3NBEHciHWoiISAUc0EUdyIUIB9qIAJqIh8gHXNBGHciHXNBEHciJSAiICcgGyAVc0EZdyIVICBqIAVqIhtzQRB3IiBqIiIgFXNBFHciFSAbaiAJaiIbICBzQRh3IiAgImoiImoiJyAWc0EUdyIWICZqIAhqIiYgJXNBGHciJSAnaiInIB4gI3NBGHciHiAkaiIjIBxzQRl3IhwgH2ogCmoiHyAgc0EQdyIgICpqIiQgHHNBFHciHCAfaiAaaiIfICBzQRh3IiAgIiAVc0EZdyIVIChqIA1qIiIgHnNBEHciHiAdICFqIh1qIiEgFXNBFHciFSAiaiAGaiIiIB5zQRh3Ih4gIWoiISAVc0EZdyIVIBsgHSAUc0EZdyIUaiASaiIbIClzQRB3Ih0gI2oiIyAUc0EUdyIUIBtqIA5qIhtqIAhqIihzQRB3IilqIiogFXNBFHciFSAoaiANaiIoICEgJSAbIB1zQRh3IhsgI2oiHSAUc0EZdyIUIB9qIBNqIh9zQRB3IiNqIiEgFHNBFHciFCAfaiAOaiIfICNzQRh3IiMgIWoiISAUc0EZdyIUaiAGaiIlICAgJGoiICAbICcgFnNBGXciFiAiaiALaiIic0EQdyIbaiIkIBZzQRR3IhYgImogF2oiIiAbc0EYdyIbc0EQdyInIB0gHiAgIBxzQRl3IhwgJmogGmoiIHNBEHciHmoiHSAcc0EUdyIcICBqIABqIiAgHnNBGHciHiAdaiIdaiImIBRzQRR3IhQgJWogCWoiJSAnc0EYdyInICZqIiYgKCApc0EYdyIoICpqIikgFXNBGXciFSAiaiASaiIiIB5zQRB3Ih4gIWoiISAVc0EUdyIVICJqIBlqIiIgHnNBGHciHiAdIBxzQRl3IhwgH2ogAmoiHSAoc0EQdyIfIBsgJGoiG2oiJCAcc0EUdyIcIB1qIApqIh0gH3NBGHciHyAkaiIkIBxzQRl3IhwgGyAWc0EZdyIWICBqIAxqIhsgI3NBEHciICApaiIjIBZzQRR3IhYgG2ogBWoiG2ogAGoiKHNBEHciKWoiKiAcc0EUdyIcIChqIA1qIiggKXNBGHciKSAqaiIqIBxzQRl3IhwgHiAhaiIeIBsgIHNBGHciGyAmIBRzQRl3IhQgHWogGWoiHXNBEHciIGoiISAUc0EUdyIUIB1qIAxqIh1qIAtqIiYgGyAjaiIbIB8gHiAVc0EZdyIVICVqIApqIh5zQRB3Ih9qIiMgFXNBFHciFSAeaiASaiIeIB9zQRh3Ih9zQRB3IiUgJCAnIBsgFnNBGXciFiAiaiAOaiIbc0EQdyIiaiIkIBZzQRR3IhYgG2ogCGoiGyAic0EYdyIiICRqIiRqIicgHHNBFHciHCAmaiAGaiImICVzQRh3IiUgJ2oiJyAeIB0gIHNBGHciHSAhaiIgIBRzQRl3IhRqIAlqIh4gInNBEHciISAqaiIiIBRzQRR3IhQgHmogAmoiHiAhc0EYdyIhICQgFnNBGXciFiAoaiATaiIkIB1zQRB3Ih0gHyAjaiIfaiIjIBZzQRR3IhYgJGogGmoiJCAdc0EYdyIdICNqIiMgFnNBGXciFiAfIBVzQRl3IhUgG2ogF2oiGyApc0EQdyIfICBqIiAgFXNBFHciFSAbaiAFaiIbaiAaaiIac0EQdyIoaiIpIBZzQRR3IhYgGmogGWoiGSAoc0EYdyIaIClqIiggFnNBGXciFiAhICJqIiEgGyAfc0EYdyIbICcgHHNBGXciHCAkaiASaiISc0EQdyIfaiIiIBxzQRR3IhwgEmogBWoiBWogDWoiEiAbICBqIg0gHSAhIBRzQRl3IhQgJmogCWoiCXNBEHciG2oiHSAUc0EUdyIUIAlqIAZqIgYgG3NBGHciCXNBEHciGyAjICUgDSAVc0EZdyINIB5qIBdqIhdzQRB3IhVqIh4gDXNBFHciDSAXaiACaiICIBVzQRh3IhcgHmoiFWoiHiAWc0EUdyIWIBJqIABqIhKtQiCGIAUgH3NBGHciBSAiaiIAIBxzQRl3IhwgBmogDGoiBiAXc0EQdyIXIChqIgwgHHNBFHciHCAGaiAOaiIGrYQgD4UgAiAJIB1qIgkgFHNBGXciDmogE2oiAiAac0EQdyIaIABqIhMgDnNBFHciDiACaiAKaiICIBpzQRh3IgogE2oiGq1CIIYgFSANc0EZdyINIBlqIAhqIgggBXNBEHciBSAJaiIJIA1zQRR3IhkgCGogC2oiCCAFc0EYdyIFIAlqIgmthIU3A4CJAUEAIAMgAq1CIIYgCK2EhSASIBtzQRh3IgIgHmoiCK1CIIYgBiAXc0EYdyIGIAxqIhethIU3A4iJAUEAIAQgFyAcc0EZd61CIIYgGiAOc0EZd62EhSAFrUIghiACrYSFNwOQiQFBACAJIBlzQRl3rUIghiAIIBZzQRl3rYRBACkDmIkBhSAGrUIghiAKrYSFNwOYiQELnQIBBH8jAEEgayIAJAACQEEAKAKoiQENAEEAQQAoAqCJASIBQQAoAvCJASICaiIDNgKgiQFBAEEAKAKkiQEgAyABSWo2AqSJAQJAQQAtAPiJAUUNAEEAQX82AqyJAQtBAEF/NgKoiQECQCACQT9KDQBBACEBA0AgAiABakGwiQFqQQA6AAAgAUEBaiIBQcAAQQAoAvCJASICa0gNAAsLQbCJARACIABBACkDgIkBNwMAIABBACkDiIkBNwMIIABBACkDkIkBNwMQIABBACkDmIkBNwMYQQAoAvSJASIDQQFIDQBBACEBQQAhAgNAIAFBgAlqIAAgAWotAAA6AAAgAUEBaiEBIAMgAkEBaiICQf8BcUoNAAsLIABBIGokAAuyAwEEfyMAQcAAayIBJABBAEGBAjsBgooBQQAgAEEQdiICOgCBigFBACAAQQN2OgCAigFBiH8hAwJAA0AgA0H4iQFqQQA2AgAgA0UNASADQfyJAWpBADYCACADQQhqIQMMAAsLQQAhA0EAQQAoAoCKASIEQefMp9AGczYCgIkBQQBBACgChIoBQYXdntt7czYChIkBQQBBACgCiIoBQfLmu+MDczYCiIkBQQBBACgCjIoBQbrqv6p6czYCjIkBQQBBACgCkIoBQf+kuYgFczYCkIkBQQBBACgClIoBQYzRldh5czYClIkBQQBBACgCmIoBQauzj/wBczYCmIkBQQAgBEH/AXE2AvSJAUEAQQAoApyKAUGZmoPfBXM2ApyJAQJAIABBgIAESQ0AIAFBOGpCADcDACABQTBqQgA3AwAgAUEoakIANwMAIAFBIGpCADcDACABQRhqQgA3AwAgAUEQakIANwMAIAFCADcDCCABQgA3AwBBACEAA0AgASADaiADQYAJai0AADoAACADQQFqIQMgAiAAQQFqIgBB/wFxSw0ACyABQcAAEAELIAFBwABqJAALCQBBgAkgABABCwYAQYCJAQsPACABEARBgAkgABABEAMLCwsBAEGACAsEfAAAAA==",
		hash: "5c0ff166"
	};
	mutex$j = new Mutex();
	wasmCache$j = null;
	wasmJson$h = {
		name: "blake3",
		data: "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IQEgAkFAaiICQcAASw0ACwsCQEHAACAHQf8BcSIGayIFIAIgBSACSRsiCUUNACAJQQNxIQtBACEFAkAgCUEESQ0AIAAgBmohByAJQfwAcSEIQQAhBQNAIAcgBWoiAkEoaiABIAVqIgotAAA6AAAgAkEpaiAKQQFqLQAAOgAAIAJBKmogCkECai0AADoAACACQStqIApBA2otAAA6AAAgCCAFQQRqIgVHDQALCwJAIAtFDQAgASAFaiEBIAUgBmogAGpBKGohBQNAIAUgAS0AADoAACABQQFqIQEgBUEBaiEFIAtBf2oiCw0ACwsgAC0AaCEHCyAAIAcgCWo6AGggA0HAAGokAAveAwQFfwN+BX8GfiMAQdABayIBJAACQCAAe6ciAkEALQCQigEiA08NAEEALQCKigFBBHIhBCABQShqIQVBACkDmIkBIQBBACkDkIkBIQZBACkDiIkBIQdBACkDgIkBIQggAyEJA0AgASAANwMYIAEgBjcDECABIAc3AwggASAINwMAIAEgA0EFdCIDQdGJAWoiCikDADcDKCABIANB2YkBaiILKQMANwMwIAEgA0HhiQFqIgwpAwA3AzggASADQemJAWoiDSkDADcDQCABIANB8YkBaikDADcDSCABIANB+YkBaikDADcDUCABIANBgYoBaikDADcDWCADQYmKAWopAwAhDiABQcAAOgBoIAEgDjcDYCABQgA3AyAgASAEOgBpIAEgADcDiAEgASAGNwOAASABIAc3A3ggASAINwNwIAFBkAFqIAFB8ABqIAVBwABCACAEQf8BcRACIAEpA7ABIQ4gASkDkAEhDyABKQO4ASEQIAEpA5gBIREgASkDwAEhEiABKQOgASETIA0gASkDyAEgASkDqAGFNwMAIAwgEiAThTcDACALIBAgEYU3AwAgCiAOIA+FNwMAIAlBf2oiCUH/AXEiAyACSw0AC0EAIAk6AJCKAQsgAUHQAWokAAvHCQIKfwV+IwBB4AJrIgUkAAJAAkAgAUGACEsNACAFIAA2AvwBIAVB/AFqIAFBgAhGIgZBECACQQEgA0EBQQIgBBABIAZBCnQiByABTw0BIAVB4ABqIgZCADcDACAFQdgAaiIIQgA3AwAgBUHQAGoiCUIANwMAIAVByABqIgpCADcDACAFQcAAaiILQgA3AwAgBUE4aiIMQgA3AwAgBUEwaiINQgA3AwAgBSADOgBqIAVCADcDKCAFQQA7AWggBUEAKQOAiQE3AwAgBUEAKQOIiQE3AwggBUEAKQOQiQE3AxAgBUEAKQOYiQE3AxggBSABQYAIRiIOrSACfDcDICAFIAAgB2pBACABIA4bEAQgBUGIAWpBMGogDSkDADcDACAFQYgBakE4aiAMKQMANwMAIAUgBSkDACIPNwOIASAFIAUpAwgiEDcDkAEgBSAFKQMQIhE3A5gBIAUgBSkDGCISNwOgASAFIAUpAyg3A7ABIAUtAGohACAFLQBpIQcgBSkDICECIAUtAGghASAFQYgBakHAAGogCykDADcDACAFQYgBakHIAGogCikDADcDACAFQYgBakHQAGogCSkDADcDACAFQYgBakHYAGogCCkDADcDACAFQYgBakHgAGogBikDADcDACAFIAE6APABIAUgAjcDqAEgBSAAIAdFckECciIAOgDxASAFIBI3A5gCIAUgETcDkAIgBSAQNwOIAiAFIA83A4ACIAVBoAJqIAVBgAJqIAVBsAFqIAEgAiAAQf8BcRACIAUpA8ACIQIgBSkDoAIhDyAFKQPIAiEQIAUpA6gCIREgBSkD0AIhEiAFKQOwAiETIAQgDkEFdGoiASAFKQPYAiAFKQO4AoU3AxggASASIBOFNwMQIAEgECARhTcDCCABIAIgD4U3AwBBAkEBIA4bIQYMAQsgAEIBIAFBf2pBCnZBAXKteUI/hYYiD6dBCnQiDiACIAMgBRAGIQcgACAOaiABIA5rIA9C////AYMgAnwgAyAFQcAAQSAgDkGACEsbahAGIQECQCAHQQFHDQAgBCAFKQMANwMAIAQgBSkDCDcDCCAEIAUpAxA3AxAgBCAFKQMYNwMYIAQgBSkDIDcDICAEIAUpAyg3AyggBCAFKQMwNwMwIAQgBSkDODcDOEECIQYMAQtBACEGQQAhAAJAIAEgB2oiCUECSQ0AIAlBfmoiCkEBdkEBaiIGQQNxIQ5BACEHAkAgCkEGSQ0AIAZB/P///wdxIQhBACEHIAVBiAFqIQEgBSEAA0AgASAANgIAIAFBDGogAEHAAWo2AgAgAUEIaiAAQYABajYCACABQQRqIABBwABqNgIAIABBgAJqIQAgAUEQaiEBIAggB0EEaiIHRw0ACwsgCkF+cSEIAkAgDkUNACAFIAdBBnRqIQEgBUGIAWogB0ECdGohAANAIAAgATYCACABQcAAaiEBIABBBGohACAOQX9qIg4NAAsLIAhBAmohAAsgBUGIAWogBkEBQgBBACADQQRyQQBBACAEEAEgACAJTw0AIAQgBkEFdGoiASAFIAZBBnRqIgApAwA3AwAgASAAKQMINwMIIAEgACkDEDcDECABIAApAxg3AxggBkEBaiEGCyAFQeACaiQAIAYLrRAIAn8EfgF/AX4EfwR+BH8EfiMAQfABayIBJAACQCAARQ0AAkBBAC0AkIoBIgINACABQTBqQQApA9CJATcDACABQThqQQApA9iJATcDACABQQApA6CJASIDNwMAIAFBACkDqIkBIgQ3AwggAUEAKQOwiQEiBTcDECABQQApA7iJASIGNwMYIAFBACkDyIkBNwMoQQAtAIqKASECQQAtAImKASEHQQApA8CJASEIQQAtAIiKASEJIAFBwABqQQApA+CJATcDACABQcgAakEAKQPoiQE3AwAgAUHQAGpBACkD8IkBNwMAIAFB2ABqQQApA/iJATcDACABQeAAakEAKQOAigE3AwAgASAJOgBoIAEgCDcDICABIAIgB0VyIgJBAnI6AGkgAUEoaiEKQgAhCEGACSELIAJBCnJB/wFxIQwDQCABQbABaiABIAogCUH/AXEgCCAMEAIgASABKQPQASINIAEpA7ABhTcDcCABIAEpA9gBIg4gASkDuAGFNwN4IAEgASkD4AEiDyABKQPAAYU3A4ABIAEgASkD6AEiECAGhTcDqAEgASAPIAWFNwOgASABIA4gBIU3A5gBIAEgDSADhTcDkAEgASAQIAEpA8gBhTcDiAEgAEHAACAAQcAASRsiEUF/aiESAkACQCARQQdxIhMNACABQfAAaiECIAshByARIRQMAQsgEUH4AHEhFCABQfAAaiECIAshBwNAIAcgAi0AADoAACAHQQFqIQcgAkEBaiECIBNBf2oiEw0ACwsCQCASQQdJDQADQCAHIAIpAAA3AAAgB0EIaiEHIAJBCGohAiAUQXhqIhQNAAsLIAhCAXwhCCALIBFqIQsgACARayIADQAMAgsLAkACQAJAQQAtAImKASIHQQZ0QQBBAC0AiIoBIhFrRg0AIAEgEToAaCABQQApA4CKATcDYCABQQApA/iJATcDWCABQQApA/CJATcDUCABQQApA+iJATcDSCABQQApA+CJATcDQCABQQApA9iJATcDOCABQQApA9CJATcDMCABQQApA8iJATcDKCABQQApA8CJASIINwMgIAFBACkDuIkBIgM3AxggAUEAKQOwiQEiBDcDECABQQApA6iJASIFNwMIIAFBACkDoIkBIgY3AwAgAUEALQCKigEiEyAHRXJBAnIiCzoAaSATQQRyIRNBACkDmIkBIQ1BACkDkIkBIQ5BACkDiIkBIQ9BACkDgIkBIRAMAQtBwAAhESABQcAAOgBoQgAhCCABQgA3AyAgAUEAKQOYiQEiDTcDGCABQQApA5CJASIONwMQIAFBACkDiIkBIg83AwggAUEAKQOAiQEiEDcDACABQQAtAIqKAUEEciITOgBpIAEgAkF+aiICQQV0IgdByYoBaikDADcDYCABIAdBwYoBaikDADcDWCABIAdBuYoBaikDADcDUCABIAdBsYoBaikDADcDSCABIAdBqYoBaikDADcDQCABIAdBoYoBaikDADcDOCABIAdBmYoBaikDADcDMCABIAdBkYoBaikDADcDKCATIQsgECEGIA8hBSAOIQQgDSEDIAJFDQELIAJBf2oiB0EFdCIUQZGKAWopAwAhFSAUQZmKAWopAwAhFiAUQaGKAWopAwAhFyAUQamKAWopAwAhGCABIAM3A4gBIAEgBDcDgAEgASAFNwN4IAEgBjcDcCABQbABaiABQfAAaiABQShqIhQgESAIIAtB/wFxEAIgASATOgBpIAFBwAA6AGggASAYNwNAIAEgFzcDOCABIBY3AzAgASAVNwMoIAFCADcDICABIA03AxggASAONwMQIAEgDzcDCCABIBA3AwAgASABKQPoASABKQPIAYU3A2AgASABKQPgASABKQPAAYU3A1ggASABKQPYASABKQO4AYU3A1AgASABKQPQASABKQOwAYU3A0ggB0UNACACQQV0QemJAWohAiATQf8BcSERA0AgAkFoaikDACEIIAJBcGopAwAhAyACQXhqKQMAIQQgAikDACEFIAEgDTcDiAEgASAONwOAASABIA83A3ggASAQNwNwIAFBsAFqIAFB8ABqIBRBwABCACAREAIgASATOgBpIAFBwAA6AGggASAFNwNAIAEgBDcDOCABIAM3AzAgASAINwMoIAFCADcDICABIA03AxggASAONwMQIAEgDzcDCCABIBA3AwAgASABKQPoASABKQPIAYU3A2AgASABKQPgASABKQPAAYU3A1ggASABKQPYASABKQO4AYU3A1AgASABKQPQASABKQOwAYU3A0ggAkFgaiECIAdBf2oiBw0ACwsgAUEoaiEJQgAhCEGACSELIBNBCHJB/wFxIQoDQCABQbABaiABIAlBwAAgCCAKEAIgASABKQPQASIDIAEpA7ABhTcDcCABIAEpA9gBIgQgASkDuAGFNwN4IAEgASkD4AEiBSABKQPAAYU3A4ABIAEgDSABKQPoASIGhTcDqAEgASAOIAWFNwOgASABIA8gBIU3A5gBIAEgECADhTcDkAEgASAGIAEpA8gBhTcDiAEgAEHAACAAQcAASRsiEUF/aiESAkACQCARQQdxIhMNACABQfAAaiECIAshByARIRQMAQsgEUH4AHEhFCABQfAAaiECIAshBwNAIAcgAi0AADoAACAHQQFqIQcgAkEBaiECIBNBf2oiEw0ACwsCQCASQQdJDQADQCAHIAIpAAA3AAAgB0EIaiEHIAJBCGohAiAUQXhqIhQNAAsLIAhCAXwhCCALIBFqIQsgACARayIADQALCyABQfABaiQAC6MCAQR+AkACQCAAQSBGDQBCq7OP/JGjs/DbACEBQv+kuYjFkdqCm38hAkLy5rvjo6f9p6V/IQNC58yn0NbQ67O7fyEEQQAhAAwBC0EAKQOYCSEBQQApA5AJIQJBACkDiAkhA0EAKQOACSEEQRAhAAtBACAAOgCKigFBAEIANwOAigFBAEIANwP4iQFBAEIANwPwiQFBAEIANwPoiQFBAEIANwPgiQFBAEIANwPYiQFBAEIANwPQiQFBAEIANwPIiQFBAEIANwPAiQFBACABNwO4iQFBACACNwOwiQFBACADNwOoiQFBACAENwOgiQFBACABNwOYiQFBACACNwOQiQFBACADNwOIiQFBACAENwOAiQFBAEEAOgCQigFBAEEAOwGIigELBgAgABADCwYAIAAQBwsGAEGAiQELqwIBBH4CQAJAIAFBIEYNAEKrs4/8kaOz8NsAIQNC/6S5iMWR2oKbfyEEQvLmu+Ojp/2npX8hBULnzKfQ1tDrs7t/IQZBACEBDAELQQApA5gJIQNBACkDkAkhBEEAKQOICSEFQQApA4AJIQZBECEBC0EAIAE6AIqKAUEAQgA3A4CKAUEAQgA3A/iJAUEAQgA3A/CJAUEAQgA3A+iJAUEAQgA3A+CJAUEAQgA3A9iJAUEAQgA3A9CJAUEAQgA3A8iJAUEAQgA3A8CJAUEAIAM3A7iJAUEAIAQ3A7CJAUEAIAU3A6iJAUEAIAY3A6CJAUEAIAM3A5iJAUEAIAQ3A5CJAUEAIAU3A4iJAUEAIAY3A4CJAUEAQQA6AJCKAUEAQQA7AYiKASAAEAMgAhAHCwsLAQBBgAgLBHgHAAA=",
		hash: "215d875f"
	};
	mutex$i = new Mutex();
	wasmCache$i = null;
	wasmJson$g = {
		name: "crc32",
		data: "AGFzbQEAAAABEQRgAAF/YAF/AGAAAGACf38AAwgHAAEBAQIAAwUEAQECAgYOAn8BQZDJBQt/AEGACAsHcAgGbWVtb3J5AgAOSGFzaF9HZXRCdWZmZXIAAAlIYXNoX0luaXQAAgtIYXNoX1VwZGF0ZQADCkhhc2hfRmluYWwABA1IYXNoX0dldFN0YXRlAAUOSGFzaF9DYWxjdWxhdGUABgpTVEFURV9TSVpFAwEKkggHBQBBgAkLwwMBA39BgIkBIQFBACECA0AgAUEAQQBBAEEAQQBBAEEAQQAgAkEBcWsgAHEgAkEBdnMiA0EBcWsgAHEgA0EBdnMiA0EBcWsgAHEgA0EBdnMiA0EBcWsgAHEgA0EBdnMiA0EBcWsgAHEgA0EBdnMiA0EBcWsgAHEgA0EBdnMiA0EBcWsgAHEgA0EBdnMiA0EBcWsgAHEgA0EBdnM2AgAgAUEEaiEBIAJBAWoiAkGAAkcNAAtBACEAA0AgAEGEkQFqIABBhIkBaigCACICQf8BcUECdEGAiQFqKAIAIAJBCHZzIgI2AgAgAEGEmQFqIAJB/wFxQQJ0QYCJAWooAgAgAkEIdnMiAjYCACAAQYShAWogAkH/AXFBAnRBgIkBaigCACACQQh2cyICNgIAIABBhKkBaiACQf8BcUECdEGAiQFqKAIAIAJBCHZzIgI2AgAgAEGEsQFqIAJB/wFxQQJ0QYCJAWooAgAgAkEIdnMiAjYCACAAQYS5AWogAkH/AXFBAnRBgIkBaigCACACQQh2cyICNgIAIABBhMEBaiACQf8BcUECdEGAiQFqKAIAIAJBCHZzNgIAIABBBGoiAEH8B0cNAAsLJwACQEEAKAKAyQEgAEYNACAAEAFBACAANgKAyQELQQBBADYChMkBC4gDAQN/QQAoAoTJAUF/cyEBQYAJIQICQCAAQQhJDQBBgAkhAgNAIAJBBGooAgAiA0EOdkH8B3FBgJEBaigCACADQRZ2QfwHcUGAiQFqKAIAcyADQQZ2QfwHcUGAmQFqKAIAcyADQf8BcUECdEGAoQFqKAIAcyACKAIAIAFzIgFBFnZB/AdxQYCpAWooAgBzIAFBDnZB/AdxQYCxAWooAgBzIAFBBnZB/AdxQYC5AWooAgBzIAFB/wFxQQJ0QYDBAWooAgBzIQEgAkEIaiECIABBeGoiAEEHSw0ACwsCQCAARQ0AAkACQCAAQQFxDQAgACEDDAELIAFB/wFxIAItAABzQQJ0QYCJAWooAgAgAUEIdnMhASACQQFqIQIgAEF/aiEDCyAAQQFGDQADQCABQf8BcSACLQAAc0ECdEGAiQFqKAIAIAFBCHZzIgFB/wFxIAJBAWotAABzQQJ0QYCJAWooAgAgAUEIdnMhASACQQJqIQIgA0F+aiIDDQALC0EAIAFBf3M2AoTJAQsyAQF/QQBBACgChMkBIgBBGHQgAEGA/gNxQQh0ciAAQQh2QYD+A3EgAEEYdnJyNgKACQsGAEGEyQELWQACQEEAKAKAyQEgAUYNACABEAFBACABNgKAyQELQQBBADYChMkBIAAQA0EAQQAoAoTJASIBQRh0IAFBgP4DcUEIdHIgAUEIdkGA/gNxIAFBGHZycjYCgAkLCwsBAEGACAsEBAAAAA==",
		hash: "d2eba587"
	};
	mutex$h = new Mutex();
	wasmCache$h = null;
	wasmJson$f = {
		name: "crc64",
		data: "AGFzbQEAAAABDANgAAF/YAAAYAF/AAMHBgABAgEAAQUEAQECAgYOAn8BQZCJBgt/AEGACAsHcAgGbWVtb3J5AgAOSGFzaF9HZXRCdWZmZXIAAAlIYXNoX0luaXQAAQtIYXNoX1VwZGF0ZQACCkhhc2hfRmluYWwAAw1IYXNoX0dldFN0YXRlAAQOSGFzaF9DYWxjdWxhdGUABQpTVEFURV9TSVpFAwEKgwgGBQBBgAkL9QMDAX4BfwJ+AkBBACkDgIkCQQApA4AJIgBRDQBBgIkBIQFCACECA0AgAUIAQgBCAEIAQgBCAEIAQgAgAkIBg30gAIMgAkIBiIUiA0IBg30gAIMgA0IBiIUiA0IBg30gAIMgA0IBiIUiA0IBg30gAIMgA0IBiIUiA0IBg30gAIMgA0IBiIUiA0IBg30gAIMgA0IBiIUiA0IBg30gAIMgA0IBiIUiA0IBg30gAIMgA0IBiIU3AwAgAUEIaiEBIAJCAXwiAkKAAlINAAtBACEBA0AgAUGImQFqIAFBiIkBaikDACICp0H/AXFBA3RBgIkBaikDACACQgiIhSICNwMAIAFBiKkBaiACp0H/AXFBA3RBgIkBaikDACACQgiIhSICNwMAIAFBiLkBaiACp0H/AXFBA3RBgIkBaikDACACQgiIhSICNwMAIAFBiMkBaiACp0H/AXFBA3RBgIkBaikDACACQgiIhSICNwMAIAFBiNkBaiACp0H/AXFBA3RBgIkBaikDACACQgiIhSICNwMAIAFBiOkBaiACp0H/AXFBA3RBgIkBaikDACACQgiIhSICNwMAIAFBiPkBaiACp0H/AXFBA3RBgIkBaikDACACQgiIhTcDACABQQhqIgFB+A9HDQALQQAgADcDgIkCC0EAQgA3A4iJAguUAwIBfgJ/QQApA4iJAkJ/hSEBQYAJIQICQCAAQQhJDQBBgAkhAgNAIAIpAwAgAYUiAUIwiKdB/wFxQQN0QYCZAWopAwAgAUI4iKdBA3RBgIkBaikDAIUgAUIoiKdB/wFxQQN0QYCpAWopAwCFIAFCIIinQf8BcUEDdEGAuQFqKQMAhSABpyIDQRV2QfgPcUGAyQFqKQMAhSADQQ12QfgPcUGA2QFqKQMAhSADQQV2QfgPcUGA6QFqKQMAhSADQf8BcUEDdEGA+QFqKQMAhSEBIAJBCGohAiAAQXhqIgBBB0sNAAsLAkAgAEUNAAJAAkAgAEEBcQ0AIAAhAwwBCyABQv8BgyACMQAAhadBA3RBgIkBaikDACABQgiIhSEBIAJBAWohAiAAQX9qIQMLIABBAUYNAANAIAFC/wGDIAIxAACFp0EDdEGAiQFqKQMAIAFCCIiFIgFC/wGDIAJBAWoxAACFp0EDdEGAiQFqKQMAIAFCCIiFIQEgAkECaiECIANBfmoiAw0ACwtBACABQn+FNwOIiQILZAEBfkEAQQApA4iJAiIAQjiGIABCgP4Dg0IohoQgAEKAgPwHg0IYhiAAQoCAgPgPg0IIhoSEIABCCIhCgICA+A+DIABCGIhCgID8B4OEIABCKIhCgP4DgyAAQjiIhISENwOACQsGAEGIiQILAgALCwsBAEGACAsECAAAAA==",
		hash: "c5ac6c16"
	};
	mutex$g = new Mutex();
	wasmCache$g = null;
	polyBuffer = new Uint8Array(8);
	wasmJson$e = {
		name: "md4",
		data: "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",
		hash: "bd8ce7c7"
	};
	mutex$f = new Mutex();
	wasmCache$f = null;
	wasmJson$d = {
		name: "md5",
		data: "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",
		hash: "e6508e4b"
	};
	mutex$e = new Mutex();
	wasmCache$e = null;
	wasmJson$c = {
		name: "sha1",
		data: "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",
		hash: "6b530c24"
	};
	mutex$d = new Mutex();
	wasmCache$d = null;
	wasmJson$b = {
		name: "sha3",
		data: "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",
		hash: "fb24e536"
	};
	mutex$c = new Mutex();
	wasmCache$c = null;
	mutex$b = new Mutex();
	wasmCache$b = null;
	wasmJson$a = {
		name: "sha256",
		data: "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c2pBx6KerX1qIhkgASADcyACcSABIANxcyABQR53IAFBE3dzIAFBCndzaiAaaiICaiIJIBMgEnNxIBJzaiAJQRp3IAlBFXdzIAlBB3dzakHRxqk2aiIaIAIgAXMgA3EgAiABcXMgAkEedyACQRN3cyACQQp3c2ogGGoiA2oiESAJIBNzcSATc2ogEUEadyARQRV3cyARQQd3c2pB59KkoQFqIhggAyACcyABcSADIAJxcyADQR53IANBE3dzIANBCndzaiAUaiIBaiISIBEgCXNxIAlzaiASQRp3IBJBFXdzIBJBB3dzakGFldy9AmoiFCABIANzIAJxIAEgA3FzIAFBHncgAUETd3MgAUEKd3NqIBdqIgJqIhMgI2ogJiASaiAiIBFqICUgCWogEyASIBFzcSARc2ogE0EadyATQRV3cyATQQd3c2pBuMLs8AJqIhcgAiABcyADcSACIAFxcyACQR53IAJBE3dzIAJBCndzaiAZaiIDaiIJIBMgEnNxIBJzaiAJQRp3IAlBFXdzIAlBB3dzakH827HpBGoiGSADIAJzIAFxIAMgAnFzIANBHncgA0ETd3MgA0EKd3NqIBpqIgFqIhEgCSATc3EgE3NqIBFBGncgEUEVd3MgEUEHd3NqQZOa4JkFaiIaIAEgA3MgAnEgASADcXMgAUEedyABQRN3cyABQQp3c2ogGGoiAmoiEiARIAlzcSAJc2ogEkEadyASQRV3cyASQQd3c2pB1OapqAZqIhggAiABcyADcSACIAFxcyACQR53IAJBE3dzIAJBCndzaiAUaiIDaiITaiAoIBJqICQgEWogJyAJaiATIBIgEXNxIBFzaiATQRp3IBNBFXdzIBNBB3dzakG7laizB2oiFCADIAJzIAFxIAMgAnFzIANBHncgA0ETd3MgA0EKd3NqIBdqIgFqIgkgEyASc3EgEnNqIAlBGncgCUEVd3MgCUEHd3NqQa6Si454aiIXIAEgA3MgAnEgASADcXMgAUEedyABQRN3cyABQQp3c2ogGWoiAmoiESAJIBNzcSATc2ogEUEadyARQRV3cyARQQd3c2pBhdnIk3lqIhkgAiABcyADcSACIAFxcyACQR53IAJBE3dzIAJBCndzaiAaaiIDaiISIBEgCXNxIAlzaiASQRp3IBJBFXdzIBJBB3dzakGh0f+VemoiGiADIAJz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",
		hash: "8c18dd94"
	};
	mutex$a = new Mutex();
	wasmCache$a = null;
	mutex$9 = new Mutex();
	wasmCache$9 = null;
	wasmJson$9 = {
		name: "sha512",
		data: "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",
		hash: "f2e40eb1"
	};
	mutex$8 = new Mutex();
	wasmCache$8 = null;
	mutex$7 = new Mutex();
	wasmCache$7 = null;
	wasmJson$8 = {
		name: "xxhash32",
		data: "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",
		hash: "4bb12485"
	};
	mutex$6 = new Mutex();
	wasmCache$6 = null;
	wasmJson$7 = {
		name: "xxhash64",
		data: "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",
		hash: "177fbfa3"
	};
	mutex$5 = new Mutex();
	wasmCache$5 = null;
	seedBuffer$2 = new Uint8Array(8);
	wasmJson$6 = {
		name: "xxhash3",
		data: "AGFzbQEAAAABNAhgAAF/YAR/f39/AGAHf39/f39/fwBgBH9+fn4BfmAEf39/fgF+YAN/f34BfmAAAGABfwADDg0AAQIDBAUFBQYHBgAGBQQBAQICBg4CfwFBwI4FC38AQcAJCwdwCAZtZW1vcnkCAA5IYXNoX0dldEJ1ZmZlcgAACUhhc2hfSW5pdAAIC0hhc2hfVXBkYXRlAAkKSGFzaF9GaW5hbAAKDUhhc2hfR2V0U3RhdGUACw5IYXNoX0NhbGN1bGF0ZQAMClNUQVRFX1NJWkUDAQr6QQ0FAEGACgvkAwMPfgF/AX4CQCADRQ0AIAApAzAhBCAAKQM4IQUgACkDICEGIAApAyghByAAKQMQIQggACkDGCEJIAApAwAhCiAAKQMIIQsDQCAFIAFBMGopAwAiDHwgAkE4aikDACABQThqKQMAIg2FIgVCIIggBUL/////D4N+fCEFIAcgAUEgaikDACIOfCACQShqKQMAIAFBKGopAwAiD4UiB0IgiCAHQv////8Pg358IQcgCSABQRBqKQMAIhB8IAJBGGopAwAgAUEYaikDACIRhSIJQiCIIAlC/////w+DfnwhCSALIAEpAwAiEnwgAkEIaiITKQMAIAFBCGopAwAiFIUiC0IgiCALQv////8Pg358IQsgAkEwaikDACAMhSIMQiCIIAxC/////w+DfiAEfCANfCEEIAJBIGopAwAgDoUiDEIgiCAMQv////8Pg34gBnwgD3whBiACQRBqKQMAIBCFIgxCIIggDEL/////D4N+IAh8IBF8IQggAikDACAShSIMQiCIIAxC/////w+DfiAKfCAUfCEKIAFBwABqIQEgEyECIANBf2oiAw0ACyAAIAk3AxggACAKNwMAIAAgCzcDCCAAIAc3AyggACAINwMQIAAgBTcDOCAAIAY3AyAgACAENwMwCwveAgIBfwF+AkAgBCACIAEoAgAiB2siAkkNACAAIAMgBSAHQQN0aiACEAEgACAFIAZqIgcpAwAgACkDACIIQi+IhSAIhUKx893xCX43AwAgACAHKQMIIAApAwgiCEIviIUgCIVCsfPd8Ql+NwMIIAAgBykDECAAKQMQIghCL4iFIAiFQrHz3fEJfjcDECAAIAcpAxggACkDGCIIQi+IhSAIhUKx893xCX43AxggACAHKQMgIAApAyAiCEIviIUgCIVCsfPd8Ql+NwMgIAAgBykDKCAAKQMoIghCL4iFIAiFQrHz3fEJfjcDKCAAIAcpAzAgACkDMCIIQi+IhSAIhUKx893xCX43AzAgACAHKQM4IAApAzgiCEIviIUgCIVCsfPd8Ql+NwM4IAAgAyACQQZ0aiAFIAQgAmsiBxABIAEgBzYCAA8LIAAgAyAFIAdBA3RqIAQQASABIAcgBGo2AgALhQEBAX8gAiABhSADpyIEQRh0IARBgP4DcUEIdHIgBEEIdkGA/gNxIARBGHZycq1CIIYgA4V9QQA1AoCMAUIghiAAQfyLAWo1AgCEhSIDQjGJIANCGImFIAOFQqW+4/TRjIfZn39+IgNCI4ggAK18IAOFQqW+4/TRjIfZn39+IgNCHIggA4ULZwAgAiABc60gA3wiA0IhiEEALQCAjAFBEHQgAEEIdHIgAEEBdkGAjAFqLQAAQRh0ciAAQf+LAWotAAByrYUgA4VCz9bTvtLHq9lCfiIDQh2IIAOFQvnz3fGZ9pmrFn4iA0IgiCADhQuJAwEEfgJAIABBCUkNAEEAKQOAjAEgASkDICABKQMYhSACfIUiA0I4hiADQoD+A4NCKIaEIANCgID8B4NCGIYgA0KAgID4D4NCCIaEhCADQgiIQoCAgPgPgyADQhiIQoCA/AeDhCADQiiIQoD+A4MgA0I4iISEhCAArXwgAEH4iwFqKQMAIAEpAzAgASkDKIUgAn2FIgJ8IAJC/////w+DIgQgA0IgiCIFfiIGQv////8PgyACQiCIIgIgA0L/////D4MiA358IAQgA34iA0IgiHwiBEIghiADQv////8Pg4QgBkIgiCACIAV+fCAEQiCIfIV8IgNCJYggA4VC+fPd8ZnymasWfiIDQiCIIAOFDwsCQCAAQQRJDQAgACABQQhqKQMAIAFBEGopAwAgAhADDwsCQCAARQ0AIAAgASgCACABQQRqKAIAIAIQBA8LIAEpAzggASkDQIUgAoUiA0IhiCADhULP1tO+0ser2UJ+IgNCHYggA4VC+fPd8Zn2masWfiIDQiCIIAOFC94IAQZ+IACtQoeVr6+Ytt6bnn9+IQMCQCAAQSFJDQACQCAAQcEASQ0AAkAgAEHhAEkNACABKQNoIAJ9QQApA7iMAYUiBEL/////D4MiBSABKQNgIAJ8QQApA7CMAYUiBkIgiCIHfiIIQv////8PgyAEQiCIIgQgBkL/////D4MiBn58IAUgBn4iBUIgiHwiBkIghiAFQv////8Pg4QgCEIgiCAEIAd+fCAGQiCIfIUgA3wgASkDeCACfSAAQciLAWopAwCFIgNC/////w+DIgQgASkDcCACfCAAQcCLAWopAwCFIgVCIIgiBn4iB0L/////D4MgA0IgiCIDIAVC/////w+DIgV+fCAEIAV+IgRCIIh8IgVCIIYgBEL/////D4OEIAdCIIggAyAGfnwgBUIgiHyFfCEDCyABKQNIIAJ9QQApA6iMAYUiBEL/////D4MiBSABKQNAIAJ8QQApA6CMAYUiBkIgiCIHfiIIQv////8PgyAEQiCIIgQgBkL/////D4MiBn58IAUgBn4iBUIgiHwiBkIghiAFQv////8Pg4QgCEIgiCAEIAd+fCAGQiCIfIUgA3wgASkDWCACfSAAQdiLAWopAwCFIgNC/////w+DIgQgASkDUCACfCAAQdCLAWopAwCFIgVCIIgiBn4iB0L/////D4MgA0IgiCIDIAVC/////w+DIgV+fCAEIAV+IgRCIIh8IgVCIIYgBEL/////D4OEIAdCIIggAyAGfnwgBUIgiHyFfCEDCyABKQMoIAJ9QQApA5iMAYUiBEL/////D4MiBSABKQMgIAJ8QQApA5CMAYUiBkIgiCIHfiIIQv////8PgyAEQiCIIgQgBkL/////D4MiBn58IAUgBn4iBUIgiHwiBkIghiAFQv////8Pg4QgCEIgiCAEIAd+fCAGQiCIfIUgA3wgASkDOCACfSAAQeiLAWopAwCFIgNC/////w+DIgQgASkDMCACfCAAQeCLAWopAwCFIgVCIIgiBn4iB0L/////D4MgA0IgiCIDIAVC/////w+DIgV+fCAEIAV+IgRCIIh8IgVCIIYgBEL/////D4OEIAdCIIggAyAGfnwgBUIgiHyFfCEDCyABKQMIIAJ9QQApA4iMAYUiBEL/////D4MiBSABKQMAIAJ8QQApA4CMAYUiBkIgiCIHfiIIQv////8PgyAEQiCIIgQgBkL/////D4MiBn58IAUgBn4iBUIgiHwiBkIghiAFQv////8Pg4QgCEIgiCAEIAd+fCAGQiCIfIUgA3wgASkDGCACfSAAQfiLAWopAwCFIgNC/////w+DIgQgASkDECACfCAAQfCLAWopAwCFIgJCIIgiBX4iBkL/////D4MgA0IgiCIDIAJC/////w+DIgJ+fCAEIAJ+IgJCIIh8IgRCIIYgAkL/////D4OEIAZCIIggAyAFfnwgBEIgiHyFfCICQiWIIAKFQvnz3fGZ8pmrFn4iAkIgiCAChQv8CgQBfwV+An8BfkEAIQMgASkDeCACfUEAKQP4jAGFIgRC/////w+DIgUgASkDcCACfEEAKQPwjAGFIgZCIIgiB34iCEL/////D4MgBEIgiCIEIAZC/////w+DIgZ+fCAFIAZ+IgVCIIh8IgZCIIYgBUL/////D4OEIAhCIIggBCAHfnwgBkIgiHyFIAEpA2ggAn1BACkD6IwBhSIEQv////8PgyIFIAEpA2AgAnxBACkD4IwBhSIGQiCIIgd+IghC/////w+DIARCIIgiBCAGQv////8PgyIGfnwgBSAGfiIFQiCIfCIGQiCGIAVC/////w+DhCAIQiCIIAQgB358IAZCIIh8hSABKQNYIAJ9QQApA9iMAYUiBEL/////D4MiBSABKQNQIAJ8QQApA9CMAYUiBkIgiCIHfiIIQv////8PgyAEQiCIIgQgBkL/////D4MiBn58IAUgBn4iBUIgiHwiBkIghiAFQv////8Pg4QgCEIgiCAEIAd+fCAGQiCIfIUgASkDSCACfUEAKQPIjAGFIgRC/////w+DIgUgASkDQCACfEEAKQPAjAGFIgZCIIgiB34iCEL/////D4MgBEIgiCIEIAZC/////w+DIgZ+fCAFIAZ+IgVCIIh8IgZCIIYgBUL/////D4OEIAhCIIggBCAHfnwgBkIgiHyFIAEpAzggAn1BACkDuIwBhSIEQv////8PgyIFIAEpAzAgAnxBACkDsIwBhSIGQiCIIgd+IghC/////w+DIARCIIgiBCAGQv////8PgyIGfnwgBSAGfiIFQiCIfCIGQiCGIAVC/////w+DhCAIQiCIIAQgB358IAZCIIh8hSABKQMoIAJ9QQApA6iMAYUiBEL/////D4MiBSABKQMgIAJ8QQApA6CMAYUiBkIgiCIHfiIIQv////8PgyAEQiCIIgQgBkL/////D4MiBn58IAUgBn4iBUIgiHwiBkIghiAFQv////8Pg4QgCEIgiCAEIAd+fCAGQiCIfIUgASkDGCACfUEAKQOYjAGFIgRC/////w+DIgUgASkDECACfEEAKQOQjAGFIgZCIIgiB34iCEL/////D4MgBEIgiCIEIAZC/////w+DIgZ+fCAFIAZ+IgVCIIh8IgZCIIYgBUL/////D4OEIAhCIIggBCAHfnwgBkIgiHyFIAEpAwggAn1BACkDiIwBhSIEQv////8PgyIFIAEpAwAgAnxBACkDgIwBhSIGQiCIIgd+IghC/////w+DIARCIIgiBCAGQv////8PgyIGfnwgBSAGfiIFQiCIfCIGQiCGIAVC/////w+DhCAIQiCIIAQgB358IAZCIIh8hSAArUKHla+vmLbem55/fnx8fHx8fHx8IgRCJYggBIVC+fPd8ZnymasWfiIEQiCIIASFIQQCQCAAQZABSA0AIABBBHZBeGohCQNAIAEgA2oiCkELaikDACACfSADQYiNAWopAwCFIgVC/////w+DIgYgCkEDaikDACACfCADQYCNAWopAwCFIgdCIIgiCH4iC0L/////D4MgBUIgiCIFIAdC/////w+DIgd+fCAGIAd+IgZCIIh8IgdCIIYgBkL/////D4OEIAtCIIggBSAIfnwgB0IgiHyFIAR8IQQgA0EQaiEDIAlBf2oiCQ0ACwsgASkDfyACfSAAQfiLAWopAwCFIgVC/////w+DIgYgASkDdyACfCAAQfCLAWopAwCFIgJCIIgiB34iCEL/////D4MgBUIgiCIFIAJC/////w+DIgJ+fCAGIAJ+IgJCIIh8IgZCIIYgAkL/////D4OEIAhCIIggBSAHfnwgBkIgiHyFIAR8IgJCJYggAoVC+fPd8ZnymasWfiICQiCIIAKFC98FAgF+AX8CQAJAQQApA4AKIgBQRQ0AQYAIIQFCACEADAELAkBBACkDoI4BIABSDQBBACEBDAELQQAhAUEAQq+v79e895Kg/gAgAH03A/iLAUEAIABCxZbr+djShYIofDcD8IsBQQBCj/Hjja2P9JhOIAB9NwPoiwFBACAAQqus+MXV79HQfHw3A+CLAUEAQtOt1LKShbW0nn8gAH03A9iLAUEAIABCl5r0jvWWvO3JAHw3A9CLAUEAQsWDgv2v/8SxayAAfTcDyIsBQQAgAELqi7OdyOb09UN8NwPAiwFBAELIv/rLnJveueQAIAB9NwO4iwFBACAAQoqjgd/Ume2sMXw3A7CLAUEAQvm57738+MKnHSAA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QQApA4CKATcDACACQQApA4iKATcDCCACQQApA5CKATcDECACQQApA5iKATcDGCACQQApA6CKATcDICACQQApA6iKATcDKCACQQApA7CKASIFNwMwIAJBACkDuIoBIgY3AzgCQAJAQQAoAoCOASIHQcAASQ0AIAJBACgCiI4BNgJAIAIgAkHAAGpBACgCmI4BQYCMASAHQX9qQQZ2IANBACgCnI4BIgAQAiADIABqIgBBeWopAwAhCCAAKQMJIQkgACkDGSEKIAApAykhCyAHQcCLAWopAwAhBSAAKQMBIQwgB0HIiwFqKQMAIQYgB0HQiwFqKQMAIQ0gACkDESEOIAdB2IsBaikDACEPIAdB4IsBaikDACEQIAApAyEhESAHQeiLAWopAwAhEiACKQMAIRMgAikDECEUIAIpAyAhFSACKQMwIRYgAikDCCEXIAIpAxghGCACKQMoIRkgAiACKQM4IAdB8IsBaikDACIafCAAKQMxIAdB+IsBaikDACIbhSIcQiCIIBxC/////w+Dfnw3AzggGSAQfCARIBKFIhFCIIggEUL/////D4N+fCERIBggDXwgDiAPhSIOQiCIIA5C/////w+DfnwhDiAXIAV8IAwgBoUiDEIgiCAMQv////8Pg358IQwgGyAWIAsgGoUiC0IgiCALQv////8Pg358fCELIBIgFSAKIBCFIhBCIIggEEL/////D4N+fHwhECAPIBQgCSANhSINQiCIIA1C/////w+Dfnx8IRIgBiATIAggBYUiBUIgiCAFQv////8Pg358fCEIDAELIAdBwI0BaiEdQcAAIAdrIR4gAkHAAGohAAJAAkACQCAHQThNDQAgHiEfDAELAkACQEE4IAdrQQN2QQFqQQdxIh8NACACQcAAaiEAIB4hHwwBCyACQcAAaiEAIB9BA3QiICEfA0AgACAdKQMANwMAIABBCGohACAdQQhqIR0gH0F4aiIfDQALQcAAIAcgIGprIR8LAkAgBw0AA0AgACAdKQMANwMAIABBCGogHUEIaikDADcDACAAQRBqIB1BEGopAwA3AwAgAEEYaiAdQRhqKQMANwMAIABBIGogHUEgaikDADcDACAAQShqIB1BKGopAwA3AwAgAEEwaiAdQTBqKQMANwMAIABBOGogHUE4aikDADcDACAAQcAAaiEAIB1BwABqIR0gH0FAaiIfQQdLDQALCyAfRQ0BCyAfQX9qISECQCAfQQdxIiBFDQAgH0F4cSEfA0AgACAdLQAAOgAAIABBAWohACAdQQFqIR0gIEF/aiIgDQALCyAhQQdJDQADQCAAIB0pAAA3AAAgAEEIaiEAIB1BCGohHSAfQXhqIh8NAAsLIAJBwABqIB5qIR1BgIwBIQACQAJAAkAgB0EISQ0AAkAgB0E4akEDdkEBakEHcSIfDQAMAgsgH0EDdCEgQYCMASEAA0AgHSAAKQMANwMAIB1BCGohHSAAQQhqIQAgH0F/aiIfDQALIAcgIGshBwsgB0UNAQJAAkAgB0EHcSIgDQAgByEfDAELIAdBeHEhHwNAIB0gAC0AADoAACAdQQFqIR0gAEEBaiEAICBBf2oiIA0ACwsgB0EISQ0BCwNAIB0gACkAADcAACAdQQhqIR0gAEEIaiEAIB9BeGoiHw0ACwsgA0EAKAKcjgFqIgBBeWopAwAhCiAAKQMJIRMgACkDGSEUIAApAykhCyAAKQMBIQwgACkDESEOIAApAyEhESACKQMAIRUgAikDECEWIAIpAyAhFyACKQMIIRggAikDQCENIAIpA0ghDyACKQMYIRkgAikDUCESIAIpA1ghCCACKQMoIRogAikDYCEQIAIpA2ghCSACIAYgAikDcCIbfCAAKQMxIAIpA3giBoUiHEIgiCAcQv////8Pg358NwM4IBogEHwgESAJhSIRQiCIIBFC/////w+DfnwhESAZIBJ8IA4gCIUiDkIgiCAOQv////8Pg358IQ4gGCANfCAMIA+FIgxCIIggDEL/////D4N+fCEMIAYgCyAbhSILQiCIIAtC/////w+DfiAFfHwhCyAJIBcgFCAQhSIFQiCIIAVC/////w+Dfnx8IRAgCCAWIBMgEoUiBUIgiCAFQv////8Pg358fCESIA8gFSAKIA2FIgVCIIggBUL/////D4N+fHwhCAsgAykDQyACKQM4hSIFQv////8PgyIGIAMpAzsgC4UiC0IgiCINfiIPQv////8PgyAFQiCIIgUgC0L/////D4MiC358IAYgC34iBkIgiHwiC0IghiAGQv////8Pg4QgD0IgiCAFIA1+fCALQiCIfIUgAykDMyARhSIFQv////8PgyIGIAMpAysgEIUiC0IgiCINfiIPQv////8PgyAFQiCIIgUgC0L/////D4MiC358IAYgC34iBkIgiHwiC0IghiAGQv////8Pg4QgD0IgiCAFIA1+fCALQiCIfIUgAykDIyAOhSIFQv////8PgyIGIAMpAxsgEoUiC0IgiCINfiIPQv////8PgyAFQiCIIgUgC0L/////D4MiC358IAYgC34iBkIgiHwiC0IghiAGQv////8Pg4QgD0IgiCAFIA1+fCALQiCIfIUgAykDEyAMhSIFQv////8PgyIGIAMpAwsgCIUiC0IgiCINfiIPQv////8PgyAFQiCIIgUgC0L/////D4MiC358IAYgC34iBkIgiHwiC0IghiAGQv////8Pg4QgD0IgiCAFIA1+fCALQiCIfIUgBEKHla+vmLbem55/fnx8fHwiBEIliCAEhUL5893xmfKZqxZ+IgRCIIggBIUhBAwBCyAEpyEAAkBBACkDoI4BIgRQDQACQCAAQRBLDQAgAEGACCAEEAUhBAwCCwJAIABBgAFLDQAgAEGACCAEEAYhBAwCCyAAQYAIIAQQByEEDAELAkAgAEEQSw0AIAAgA0IAEAUhBAwBCwJAIABBgAFLDQAgACADQgAQBiEEDAELIAAgA0IAEAchBAtBACAEQjiGIARCgP4Dg0IohoQgBEKAgPwHg0IYhiAEQoCAgPgPg0IIhoSEIARCCIhCgICA+A+DIARCGIhCgID8B4OEIARCKIhCgP4DgyAEQjiIhISENwOACiABJAALBgBBgIoBCwIACwvMAQEAQYAIC8QBuP5sOSOkS758AYEs9yGtHN7UbemDkJfbckCkpLezZx/LeeZOzMDleIJa0H3M/3IhuAhGdPdDJI7gNZDmgTomTDwoUruRwwDLiNBlixtTLqNxZEiXog35TjgZ70ap3qzYqPp2P+OcND/53LvHxwtPHYpR4EvNtFkxyJ9+ydl4c2TqxayDNNPrw8WBoP/6E2PrFw3dUbfw2knTFlUmKdRonisWvlh9R6H8j/i40XrQMc5FyzqPlRYEKK/X+8q7S0B+QAIAAA==",
		hash: "5a2fbdbb"
	};
	mutex$4 = new Mutex();
	wasmCache$4 = null;
	seedBuffer$1 = new Uint8Array(8);
	wasmJson$5 = {
		name: "xxhash128",
		data: "AGFzbQEAAAABKwdgAAF/YAR/f39/AGAHf39/f39/fwBgA39/fgF+YAR/f39+AGAAAGABfwADDQwAAQIDBAQEBQYFAAUFBAEBAgIGDgJ/AUHAjgULfwBBwAkLB3AIBm1lbW9yeQIADkhhc2hfR2V0QnVmZmVyAAAJSGFzaF9Jbml0AAcLSGFzaF9VcGRhdGUACApIYXNoX0ZpbmFsAAkNSGFzaF9HZXRTdGF0ZQAKDkhhc2hfQ2FsY3VsYXRlAAsKU1RBVEVfU0laRQMBCqBNDAUAQYAKC+QDAw9+AX8BfgJAIANFDQAgACkDMCEEIAApAzghBSAAKQMgIQYgACkDKCEHIAApAxAhCCAAKQMYIQkgACkDACEKIAApAwghCwNAIAUgAUEwaikDACIMfCACQThqKQMAIAFBOGopAwAiDYUiBUIgiCAFQv////8Pg358IQUgByABQSBqKQMAIg58IAJBKGopAwAgAUEoaikDACIPhSIHQiCIIAdC/////w+DfnwhByAJIAFBEGopAwAiEHwgAkEYaikDACABQRhqKQMAIhGFIglCIIggCUL/////D4N+fCEJIAsgASkDACISfCACQQhqIhMpAwAgAUEIaikDACIUhSILQiCIIAtC/////w+DfnwhCyACQTBqKQMAIAyFIgxCIIggDEL/////D4N+IAR8IA18IQQgAkEgaikDACAOhSIMQiCIIAxC/////w+DfiAGfCAPfCEGIAJBEGopAwAgEIUiDEIgiCAMQv////8Pg34gCHwgEXwhCCACKQMAIBKFIgxCIIggDEL/////D4N+IAp8IBR8IQogAUHAAGohASATIQIgA0F/aiIDDQALIAAgCTcDGCAAIAo3AwAgACALNwMIIAAgBzcDKCAAIAg3AxAgACAFNwM4IAAgBjcDICAAIAQ3AzALC94CAgF/AX4CQCAEIAIgASgCACIHayICSQ0AIAAgAyAFIAdBA3RqIAIQASAAIAUgBmoiBykDACAAKQMAIghCL4iFIAiFQrHz3fEJfjcDACAAIAcpAwggACkDCCIIQi+IhSAIhUKx893xCX43AwggACAHKQMQIAApAxAiCEIviIUgCIVCsfPd8Ql+NwMQIAAgBykDGCAAKQMYIghCL4iFIAiFQrHz3fEJfjcDGCAAIAcpAyAgACkDICIIQi+IhSAIhUKx893xCX43AyAgACAHKQMoIAApAygiCEIviIUgCIVCsfPd8Ql+NwMoIAAgBykDMCAAKQMwIghCL4iFIAiFQrHz3fEJfjcDMCAAIAcpAzggACkDOCIIQi+IhSAIhUKx893xCX43AzggACADIAJBBnRqIAUgBCACayIHEAEgASAHNgIADwsgACADIAUgB0EDdGogBBABIAEgByAEajYCAAvtAwEFfiABKQM4IAApAziFIgNC/////w+DIgQgASkDMCAAKQMwhSIFQiCIIgZ+IgdC/////w+DIANCIIgiAyAFQv////8PgyIFfnwgBCAFfiIEQiCIfCIFQiCGIARC/////w+DhCAHQiCIIAMgBn58IAVCIIh8hSABKQMoIAApAyiFIgNC/////w+DIgQgASkDICAAKQMghSIFQiCIIgZ+IgdC/////w+DIANCIIgiAyAFQv////8PgyIFfnwgBCAFfiIEQiCIfCIFQiCGIARC/////w+DhCAHQiCIIAMgBn58IAVCIIh8hSABKQMYIAApAxiFIgNC/////w+DIgQgASkDECAAKQMQhSIFQiCIIgZ+IgdC/////w+DIANCIIgiAyAFQv////8PgyIFfnwgBCAFfiIEQiCIfCIFQiCGIARC/////w+DhCAHQiCIIAMgBn58IAVCIIh8hSABKQMIIAApAwiFIgNC/////w+DIgQgASkDACAAKQMAhSIFQiCIIgZ+IgdC/////w+DIANCIIgiAyAFQv////8PgyIFfnwgBCAFfiIEQiCIfCIFQiCGIARC/////w+DhCAHQiCIIAMgBn58IAVCIIh8hSACfHx8fCICQiWIIAKFQvnz3fGZ8pmrFn4iAkIgiCAChQu6CAIFfgN/AkAgAUEJSQ0AIAAgAUH4iwFqKQMAIgQgAikDOCACKQMwhSADfIUiBUL/////D4NC95Svrwh+IAVCgICAgHCDfEEAKQOAjAEgAikDKCACKQMghSADfYUgBIUiA0IgiCIEQrHz3fEJfnwgBEKHla+vCH4iBEIgiHwgBEL/////D4MgA0L/////D4MiA0Kx893xCX58IANCh5Wvrwh+IgRCIIh8IgVCIIh8IgNCOIYgA0KA/gODQiiGhCADQoCA/AeDQhiGIANCgICA+A+DQgiGhIQgA0IIiEKAgID4D4MgA0IYiEKAgPwHg4QgA0IoiEKA/gODIANCOIiEhIQgBEL/////D4MgAUF/aq1CNoaEIAVCIIZ8hSIEQiCIIgVCz9bTvgJ+IgZC/////w+DIARC/////w+DIgRCvdzKlQx+fCAEQs/W074CfiIEQiCIfCIHQiCGIghCJYggCCAEQv////8Pg4SFQvnz3fGZ8pmrFn4iBEIgiCAEhTcDACAAIAVCvdzKlQx+IANCz9bTvtLHq9lCfnwgBkIgiHwgB0IgiHwiA0IliCADhUL5893xmfKZqxZ+IgNCIIggA4U3AwgPCwJAIAFBBEkNACAAIAIpAxggAikDEIUgA6ciAkEYdCACQYD+A3FBCHRyIAJBCHZBgP4DcSACQRh2cnKtQiCGIAOFfCABQfyLAWo1AgBCIIZBADUCgIwBhIUiA0IgiCIEIAFBAnRBh5Wvr3hqrSIFfiIGQiCIIARCsfPd8Ql+fCAGQv////8PgyADQv////8PgyIDQrHz3fEJfnwgAyAFfiIDQiCIfCIEQiCIfCAEQiCGIANC/////w+DhCIEQgGGfCIDQiWIIAOFQvnz3fGZ8pmrFn4iBUIgiCAFhTcDCCAAIANCA4ggBIUiA0IjiCADhUKlvuP00YyH2Z9/fiIDQhyIIAOFNwMADwsCQCABRQ0AIAAgAigCBCACKAIAc60gA3wiBEIhiEEALQCAjAFBEHQgAUEIdHIiCSABQQF2QYCMAWotAABBGHRyIgogAUH/iwFqLQAAIgFyIguthSAEhULP1tO+0ser2UJ+IgRCHYggBIVC+fPd8Zn2masWfiIEQiCIIASFNwMAIAAgAigCDCACKAIIc60gA30iA0IhiCABQRh0IAtBgP4DcUEIdHIgCUEIdkGA/gNxIApBGHZyckENd62FIAOFQs/W077Sx6vZQn4iA0IdiCADhUL5893xmfaZqxZ+IgNCIIggA4U3AwgPCyAAIAIpA1AgAikDWIUgA4UiBEIhiCAEhULP1tO+0ser2UJ+IgRCHYggBIVC+fPd8Zn2masWfiIEQiCIIASFNwMIIAAgAikDQCACKQNIhSADhSIDQiGIIAOFQs/W077Sx6vZQn4iA0IdiCADhUL5893xmfaZqxZ+IgNCIIggA4U3AwALwwoBCn4gAa0iBEKHla+vmLbem55/fiEFAkACQCABQSFPDQBCACEGDAELQgAhBwJAIAFBwQBJDQBCACEHAkAgAUHhAEkNACACQfgAaikDACADfSABQciLAWopAwAiCIUiB0L/////D4MiCSACKQNwIAN8IAFBwIsBaikDACIKhSILQiCIIgx+Ig1CIIggB0IgiCIHIAx+fCANQv////8PgyAHIAtC/////w+DIgt+fCAJIAt+IgdCIIh8IglCIIh8QQApA7iMASILQQApA7CMASIMfIUgCUIghiAHQv////8Pg4SFIQcgAkHoAGopAwAgA30gC4UiCUL/////D4MiCyACKQNgIAN8IAyFIgxCIIgiDX4iBkL/////D4MgCUIgiCIJIAxC/////w+DIgx+fCALIAx+IgtCIIh8IgxCIIYgC0L/////D4OEIAZCIIggCSANfnwgDEIgiHyFIAV8IAggCnyFIQULIAJB2ABqKQMAIAN9IAFB2IsBaikDACIIhSIJQv////8PgyIKIAIpA1AgA3wgAUHQiwFqKQMAIguFIgxCIIgiDX4iBkL/////D4MgCUIgiCIJIAxC/////w+DIgx+fCAKIAx+IgpCIIh8IgxCIIYgCkL/////D4OEIAZCIIggCSANfnwgDEIgiHyFIAd8QQApA6iMASIJQQApA6CMASIKfIUhByACQcgAaikDACADfSAJhSIJQv////8PgyIMIAIpA0AgA3wgCoUiCkIgiCINfiIGQv////8PgyAJQiCIIgkgCkL/////D4MiCn58IAwgCn4iCkIgiHwiDEIghiAKQv////8Pg4QgBkIgiCAJIA1+fCAMQiCIfIUgBXwgCCALfIUhBQsgAkE4aikDACADfSABQeiLAWopAwAiCIUiCUL/////D4MiCiACKQMwIAN8IAFB4IsBaikDACILhSIMQiCIIg1+IgZC/////w+DIAlCIIgiCSAMQv////8PgyIMfnwgCiAMfiIKQiCIfCIMQiCGIApC/////w+DhCAGQiCIIAkgDX58IAxCIIh8hSAHfEEAKQOYjAEiB0EAKQOQjAEiCXyFIQYgAkEoaikDACADfSAHhSIHQv////8PgyIKIAIpAyAgA3wgCYUiCUIgiCIMfiINQv////8PgyAHQiCIIgcgCUL/////D4MiCX58IAogCX4iCUIgiHwiCkIghiAJQv////8Pg4QgDUIgiCAHIAx+fCAKQiCIfIUgBXwgCCALfIUhBQsgACACQRhqKQMAIAN9IAFB+IsBaikDACIHhSIIQv////8PgyIJIAIpAxAgA3wgAUHwiwFqKQMAIgqFIgtCIIgiDH4iDUL/////D4MgCEIgiCIIIAtC/////w+DIgt+fCAJIAt+IglCIIh8IgtCIIYgCUL/////D4OEIA1CIIggCCAMfnwgC0IgiHyFIAZ8QQApA4iMASIIQQApA4CMASIJfIUiCyACQQhqKQMAIAN9IAiFIghC/////w+DIgwgAikDACADfCAJhSIJQiCIIg1+IgZC/////w+DIAhCIIgiCCAJQv////8PgyIJfnwgDCAJfiIJQiCIfCIMQiCGIAlC/////w+DhCAGQiCIIAggDX58IAxCIIh8hSAFfCAHIAp8hSIFfCIHQiWIIAeFQvnz3fGZ8pmrFn4iB0IgiCAHhTcDACAAQgAgBUKHla+vmLbem55/fiAEIAN9Qs/W077Sx6vZQn58IAtC49zKlfzO8vWFf358IgNCJYggA4VC+fPd8ZnymasWfiIDQiCIIAOFfTcDCAuhDwMBfxR+An9BACEEIAJB+ABqKQMAIAN9QQApA/iMASIFhSIGQv////8PgyIHIAIpA3AgA3xBACkD8IwBIgiFIglCIIgiCn4iC0L/////D4MgBkIgiCIGIAlC/////w+DIgl+fCAHIAl+IgdCIIh8IglCIIYgB0L/////D4OEIAtCIIggBiAKfnwgCUIgiHyFIAJB2ABqKQMAIAN9QQApA9iMASIHhSIGQv////8PgyIJIAIpA1AgA3xBACkD0IwBIgqFIgtCIIgiDH4iDUL/////D4MgBkIgiCIGIAtC/////w+DIgt+fCAJIAt+IglCIIh8IgtCIIYgCUL/////D4OEIA1CIIggBiAMfnwgC0IgiHyFIAJBOGopAwAgA31BACkDuIwBIgmFIgZC/////w+DIgsgAikDMCADfEEAKQOwjAEiDIUiDUIgiCIOfiIPQv////8PgyAGQiCIIgYgDUL/////D4MiDX58IAsgDX4iC0IgiHwiDUIghiALQv////8Pg4QgD0IgiCAGIA5+fCANQiCIfIUgAkEYaikDACADfUEAKQOYjAEiC4UiBkL/////D4MiDSACKQMQIAN8QQApA5CMASIOhSIPQiCIIhB+IhFC/////w+DIAZCIIgiBiAPQv////8PgyIPfnwgDSAPfiINQiCIfCIPQiCGIA1C/////w+DhCARQiCIIAYgEH58IA9CIIh8hUEAKQOIjAEiDUEAKQOAjAEiD3yFfEEAKQOojAEiEEEAKQOgjAEiEXyFfEEAKQPIjAEiEkEAKQPAjAEiE3yFfEEAKQPojAEiFEEAKQPgjAEiFXyFIgZCJYggBoVC+fPd8ZnymasWfiIGQiCIIAaFIQYgAkHoAGopAwAgA30gFIUiFEL/////D4MiFiACKQNgIAN8IBWFIhVCIIgiF34iGEL/////D4MgFEIgiCIUIBVC/////w+DIhV+fCAWIBV+IhVCIIh8IhZCIIYgFUL/////D4OEIBhCIIggFCAXfnwgFkIgiHyFIAJByABqKQMAIAN9IBKFIhJC/////w+DIhQgAikDQCADfCAThSITQiCIIhV+IhZC/////w+DIBJCIIgiEiATQv////8PgyITfnwgFCATfiITQiCIfCIUQiCGIBNC/////w+DhCAWQiCIIBIgFX58IBRCIIh8hSACQShqKQMAIAN9IBCFIhBC/////w+DIhIgAikDICADfCARhSIRQiCIIhN+IhRC/////w+DIBBCIIgiECARQv////8PgyIRfnwgEiARfiIRQiCIfCISQiCGIBFC/////w+DhCAUQiCIIBAgE358IBJCIIh8hSACQQhqKQMAIAN9IA2FIg1C/////w+DIhAgAikDACADfCAPhSIPQiCIIhF+IhJC/////w+DIA1CIIgiDSAPQv////8PgyIPfnwgECAPfiIPQiCIfCIQQiCGIA9C/////w+DhCASQiCIIA0gEX58IBBCIIh8hSABrSIPQoeVr6+Ytt6bnn9+fCALIA58hXwgCSAMfIV8IAcgCnyFfCAFIAh8hSIFQiWIIAWFQvnz3fGZ8pmrFn4iBUIgiCAFhSEFAkAgAUGgAUgNACABQQV2QXxqIRkDQCACIARqIhpBG2opAwAgA30gBEGYjQFqKQMAIgeFIghC/////w+DIgkgGkETaikDACADfCAEQZCNAWopAwAiCoUiC0IgiCIMfiINQv////8PgyAIQiCIIgggC0L/////D4MiC358IAkgC34iCUIgiHwiC0IghiAJQv////8Pg4QgDUIgiCAIIAx+fCALQiCIfIUgBnwgBEGIjQFqKQMAIgggBEGAjQFqKQMAIgl8hSEGIBpBC2opAwAgA30gCIUiCEL/////D4MiCyAaQQNqKQMAIAN8IAmFIglCIIgiDH4iDUL/////D4MgCEIgiCIIIAlC/////w+DIgl+fCALIAl+IglCIIh8IgtCIIYgCUL/////D4OEIA1CIIggCCAMfnwgC0IgiHyFIAV8IAcgCnyFIQUgBEEgaiEEIBlBf2oiGQ0ACwsgACACQf8AaikDACADfCABQeiLAWopAwAiB4UiCEL/////D4MiCSACKQN3IAN9IAFB4IsBaikDACIKhSILQiCIIgx+Ig1C/////w+DIAhCIIgiCCALQv////8PgyILfnwgCSALfiIJQiCIfCILQiCGIAlC/////w+DhCANQiCIIAggDH58IAtCIIh8hSAGfCABQfiLAWopAwAiBiABQfCLAWopAwAiCHyFIgkgAkHvAGopAwAgA3wgBoUiBkL/////D4MiCyACKQNnIAN9IAiFIghCIIgiDH4iDUL/////D4MgBkIgiCIGIAhC/////w+DIgh+fCALIAh+IghCIIh8IgtCIIYgCEL/////D4OEIA1CIIggBiAMfnwgC0IgiHyFIAV8IAcgCnyFIgZ8IgVCJYggBYVC+fPd8ZnymasWfiIFQiCIIAWFNwMAIABCACAGQoeVr6+Ytt6bnn9+IA8gA31Cz9bTvtLHq9lCfnwgCULj3MqV/M7y9YV/fnwiA0IliCADhUL5893xmfKZqxZ+IgNCIIggA4V9NwMIC98FAgF+AX8CQAJAQQApA4AKIgBQRQ0AQYAIIQFCACEADAELAkBBACkDoI4BIABSDQBBACEBDAELQQAhAUEAQq+v79e895Kg/gAgAH03A/iLAUEAIABCxZbr+djShYIofDcD8IsBQQBCj/Hjja2P9JhOIAB9NwPoiwFBACAAQqus+MXV79HQfHw3A+CLAUEAQtOt1LKShbW0nn8gAH03A9iLAUEAIABCl5r0jvWWvO3JAHw3A9CLAUEAQsWDgv2v/8SxayAAfTcDyIsBQQAgAELqi7OdyOb09UN8NwPAiwFBAELIv/rLnJveueQAIAB9NwO4iwFBACAAQoqjgd/Ume2sMXw3A7CLAUEAQvm57738+MKnHSAAfTcDqIsBQQAgAEKo9dv7s5ynmj98NwOgiwFBAEK4sry3lNW31lggAH03A5iLAUEAIABC8cihuqm0w/zOAHw3A5CLAUEAQoihl9u445SXo38gAH03A4iL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AkHAAGogDGohC0GAjAEhAAJAAkACQCAHQQhJDQACQCAHQThqQQN2QQFqQQdxIg0NAAwCCyANQQN0IQ5BgIwBIQADQCALIAApAwA3AwAgC0EIaiELIABBCGohACANQX9qIg0NAAsgByAOayEHCyAHRQ0BAkACQCAHQQdxIg4NACAHIQ0MAQsgB0F4cSENA0AgCyAALQAAOgAAIAtBAWohCyAAQQFqIQAgDkF/aiIODQALCyAHQQhJDQELA0AgCyAAKQAANwAAIAtBCGohCyAAQQhqIQAgDUF4aiINDQALCyACIAIpAwggAikDQCIIfCADQQAoApyOAWoiACkDASACKQNIIgmFIgpCIIggCkL/////D4N+fDcDCCACIAIpAxggAikDUCIKfCAAKQMRIAIpA1giEIUiEUIgiCARQv////8Pg358NwMYIAIgECAKIAApAwmFIgpCIIggCkL/////D4N+IAIpAxB8fDcDECACIAkgCCAAQXlqKQMAhSIIQiCIIAhC/////w+DfiACKQMAfHw3AwAgACkDGSEIIAIpAyAhCSACIAIpAyggAikDYCIKfCAAKQMhIAIpA2giEIUiEUIgiCARQv////8Pg358NwMoIAIgECAJIAggCoUiCEIgiCAIQv////8Pg358fDcDICACIAYgAikDcCIIfCAAKQMxIAIpA3giBoUiCUIgiCAJQv////8Pg358NwM4IAIgBiAIIAApAymFIghCIIggCEL/////D4N+IAV8fDcDMAsgAiACIANBC2ogBEKHla+vmLbem55/fhADNwNAIAIgAiADQQAoApyOAWpBdWogBELP1tO+0ser2UJ+Qn+FEAM3A0gMAQsgBKchAAJAQQApA6COASIEUA0AAkAgAEEQSw0AIAJBwABqIABBgAggBBAEDAILAkAgAEGAAUsNACACQcAAaiAAQYAIIAQQBQwCCyACQcAAaiAAQYAIIAQQBgwBCwJAIABBEEsNACACQcAAaiAAIANCABAEDAELAkAgAEGAAUsNACACQcAAaiAAIANCABAFDAELIAJBwABqIAAgA0IAEAYLQQAgAikDcDcDuApBACACKQNgNwOoCkEAIAIpA1A3A5gKQQAgAkH4AGopAwA3A8AKQQAgAkHoAGopAwA3A7AKQQAgAkHYAGopAwA3A6AKQQAgAikDSCIEQjiGIARCgP4Dg0IohoQgBEKAgPwHg0IYhiAEQoCAgPgPg0IIhoSEIARCCIhCgICA+A+DIARCGIhCgID8B4OEIARCKIhCgP4DgyAEQjiIhISEIgQ3A4AKQQAgBDcDkApBACACKQNAIgRCOIYgBEKA/gODQiiGhCAEQoCA/AeDQhiGIARCgICA+A+DQgiGhIQgBEIIiEKAgID4D4MgBEIYiEKAgPwHg4QgBEIoiEKA/gODIARCOIiEhIQ3A4gKIAEkAAsGAEGAigELAgALC8wBAQBBgAgLxAG4/mw5I6RLvnwBgSz3Ia0c3tRt6YOQl9tyQKSkt7NnH8t55k7MwOV4glrQfcz/ciG4CEZ090MkjuA1kOaBOiZMPChSu5HDAMuI0GWLG1Muo3FkSJeiDflOOBnvRqnerNio+nY/45w0P/ncu8fHC08dilHgS820WTHIn37J2XhzZOrFrIM00+vDxYGg//oTY+sXDd1Rt/DaSdMWVSYp1GieKxa+WH1HofyP+LjRetAxzkXLOo+VFgQor9f7yrtLQH5AAgAA",
		hash: "b9ab74e2"
	};
	mutex$3 = new Mutex();
	wasmCache$3 = null;
	seedBuffer = new Uint8Array(8);
	wasmJson$4 = {
		name: "ripemd160",
		data: "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",
		hash: "6abbce74"
	};
	mutex$2 = new Mutex();
	wasmCache$2 = null;
	validateOptions$2 = (options) => {
		if (!options || typeof options !== "object") throw new Error("Invalid options parameter. It requires an object.");
		if (!options.hashFunction || !options.hashFunction.then) throw new Error("Invalid hash function is provided! Usage: pbkdf2(\"password\", \"salt\", 1000, 32, createSHA1()).");
		if (!Number.isInteger(options.iterations) || options.iterations < 1) throw new Error("Iterations should be a positive number");
		if (!Number.isInteger(options.hashLength) || options.hashLength < 1) throw new Error("Hash length should be a positive number");
		if (options.outputType === void 0) options.outputType = "hex";
		if (!["hex", "binary"].includes(options.outputType)) throw new Error(`Insupported output type ${options.outputType}. Valid values: ['hex', 'binary']`);
	};
	wasmJson$3 = {
		name: "scrypt",
		data: "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cyICajYCOCAAIAAoAjwgAiAKakESdyAGc2o2AjwLvxIDFX8Bfg5/AkAgAkUNACAAQQd0IgNBQGoiBEEAKAKACCIFIAMgAmwiBmogAyABbGoiByADaiIIaiEJIAAgAkEHdCIKIAFBB3RqIgtsIQwgACALQYABamwhDSAAQQV0IgtBASALQQFLGyILQWBxIQ4gC0EBcSEPIAdBeGohECAHQXBqIREgB0FoaiESIAdBYGohEyAHQVhqIRQgB0FQaiEVIAdBSGohFiAHQUBqIRcgAa1Cf3whGCAEIAdqIRkgByAAQQh0IhpqIRsgACAKQYABamwhHCALQQRJIR1BACEeQQAhHwNAQQAoAoAIIiAgAyAfbGohIQJAIABFDQBBACEiAkAgHQ0AICAgHmohI0EAIQtBACEiA0AgByALaiIEICMgC2oiJCgCADYCACAEQQRqICRBBGooAgA2AgAgBEEIaiAkQQhqKAIANgIAIARBDGogJEEMaigCADYCACALQRBqIQsgDiAiQQRqIiJHDQALCyAPRQ0AIAcgIkECdCILaiAhIAtqKAIANgIACwJAIAFFDQBBACElIBwhIyAGISYDQCAFISQgACEiAkACQCAADQAgGyAXKQMANwMAIBsgFikDADcDCCAbIBUpAwA3AxAgGyAUKQMANwMYIBsgEykDADcDICAbIBIpAwA3AyggGyARKQMANwMwIBsgECkDADcDOAwBCwNAICQgJmoiCyAkIAxqIgQpAwA3AwAgC0EIaiAEQQhqKQMANwMAIAtBEGogBEEQaikDADcDACALQRhqIARBGGopAwA3AwAgC0EgaiAEQSBqKQMANwMAIAtBKGogBEEoaikDADcDACALQTBqIARBMGopAwA3AwAgC0E4aiAEQThqKQMANwMAIAtBwABqIARBwABqKQMANwMAIAtByABqIARByABqKQMANwMAIAtB0ABqIARB0ABqKQMANwMAIAtB2ABqIARB2ABqKQMANwMAIAtB4ABqIARB4ABqKQMANwMAIAtB6ABqIARB6ABqKQMANwMAIAtB8ABqIARB8ABqKQMANwMAIAtB+ABqIARB+ABqKQMANwMAICRBgAFqISQgIkF/aiIiDQALIAcgCCAbIAAQAiAFISQgACEiA0AgJCAjaiILICQgDWoiBCkDADcDACALQQhqIARBCGopAwA3AwAgC0EQaiAEQRBqKQMANwMAIAtBGGogBEEYaikDADcDACALQSBqIARBIGopAwA3AwAgC0EoaiAEQShqKQMANwMAIAtBMGogBEEwaikDADcDACALQThqIARBOGopAwA3AwAgC0HAAGogBEHAAGopAwA3AwAgC0HIAGogBEHIAGopAwA3AwAgC0HQAGogBEHQAGopAwA3AwAgC0HYAGogBEHYAGopAwA3AwAgC0HgAGogBEHgAGopAwA3AwAgC0HoAGogBEHoAGopAwA3AwAgC0HwAGogBEHwAGopAwA3AwAgC0H4AGogBEH4AGopAwA3AwAgJEGAAWohJCAiQX9qIiINAAsLIAggByAbIAAQAiAjIBpqISMgJiAaaiEmICVBAmoiJSABSQ0AC0EAISUDQAJAAkAgAA0AIBsgFykDADcDACAbIBYpAwA3AwggGyAVKQMANwMQIBsgFCkDADcDGCAbIBMpAwA3AyAgGyASKQMANwMoIBsgESkDADcDMCAbIBApAwA3AzgMAQsgACAKIBkpAgAgGIOnQQd0amwhJiAFISQgACEiA0AgJCAMaiILIAspAwAgJCAmaiIEKQMAhTcDACALQQhqIiMgIykDACAEQQhqKQMAhTcDACALQRBqIiMgIykDACAEQRBqKQMAhTcDACALQRhqIiMgIykDACAEQRhqKQMAhTcDACALQSBqIiMgIykDACAEQSBqKQMAhTcDACALQShqIiMgIykDACAEQShqKQMAhTcDACALQTBqIiMgIykDACAEQTBqKQMAhTcDACALQThqIiMgIykDACAEQThqKQMAhTcDACALQcAAaiIjICMpAwAgBEHAAGopAwCFNwMAIAtByABqIiMgIykDACAEQcgAaikDAIU3AwAgC0HQAGoiIyAjKQMAIARB0ABqKQMAhTcDACALQdgAaiIjICMpAwAgBEHYAGopAwCFNwMAIAtB4ABqIiMgIykDACAEQeAAaikDAIU3AwAgC0HoAGoiIyAjKQMAIARB6ABqKQMAhTcDACALQfAAaiIjICMpAwAgBEHwAGopAwCFNwMAIAtB+ABqIgsgCykDACAEQfgAaikDAIU3AwAgJEGAAWohJCAiQX9qIiINAAsgByAIIBsgABACIAAgCiAJKQIAIBiDp0EHdGpsISYgBSEkIAAhIgNAICQgDWoiCyALKQMAICQgJmoiBCkDAIU3AwAgC0EIaiIjICMpAwAgBEEIaikDAIU3AwAgC0EQaiIjICMpAwAgBEEQaikDAIU3AwAgC0EYaiIjICMpAwAgBEEYaikDAIU3AwAgC0EgaiIjICMpAwAgBEEgaikDAIU3AwAgC0EoaiIjICMpAwAgBEEoaikDAIU3AwAgC0EwaiIjICMpAwAgBEEwaikDAIU3AwAgC0E4aiIjICMpAwAgBEE4aikDAIU3AwAgC0HAAGoiIyAjKQMAIARBwABqKQMAhTcDACALQcgAaiIjICMpAwAgBEHIAGopAwCFNwMAIAtB0ABqIiMgIykDACAEQdAAaikDAIU3AwAgC0HYAGoiIyAjKQMAIARB2ABqKQMAhTcDACALQeAAaiIjICMpAwAgBEHgAGopAwCFNwMAIAtB6ABqIiMgIykDACAEQegAaikDAIU3AwAgC0HwAGoiIyAjKQMAIARB8ABqKQMAhTcDACALQfgAaiILIAspAwAgBEH4AGopAwCFNwMAICRBgAFqISQgIkF/aiIiDQALCyAIIAcgGyAAEAIgJUECaiIlIAFJDQALCwJAIABFDQBBACEiAkAgHQ0AICAgHmohI0EAIQtBACEiA0AgIyALaiIEIAcgC2oiJCgCADYCACAEQQRqICRBBGooAgA2AgAgBEEIaiAkQQhqKAIANgIAIARBDGogJEEMaigCADYCACALQRBqIQsgDiAiQQRqIiJHDQALCyAPRQ0AICEgIkECdCILaiAHIAtqKAIANgIACyAeIANqIR4gH0EBaiIfIAJHDQALCws=",
		hash: "b32721f8"
	};
	isPowerOfTwo = (v) => v && !(v & v - 1);
	validateOptions$1 = (options) => {
		if (!options || typeof options !== "object") throw new Error("Invalid options parameter. It requires an object.");
		if (!Number.isInteger(options.blockSize) || options.blockSize < 1) throw new Error("Block size should be a positive number");
		if (!Number.isInteger(options.costFactor) || options.costFactor < 2 || !isPowerOfTwo(options.costFactor)) throw new Error("Cost factor should be a power of 2, greater than 1");
		if (!Number.isInteger(options.parallelism) || options.parallelism < 1) throw new Error("Parallelism should be a positive number");
		if (!Number.isInteger(options.hashLength) || options.hashLength < 1) throw new Error("Hash length should be a positive number.");
		if (options.outputType === void 0) options.outputType = "hex";
		if (!["hex", "binary"].includes(options.outputType)) throw new Error(`Insupported output type ${options.outputType}. Valid values: ['hex', 'binary']`);
	};
	wasmJson$2 = {
		name: "bcrypt",
		data: "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",
		hash: "8bd8822d"
	};
	validateOptions = (options) => {
		if (!options || typeof options !== "object") throw new Error("Invalid options parameter. It requires an object.");
		if (!Number.isInteger(options.costFactor) || options.costFactor < 4 || options.costFactor > 31) throw new Error("Cost factor should be a number between 4 and 31");
		options.password = getUInt8Buffer(options.password);
		if (options.password.length < 1) throw new Error("Password should be at least 1 byte long");
		if (options.password.length > 72) throw new Error("Password should be at most 72 bytes long");
		options.salt = getUInt8Buffer(options.salt);
		if (options.salt.length !== 16) throw new Error("Salt should be 16 bytes long");
		if (options.outputType === void 0) options.outputType = "encoded";
		if (![
			"hex",
			"binary",
			"encoded"
		].includes(options.outputType)) throw new Error(`Insupported output type ${options.outputType}. Valid values: ['hex', 'binary', 'encoded']`);
	};
	validateHashCharacters = (hash) => {
		if (!/^\$2[axyb]\$[0-3][0-9]\$[./A-Za-z0-9]{53}$/.test(hash)) return false;
		if (hash[4] === "0" && Number(hash[5]) < 4) return false;
		if (hash[4] === "3" && Number(hash[5]) > 1) return false;
		return true;
	};
	validateVerifyOptions = (options) => {
		if (!options || typeof options !== "object") throw new Error("Invalid options parameter. It requires an object.");
		if (options.hash === void 0 || typeof options.hash !== "string") throw new Error("Hash should be specified");
		if (options.hash.length !== 60) throw new Error("Hash should be 60 bytes long");
		if (!validateHashCharacters(options.hash)) throw new Error("Invalid hash");
		options.password = getUInt8Buffer(options.password);
		if (options.password.length < 1) throw new Error("Password should be at least 1 byte long");
		if (options.password.length > 72) throw new Error("Password should be at most 72 bytes long");
	};
	wasmJson$1 = {
		name: "whirlpool",
		data: "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",
		hash: "8d8f6035"
	};
	mutex$1 = new Mutex();
	wasmCache$1 = null;
	wasmJson = {
		name: "sm3",
		data: "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",
		hash: "b6fb4b8e"
	};
	mutex = new Mutex();
	wasmCache = null;
});
//#endregion
//#region node_modules/@cosmjs/crypto/build/argon2.js
var require_argon2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Argon2id = void 0;
	exports.isArgon2idOptions = isArgon2idOptions;
	var utils_1 = require_build$5();
	var hash_wasm_1 = (init_index_esm(), __toCommonJS(index_esm_exports));
	function isArgon2idOptions(thing) {
		if (!(0, utils_1.isNonNullObject)(thing)) return false;
		if (typeof thing.outputLength !== "number") return false;
		if (typeof thing.opsLimit !== "number") return false;
		if (typeof thing.memLimitKib !== "number") return false;
		return true;
	}
	var Argon2id = class {
		static async execute(password, salt, options) {
			const opts = {
				password,
				salt,
				outputType: "binary",
				iterations: options.opsLimit,
				memorySize: options.memLimitKib,
				parallelism: 1,
				hashLength: options.outputLength
			};
			if (salt.length !== 16) throw new Error(`Got invalid salt length ${salt.length}. Must be 16.`);
			const hash = await (0, hash_wasm_1.argon2id)(opts);
			(0, utils_1.assert)(typeof hash !== "string");
			return hash;
		}
	};
	exports.Argon2id = Argon2id;
}));
//#endregion
//#region node_modules/@cosmjs/encoding/build/ascii.js
var require_ascii = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.toAscii = toAscii;
	exports.fromAscii = fromAscii;
	function toAscii(input) {
		const toNums = (str) => str.split("").map((x) => {
			const charCode = x.charCodeAt(0);
			if (charCode < 32 || charCode > 126) throw new Error(`Cannot encode character that is out of printable ASCII range: ${charCode}`);
			return charCode;
		});
		return Uint8Array.from(toNums(input));
	}
	function fromAscii(data) {
		const fromNums = (listOfNumbers) => listOfNumbers.map((x) => {
			if (x < 32 || x > 126) throw new Error(`Cannot decode character that is out of printable ASCII range: ${x}`);
			return String.fromCharCode(x);
		});
		return fromNums(Array.from(data)).join("");
	}
}));
//#endregion
//#region node_modules/base64-js/index.js
var require_base64_js = /* @__PURE__ */ __commonJSMin(((exports) => {
	exports.byteLength = byteLength;
	exports.toByteArray = toByteArray;
	exports.fromByteArray = fromByteArray;
	var lookup = [];
	var revLookup = [];
	var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
	var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	for (var i = 0, len = code.length; i < len; ++i) {
		lookup[i] = code[i];
		revLookup[code.charCodeAt(i)] = i;
	}
	revLookup["-".charCodeAt(0)] = 62;
	revLookup["_".charCodeAt(0)] = 63;
	function getLens(b64) {
		var len = b64.length;
		if (len % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
		var validLen = b64.indexOf("=");
		if (validLen === -1) validLen = len;
		var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
		return [validLen, placeHoldersLen];
	}
	function byteLength(b64) {
		var lens = getLens(b64);
		var validLen = lens[0];
		var placeHoldersLen = lens[1];
		return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
	}
	function _byteLength(b64, validLen, placeHoldersLen) {
		return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
	}
	function toByteArray(b64) {
		var tmp;
		var lens = getLens(b64);
		var validLen = lens[0];
		var placeHoldersLen = lens[1];
		var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
		var curByte = 0;
		var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
		var i;
		for (i = 0; i < len; i += 4) {
			tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
			arr[curByte++] = tmp >> 16 & 255;
			arr[curByte++] = tmp >> 8 & 255;
			arr[curByte++] = tmp & 255;
		}
		if (placeHoldersLen === 2) {
			tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
			arr[curByte++] = tmp & 255;
		}
		if (placeHoldersLen === 1) {
			tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
			arr[curByte++] = tmp >> 8 & 255;
			arr[curByte++] = tmp & 255;
		}
		return arr;
	}
	function tripletToBase64(num) {
		return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
	}
	function encodeChunk(uint8, start, end) {
		var tmp;
		var output = [];
		for (var i = start; i < end; i += 3) {
			tmp = (uint8[i] << 16 & 16711680) + (uint8[i + 1] << 8 & 65280) + (uint8[i + 2] & 255);
			output.push(tripletToBase64(tmp));
		}
		return output.join("");
	}
	function fromByteArray(uint8) {
		var tmp;
		var len = uint8.length;
		var extraBytes = len % 3;
		var parts = [];
		var maxChunkLength = 16383;
		for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
		if (extraBytes === 1) {
			tmp = uint8[len - 1];
			parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
		} else if (extraBytes === 2) {
			tmp = (uint8[len - 2] << 8) + uint8[len - 1];
			parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=");
		}
		return parts.join("");
	}
}));
//#endregion
//#region node_modules/@cosmjs/encoding/build/uint8array.js
var require_uint8array = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.fixUint8Array = fixUint8Array;
	function isUint8ArrayOfArrayBuffer(source) {
		return source.buffer instanceof ArrayBuffer;
	}
	/**
	* Safely converts a Uint8Array<T> or Uint8Array into a
	* Uint8Array<ArrayBuffer>, often without a copy at runtime.
	*
	* @see https://github.com/paulmillr/scure-base/issues/53
	*/
	function fixUint8Array(source) {
		if (isUint8ArrayOfArrayBuffer(source)) return source;
		const copy = new ArrayBuffer(source.byteLength);
		const out = new Uint8Array(copy);
		out.set(source);
		return out;
	}
}));
//#endregion
//#region node_modules/@cosmjs/encoding/build/base64.js
var require_base64 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || (function() {
		var ownKeys = function(o) {
			ownKeys = Object.getOwnPropertyNames || function(o) {
				var ar = [];
				for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
				return ar;
			};
			return ownKeys(o);
		};
		return function(mod) {
			if (mod && mod.__esModule) return mod;
			var result = {};
			if (mod != null) {
				for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
			}
			__setModuleDefault(result, mod);
			return result;
		};
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.toBase64 = toBase64;
	exports.fromBase64 = fromBase64;
	var base64js = __importStar(require_base64_js());
	var uint8array_1 = require_uint8array();
	function toBase64(data) {
		return base64js.fromByteArray(data);
	}
	function fromBase64(base64String) {
		if (!base64String.match(/^[a-zA-Z0-9+/]*={0,2}$/)) throw new Error("Invalid base64 string format");
		return (0, uint8array_1.fixUint8Array)(base64js.toByteArray(base64String));
	}
}));
//#endregion
//#region node_modules/@scure/base/index.js
var base_exports = /* @__PURE__ */ __exportAll({
	__TESTS: () => __TESTS,
	ascii: () => ascii,
	base16: () => base16,
	base32: () => base32,
	base32crockford: () => base32crockford,
	base32hex: () => base32hex,
	base32hexnopad: () => base32hexnopad,
	base32nopad: () => base32nopad,
	base58: () => base58,
	base58check: () => base58check,
	base58flickr: () => base58flickr,
	base58xmr: () => base58xmr,
	base58xrp: () => base58xrp,
	base64: () => base64,
	base64nopad: () => base64nopad,
	base64url: () => base64url,
	base64urlnopad: () => base64urlnopad,
	bech32: () => bech32,
	bech32m: () => bech32m,
	createBase58check: () => createBase58check,
	hex: () => hex,
	utf8: () => utf8
});
/*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function isBytes(a) {
	return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
}
/** Asserts something is Uint8Array. */
function abytes(b) {
	if (!isBytes(b)) throw new TypeError("Uint8Array expected");
}
function isArrayOf(isString, arr) {
	if (!Array.isArray(arr)) return false;
	if (arr.length === 0) return true;
	if (isString) return arr.every((item) => typeof item === "string");
	else return arr.every((item) => Number.isSafeInteger(item));
}
function afn(input) {
	if (typeof input !== "function") throw new TypeError("function expected");
	return true;
}
function astr(label, input) {
	if (typeof input !== "string") throw new TypeError(`${label}: string expected`);
	return true;
}
function anumber(n, title = "number") {
	if (typeof n !== "number") throw new TypeError(`${title}: expected number, got ${typeof n}`);
	if (!Number.isSafeInteger(n)) throw new RangeError(`${title}: expected safe integer, got ${n}`);
}
function anumArr(label, input) {
	if (!isArrayOf(false, input)) throw new TypeError(`${label}: array of numbers expected`);
}
function chain(...args) {
	const id = (a) => a;
	const wrap = (a, b) => (c) => a(b(c));
	return {
		encode: args.map((x) => x.encode).reduceRight(wrap, id),
		decode: args.map((x) => x.decode).reduce(wrap, id)
	};
}
function normalize(fn) {
	afn(fn);
	return {
		encode: (from) => from,
		decode: (to) => fn(to)
	};
}
function u8ToNumArr(u8, len = u8.length) {
	const res = new Array(len);
	for (let i = 0; i < len; i++) res[i] = u8[i];
	return res;
}
function charcodesToString(codes) {
	const len = codes.length;
	if (asciiDecoder !== void 0 && len >= 12) return asciiDecoder.decode(codes);
	if (len <= B2S_CHUNK) return String.fromCharCode.apply(null, codes);
	let res = "";
	for (let i = 0; i < len; i += B2S_CHUNK) res += String.fromCharCode.apply(null, codes.subarray(i, i + B2S_CHUNK));
	return res;
}
/**
* Linear 8 <-> bits regrouping (radix2Slow semantics), with Uint8Array digits and
* preallocated output.
*/
function radix2(bits) {
	anumber(bits);
	if (bits <= 0 || bits > 8) throw new RangeError("radix2: bits should be in (0..8]");
	const mask = powers[bits] - 1;
	return {
		encode: (bytes) => {
			abytes(bytes);
			const len = bytes.length;
			const res = new Uint8Array(Math.ceil(len * 8 / bits));
			let carry = 0;
			let pos = 0;
			let j = 0;
			for (let i = 0; i < len;) {
				if (i + 2 < len) {
					carry = carry << 24 | bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];
					pos += 24;
					i += 3;
				} else {
					carry = (carry << 8 | bytes[i]) & 65535;
					pos += 8;
					i++;
				}
				for (;;) {
					pos -= bits;
					res[j++] = carry >> pos & mask;
					if (pos < bits) break;
				}
			}
			if (pos > 0) res[j] = carry << bits - pos & mask;
			return res;
		},
		decode: (digits) => {
			const len = digits.length;
			const res = new Uint8Array(Math.floor(len * bits / 8));
			let carry = 0;
			let pos = 0;
			let j = 0;
			for (let i = 0; i < len; i++) {
				carry = (carry << bits | digits[i]) & 65535;
				pos += bits;
				for (; pos >= 8; pos -= 8) res[j++] = carry >> pos - 8 & 255;
			}
			carry = carry << 8 - pos & 255;
			if (pos >= bits) throw new Error("Excess padding");
			if (carry > 0) throw new Error(`Non-zero padding: ${carry}`);
			return res;
		}
	};
}
/**
* Digit <-> letter mapping fused with string join (chain(alphabetSlow(letters), join(''))
* semantics), via char-code lookup tables.
*/
function alphabet(letters, aliases) {
	const len = letters.length;
	if (len > 128) throw new Error("alphabet: max 128 letters");
	const encTable = new Uint8Array(len);
	const decTable = new Int8Array(128).fill(-1);
	for (let i = 0; i < len; i++) {
		const code = letters.charCodeAt(i);
		if (letters.codePointAt(i) !== code || code > 127) throw new Error("alphabet: single-char ASCII letters only");
		encTable[i] = code;
		decTable[code] = i;
	}
	if (aliases !== void 0) for (const alias of Object.keys(aliases)) {
		const code = alias.charCodeAt(0);
		const target = decTable[aliases[alias].charCodeAt(0)];
		if (alias.length !== 1 || code > 127 || target === void 0 || target === -1) throw new Error(`alphabet: invalid alias ${alias}`);
		decTable[code] = target;
	}
	return {
		encode: (digits) => {
			const codes = new Uint8Array(digits.length);
			for (let i = 0; i < digits.length; i++) {
				const d = digits[i];
				const code = encTable[d];
				if (code === void 0) throw new Error(`alphabet.encode: invalid digit ${d}`);
				codes[i] = code;
			}
			return charcodesToString(codes);
		},
		decode: (input) => {
			astr("decode", input);
			const slen = input.length;
			const digits = new Uint8Array(slen);
			for (let i = 0; i < slen; i++) {
				const code = input.charCodeAt(i);
				const digit = code < 128 ? decTable[code] : -1;
				if (digit === -1) throw new Error(`Unknown letter "${input[i]}". Allowed: ${letters}`);
				digits[i] = digit;
			}
			return digits;
		}
	};
}
/**
* Pad / unpad (paddingSlow semantics), on the joined string.
*/
function padding(bits, chr = "=") {
	anumber(bits);
	astr("padding", chr);
	return {
		encode(data) {
			while (data.length * bits % 8) data += chr;
			return data;
		},
		decode(input) {
			astr("decode", input);
			let end = input.length;
			if (end * bits % 8) throw new Error("padding: invalid length");
			for (; end > 0 && input[end - 1] === chr; end--) if ((end - 1) * bits % 8 === 0) throw new Error("padding: excess padding");
			return input.slice(0, end);
		}
	};
}
function unsafeWrapper(fn) {
	afn(fn);
	return function(...args) {
		try {
			return fn.apply(null, args);
		} catch (e) {}
	};
}
function checksum(len, fn) {
	anumber(len);
	if (len <= 0) throw new RangeError(`checksum length must be positive: ${len}`);
	afn(fn);
	const _fn = fn;
	return {
		encode(data) {
			abytes(data);
			const sum = _fn(data).slice(0, len);
			const res = new Uint8Array(data.length + len);
			res.set(data);
			res.set(sum, data.length);
			return res;
		},
		decode(data) {
			abytes(data);
			const payload = data.slice(0, -len);
			const oldChecksum = data.slice(-len);
			const newChecksum = _fn(payload).slice(0, len);
			for (let i = 0; i < len; i++) if (newChecksum[i] !== oldChecksum[i]) throw new Error("Invalid checksum");
			return payload;
		}
	};
}
function wordsToU8(words) {
	const len = words.length;
	const res = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		const w = words[i];
		if (w < 0 || w >= 32) throw new Error(`alphabet.encode: invalid digit ${w}`);
		res[i] = w;
	}
	return res;
}
function bech32Polymod(pre) {
	const b = pre >> 25;
	let chk = (pre & 33554431) << 5;
	for (let i = 0; i < POLYMOD_GENERATORS.length; i++) if ((b >> i & 1) === 1) chk ^= POLYMOD_GENERATORS[i];
	return chk;
}
function bechChecksum(prefix, words, encodingConst = 1) {
	const len = prefix.length;
	let chk = 1;
	for (let i = 0; i < len; i++) {
		const c = prefix.charCodeAt(i);
		if (c < 33 || c > 126) throw new Error(`Invalid prefix (${prefix})`);
		chk = bech32Polymod(chk) ^ c >> 5;
	}
	chk = bech32Polymod(chk);
	for (let i = 0; i < len; i++) chk = bech32Polymod(chk) ^ prefix.charCodeAt(i) & 31;
	for (let v of words) chk = bech32Polymod(chk) ^ v;
	for (let i = 0; i < 6; i++) chk = bech32Polymod(chk);
	chk ^= encodingConst;
	const sum = new Uint8Array(6);
	for (let i = 0; i < 6; i++) sum[i] = chk >>> 5 * (5 - i) & 31;
	return BECH_ALPHABET.encode(sum);
}
function genBech32(encoding) {
	const ENCODING_CONST = encoding === "bech32" ? 1 : 734539939;
	const _words = radix2(5);
	const toWords = (from) => {
		abytes(from);
		const len = from.length;
		const res = new Array(Math.ceil(len * 8 / 5));
		let carry = 0;
		let pos = 0;
		let j = 0;
		for (let i = 0; i < len; i++) {
			carry = carry << 8 | from[i];
			pos += 8;
			for (; pos >= 5; pos -= 5) res[j++] = carry >> pos - 5 & 31;
		}
		if (pos > 0) res[j] = carry << 5 - pos & 31;
		return res;
	};
	const fromWords = (to) => {
		anumArr("radix2.decode", to);
		const len = to.length;
		const digits = new Uint8Array(len);
		for (let i = 0; i < len; i++) {
			const w = to[i];
			if (w < 0 || w >= 32) throw new Error(`convertRadix2: invalid word=${w}`);
			digits[i] = w;
		}
		return _words.decode(digits);
	};
	const fromWordsUnsafe = unsafeWrapper(fromWords);
	function encode(prefix, words, limit = 90) {
		astr("bech32.encode prefix", prefix);
		if (limit !== false) anumber(limit, "limit");
		if (isBytes(words)) words = u8ToNumArr(words);
		anumArr("bech32.encode", words);
		const plen = prefix.length;
		if (plen === 0) throw new TypeError(`Invalid prefix length ${plen}`);
		const actualLength = plen + 7 + words.length;
		if (limit !== false && actualLength > limit) throw new TypeError(`Length ${actualLength} exceeds limit ${limit}`);
		const lowered = prefix.toLowerCase();
		const sum = bechChecksum(lowered, words, ENCODING_CONST);
		return `${lowered}1${BECH_ALPHABET.encode(wordsToU8(words))}${sum}`;
	}
	function decode(str, limit = 90) {
		astr("bech32.decode input", str);
		if (limit !== false) anumber(limit, "limit");
		const slen = str.length;
		if (slen < 8 || limit !== false && slen > limit) throw new TypeError(`invalid string length ${slen}, expected (8..${limit})`);
		const lowered = str.toLowerCase();
		if (str !== lowered && str !== str.toUpperCase()) throw new Error(`mixed-case string not allowed`);
		const sepIndex = lowered.lastIndexOf("1");
		if (sepIndex === 0 || sepIndex === -1) throw new Error(`invalid separator "1"`);
		const prefix = lowered.slice(0, sepIndex);
		const data = lowered.slice(sepIndex + 1);
		if (data.length < 6) throw new Error("invalid data length");
		const digits = BECH_ALPHABET.decode(data);
		const words = u8ToNumArr(digits, digits.length - 6);
		const sum = bechChecksum(prefix, words, ENCODING_CONST);
		if (!data.endsWith(sum)) throw new Error(`Invalid checksum in ${str}`);
		return {
			prefix,
			words
		};
	}
	const decodeUnsafe = unsafeWrapper(decode);
	function decodeToBytes(str) {
		const { prefix, words } = decode(str, false);
		return {
			prefix,
			words,
			bytes: fromWords(words)
		};
	}
	function encodeFromBytes(prefix, bytes) {
		return encode(prefix, toWords(bytes));
	}
	return {
		encode,
		decode,
		encodeFromBytes,
		decodeToBytes,
		decodeUnsafe,
		fromWords,
		fromWordsUnsafe,
		toWords
	};
}
var freeze, powers, asciiDecoder, B2S_CHUNK, base16, base32, base32nopad, base32hex, base32hexnopad, base32crockford, hasBase64Builtin, ASCII_WHITESPACE, decodeBase64Builtin, base64Fallback, base64, base64nopad, base64url, base64urlnopad, B58_GROUP, radix58, genBase58, base58, base58flickr, base58xrp, XMR_BLOCK_LEN, base58xmr, createBase58check, base58check, BECH_ALPHABET, POLYMOD_GENERATORS, bech32, bech32m, ascii, _isWellFormedShim, _isWellFormed, utf8err, utf8Fallback, utf8, __TESTS, hasHexBuiltin, hexBuiltin, hex;
var init_base = __esmMin(() => {
	freeze = (fn) => Object.freeze(fn());
	powers = /* @__PURE__ */ (() => {
		let res = [];
		for (let i = 0; i < 40; i++) res.push(2 ** i);
		return res;
	})();
	asciiDecoder = /* @__PURE__ */ (() => {
		try {
			const decoder = new TextDecoder();
			return decoder.decode(Uint8Array.of(65, 48, 43, 127)) === "A0+" ? decoder : void 0;
		} catch (e) {
			return;
		}
	})();
	B2S_CHUNK = 8192;
	base16 = /* @__PURE__ */ freeze(() => chain(radix2(4), alphabet("0123456789ABCDEF")));
	base32 = /* @__PURE__ */ freeze(() => chain(radix2(5), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"), padding(5)));
	base32nopad = /* @__PURE__ */ freeze(() => chain(radix2(5), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567")));
	base32hex = /* @__PURE__ */ freeze(() => chain(radix2(5), alphabet("0123456789ABCDEFGHIJKLMNOPQRSTUV"), padding(5)));
	base32hexnopad = /* @__PURE__ */ freeze(() => chain(radix2(5), alphabet("0123456789ABCDEFGHIJKLMNOPQRSTUV")));
	base32crockford = /* @__PURE__ */ freeze(() => chain(radix2(5), alphabet("0123456789ABCDEFGHJKMNPQRSTVWXYZ"), normalize((s) => {
		astr("base32crockford.decode", s);
		return s.toUpperCase().replace(/O/g, "0").replace(/[IL]/g, "1");
	})));
	hasBase64Builtin = typeof Uint8Array.from([]).toBase64 === "function" && typeof Uint8Array.fromBase64 === "function";
	ASCII_WHITESPACE = /[\t\n\f\r ]/;
	decodeBase64Builtin = (s, isUrl) => {
		astr("base64", s);
		const alphabet = isUrl ? "base64url" : "base64";
		if (s.length > 0 && ASCII_WHITESPACE.test(s)) throw new Error("invalid base64");
		return Uint8Array.fromBase64(s, {
			alphabet,
			lastChunkHandling: "strict"
		});
	};
	base64Fallback = /* @__PURE__ */ freeze(() => chain(radix2(6), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"), padding(6)));
	base64 = /* @__PURE__ */ freeze(() => hasBase64Builtin ? {
		encode(b) {
			abytes(b);
			return b.toBase64();
		},
		decode(s) {
			return decodeBase64Builtin(s, false);
		}
	} : base64Fallback);
	base64nopad = /* @__PURE__ */ freeze(() => chain(radix2(6), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/")));
	base64url = /* @__PURE__ */ freeze(() => hasBase64Builtin ? {
		encode(b) {
			abytes(b);
			return b.toBase64({ alphabet: "base64url" });
		},
		decode(s) {
			return decodeBase64Builtin(s, true);
		}
	} : chain(radix2(6), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"), padding(6)));
	base64urlnopad = /* @__PURE__ */ freeze(() => chain(radix2(6), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_")));
	B58_GROUP = 656356768;
	radix58 = {
		encode: (bytes) => {
			abytes(bytes);
			const blen = bytes.length;
			if (blen === 0) return new Uint8Array(0);
			let zeros = 0;
			while (zeros < blen - 1 && bytes[zeros] === 0) zeros++;
			const nlimbs = Math.ceil(blen / 2);
			const limbs = new Uint16Array(nlimbs);
			const odd = blen & 1;
			if (odd) limbs[0] = bytes[0];
			for (let i = odd, j = odd; i < blen; i += 2, j++) limbs[j] = bytes[i] << 8 | bytes[i + 1];
			const groups = [];
			let pos = 0;
			while (pos < nlimbs) {
				let carry = 0;
				for (let i = pos; i < nlimbs; i++) {
					const cur = carry * 65536 + limbs[i];
					const q = Math.floor(cur / B58_GROUP);
					carry = cur - q * B58_GROUP;
					limbs[i] = q;
					if (q === 0 && i === pos) pos++;
				}
				groups.push(carry);
			}
			const top = groups.length - 1;
			let sig = top * 5;
			for (let v = groups[top];; v = Math.floor(v / 58)) {
				sig++;
				if (v < 58) break;
			}
			const res = new Uint8Array(zeros + sig);
			let j = res.length - 1;
			for (let g = 0; g < top; g++) {
				let v = groups[g];
				for (let k = 0; k < 5; k++) {
					res[j--] = v % 58;
					v = Math.floor(v / 58);
				}
			}
			for (let v = groups[top]; j >= zeros; v = Math.floor(v / 58)) res[j--] = v % 58;
			return res;
		},
		decode: (digits) => {
			abytes(digits);
			const dlen = digits.length;
			if (dlen === 0) return new Uint8Array(0);
			if (dlen >= 65536) throw new Error("invalid length");
			let zeros = 0;
			while (zeros < dlen - 1 && digits[zeros] === 0) zeros++;
			const limbs = new Uint16Array(Math.ceil(dlen * 6 / 16) + 1);
			let used = 0;
			let i = 0;
			let group = dlen % 5 || 5;
			while (i < dlen) {
				let gval = 0;
				let factor = 1;
				for (const end = i + group; i < end; i++) {
					const d = digits[i];
					if (d >= 58) throw new Error(`invalid integer: ${d}`);
					gval = gval * 58 + d;
					factor *= 58;
				}
				group = 5;
				let carry = gval;
				for (let k = 0; k < used; k++) {
					const cur = limbs[k] * factor + carry;
					carry = Math.floor(cur / 65536);
					limbs[k] = cur - carry * 65536;
				}
				for (; carry > 0; carry = Math.floor(carry / 65536)) limbs[used++] = carry % 65536;
			}
			const valueBytes = used === 0 ? 1 : used * 2 - (limbs[used - 1] < 256 ? 1 : 0);
			const res = new Uint8Array(zeros + valueBytes);
			let j = res.length - 1;
			for (let k = 0; k < used; k++) {
				const limb = limbs[k];
				res[j--] = limb & 255;
				if (j >= zeros) res[j--] = limb >> 8;
			}
			return res;
		}
	};
	genBase58 = (abc) => chain(radix58, alphabet(abc));
	base58 = /* @__PURE__ */ freeze(() => genBase58("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"));
	base58flickr = /* @__PURE__ */ freeze(() => genBase58("123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"));
	base58xrp = /* @__PURE__ */ freeze(() => genBase58("rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz"));
	XMR_BLOCK_LEN = [
		0,
		2,
		3,
		5,
		6,
		7,
		9,
		10,
		11
	];
	base58xmr = /* @__PURE__ */ freeze(() => ({
		encode(data) {
			abytes(data);
			let res = "";
			for (let i = 0; i < data.length; i += 8) {
				const block = data.subarray(i, i + 8);
				res += base58.encode(block).padStart(XMR_BLOCK_LEN[block.length], "1");
			}
			return res;
		},
		decode(str) {
			astr("base58xmr.decode", str);
			const strLen = str.length;
			const tailChars = strLen % 11;
			const tailBytes = tailChars === 0 ? 0 : XMR_BLOCK_LEN.indexOf(tailChars);
			if (tailBytes === -1) throw new Error(`base58xmr: invalid block length ${tailChars}`);
			const res = new Uint8Array(Math.floor(strLen / 11) * 8 + tailBytes);
			let w = 0;
			for (let i = 0; i < strLen; i += 11) {
				const slice = str.slice(i, i + 11);
				const blockLen = slice.length === 11 ? 8 : tailBytes;
				const block = base58.decode(slice);
				for (let j = 0; j < block.length - blockLen; j++) if (block[j] !== 0) throw new Error("base58xmr: wrong padding");
				for (let j = block.length - blockLen; j < block.length; j++) res[w++] = block[j];
			}
			return res;
		}
	}));
	createBase58check = (sha256) => {
		afn(sha256);
		const _sha256 = sha256;
		return chain(checksum(4, (data) => _sha256(_sha256(data))), base58);
	};
	base58check = createBase58check;
	BECH_ALPHABET = /* @__PURE__ */ alphabet("qpzry9x8gf2tvdw0s3jn54khce6mua7l");
	POLYMOD_GENERATORS = [
		996825010,
		642813549,
		513874426,
		1027748829,
		705979059
	];
	bech32 = /* @__PURE__ */ freeze(() => genBech32("bech32"));
	bech32m = /* @__PURE__ */ freeze(() => genBech32("bech32m"));
	ascii = /* @__PURE__ */ freeze(() => ({
		encode(data) {
			abytes(data);
			for (let i = 0; i < data.length; i++) {
				const byte = data[i];
				if (byte > 127) throw new RangeError(`non-ASCII byte ${byte} at ${i}`);
			}
			return charcodesToString(data);
		},
		decode(str) {
			if (typeof str !== "string") throw new TypeError("ascii string expected, got " + typeof str);
			const res = new Uint8Array(str.length);
			for (let i = 0; i < str.length; i++) {
				const charCode = str.charCodeAt(i);
				if (charCode > 127) throw new RangeError(`non-ASCII char "${str[i]}" (${charCode}) at ${i}`);
				res[i] = charCode;
			}
			return res;
		}
	}));
	_isWellFormedShim = (str) => {
		try {
			return encodeURI(str) !== null;
		} catch {
			return false;
		}
	};
	_isWellFormed = typeof "".isWellFormed === "function" ? (str) => str.isWellFormed() : _isWellFormedShim;
	utf8err = (i) => /* @__PURE__ */ new TypeError(`invalid utf8 at byte ${i}`);
	utf8Fallback = /* @__PURE__ */ freeze(() => ({
		encode(data) {
			abytes(data);
			let res = "";
			for (let i = 0; i < data.length;) {
				const a = data[i++];
				if (a < 128) {
					res += String.fromCharCode(a);
					continue;
				}
				if (a < 194 || i >= data.length) throw utf8err(i - 1);
				const b = data[i++];
				if ((b & 192) !== 128) throw utf8err(i - 1);
				let cp = (a & 31) << 6 | b & 63;
				if (a >= 224) {
					if (i >= data.length) throw utf8err(i - 1);
					const c = data[i++];
					if ((c & 192) !== 128 || a === 224 && b < 160 || a === 237 && b >= 160) throw utf8err(i - 1);
					cp = (a & 15) << 12 | (b & 63) << 6 | c & 63;
					if (a >= 240) {
						if (i >= data.length) throw utf8err(i - 1);
						const d = data[i++];
						if (a > 244 || (d & 192) !== 128 || a === 240 && b < 144 || a === 244 && b >= 144) throw utf8err(i - 1);
						cp = (a & 7) << 18 | (b & 63) << 12 | (c & 63) << 6 | d & 63;
					}
				}
				if (cp < 65536) res += String.fromCharCode(cp);
				else {
					cp -= 65536;
					res += String.fromCharCode((cp >> 10) + 55296, (cp & 1023) + 56320);
				}
			}
			return res;
		},
		decode(str) {
			astr("utf8", str);
			if (!_isWellFormed(str)) throw new TypeError("utf8 expected well-formed string");
			const res = new Uint8Array(str.length * 3);
			let pos = 0;
			for (let i = 0; i < str.length; i++) {
				let c = str.charCodeAt(i);
				if (c < 128) {
					res[pos++] = c;
					continue;
				}
				if (c >= 55296 && c <= 57343) {
					const d = str.charCodeAt(++i);
					c = 65536 + (c - 55296 << 10) + d - 56320;
				}
				if (c >= 65536) {
					res[pos++] = c >> 18 | 240;
					res[pos++] = c >> 12 & 63 | 128;
				} else if (c >= 2048) res[pos++] = c >> 12 | 224;
				else res[pos++] = c >> 6 | 192;
				if (c >= 2048) res[pos++] = c >> 6 & 63 | 128;
				res[pos++] = c & 63 | 128;
			}
			return res.subarray(0, pos);
		}
	}));
	utf8 = /* @__PURE__ */ freeze(() => {
		let _utf8Encoder;
		let _utf8Decoder;
		const utf8Builtin = {
			encode(data) {
				abytes(data);
				return (_utf8Decoder || (_utf8Decoder = new TextDecoder("utf-8", {
					ignoreBOM: true,
					fatal: true
				}))).decode(data);
			},
			decode(str) {
				astr("utf8", str);
				if (!_isWellFormed(str)) throw new TypeError("utf8 expected well-formed string");
				return (_utf8Encoder || (_utf8Encoder = new TextEncoder())).encode(str);
			}
		};
		return {
			encode: typeof TextDecoder === "function" ? utf8Builtin.encode : utf8Fallback.encode,
			decode: typeof TextEncoder === "function" ? utf8Builtin.decode : utf8Fallback.decode
		};
	});
	__TESTS = /* @__PURE__ */ freeze(() => ({
		alphabet,
		base64Fallback,
		radix2,
		radix58,
		checksum,
		utf8Fallback,
		_isWellFormedShim
	}));
	hasHexBuiltin = typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function";
	hexBuiltin = {
		encode(data) {
			abytes(data);
			return data.toHex();
		},
		decode(s) {
			astr("hex", s);
			return Uint8Array.fromHex(s);
		}
	};
	hex = /* @__PURE__ */ freeze(() => hasHexBuiltin ? hexBuiltin : chain(radix2(4), alphabet("0123456789abcdef", {
		A: "a",
		B: "b",
		C: "c",
		D: "d",
		E: "e",
		F: "f"
	}), normalize((s) => {
		astr("hex", s);
		if (s.length % 2 !== 0) throw new TypeError(`hex.decode: odd-length string (${s.length})`);
		return s;
	})));
});
//#endregion
//#region node_modules/@cosmjs/encoding/build/bech32.js
var require_bech32 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.toBech32 = toBech32;
	exports.fromBech32 = fromBech32;
	exports.normalizeBech32 = normalizeBech32;
	var base_1 = (init_base(), __toCommonJS(base_exports));
	var uint8array_1 = require_uint8array();
	function toBech32(prefix, data, limit) {
		return base_1.bech32.encode(prefix, base_1.bech32.toWords(data), limit);
	}
	function hasBech32Separator(input) {
		return input.indexOf("1") !== -1;
	}
	function fromBech32(address, limit = Infinity) {
		if (!hasBech32Separator(address)) throw new Error(`No bech32 separator found`);
		const decodedAddress = base_1.bech32.decode(address, limit);
		return {
			prefix: decodedAddress.prefix,
			data: (0, uint8array_1.fixUint8Array)(base_1.bech32.fromWords(decodedAddress.words))
		};
	}
	/**
	* Takes a bech32 address and returns a normalized (i.e. lower case) representation of it.
	*
	* The input is validated along the way, which makes this significantly safer than
	* using `address.toLowerCase()`.
	*/
	function normalizeBech32(address) {
		const { prefix, data } = fromBech32(address);
		return toBech32(prefix, data);
	}
}));
//#endregion
//#region node_modules/@cosmjs/encoding/build/hex.js
var require_hex = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.toHex = toHex;
	exports.fromHex = fromHex;
	function toHex(data) {
		let out = "";
		for (const byte of data) out += ("0" + byte.toString(16)).slice(-2);
		return out;
	}
	function fromHex(hexstring) {
		if (hexstring.length % 2 !== 0) throw new Error("hex string length must be a multiple of 2");
		const out = new Uint8Array(hexstring.length / 2);
		for (let i = 0; i < out.length; i++) {
			const j = 2 * i;
			const hexByteAsString = hexstring.slice(j, j + 2);
			if (!hexByteAsString.match(/[0-9a-f]{2}/i)) throw new Error("hex string contains invalid characters");
			out[i] = parseInt(hexByteAsString, 16);
		}
		return out;
	}
}));
//#endregion
//#region node_modules/@cosmjs/encoding/build/rfc3339.js
var require_rfc3339 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.fromRfc3339 = fromRfc3339;
	exports.toRfc3339 = toRfc3339;
	var rfc3339Matcher = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(\.\d{1,9})?((?:[+-]\d{2}:\d{2})|Z)$/;
	function padded(integer, length = 2) {
		return integer.toString().padStart(length, "0");
	}
	function fromRfc3339(str) {
		const matches = rfc3339Matcher.exec(str);
		if (!matches) throw new Error("Date string is not in RFC3339 format");
		const year = +matches[1];
		const month = +matches[2];
		const day = +matches[3];
		const hour = +matches[4];
		const minute = +matches[5];
		const second = +matches[6];
		const milliSeconds = matches[7] ? Math.floor(+matches[7] * 1e3) : 0;
		let tzOffsetSign;
		let tzOffsetHours;
		let tzOffsetMinutes;
		if (matches[8] === "Z") {
			tzOffsetSign = 1;
			tzOffsetHours = 0;
			tzOffsetMinutes = 0;
		} else {
			tzOffsetSign = matches[8].substring(0, 1) === "-" ? -1 : 1;
			tzOffsetHours = +matches[8].substring(1, 3);
			tzOffsetMinutes = +matches[8].substring(4, 6);
		}
		const tzOffset = tzOffsetSign * (tzOffsetHours * 60 + tzOffsetMinutes) * 60;
		const date = /* @__PURE__ */ new Date();
		date.setUTCFullYear(year, month - 1, day);
		date.setUTCHours(hour, minute, second, milliSeconds);
		return /* @__PURE__ */ new Date(date.getTime() - tzOffset * 1e3);
	}
	function toRfc3339(date) {
		return `${date.getUTCFullYear()}-${padded(date.getUTCMonth() + 1)}-${padded(date.getUTCDate())}T${padded(date.getUTCHours())}:${padded(date.getUTCMinutes())}:${padded(date.getUTCSeconds())}.${padded(date.getUTCMilliseconds(), 3)}Z`;
	}
}));
//#endregion
//#region node_modules/@cosmjs/encoding/build/utf8.js
var require_utf8 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.toUtf8 = toUtf8;
	exports.fromUtf8 = fromUtf8;
	var uint8array_1 = require_uint8array();
	function toUtf8(str) {
		return (0, uint8array_1.fixUint8Array)(new TextEncoder().encode(str));
	}
	/**
	* Takes UTF-8 data and decodes it to a string.
	*
	* In lossy mode, the [REPLACEMENT CHARACTER](https://en.wikipedia.org/wiki/Specials_(Unicode_block))
	* is used to substitute invalid encodings.
	* By default lossy mode is off and invalid data will lead to exceptions.
	*/
	function fromUtf8(data, lossy = false) {
		return new TextDecoder("utf-8", { fatal: !lossy }).decode(data);
	}
}));
//#endregion
//#region node_modules/@cosmjs/encoding/build/index.js
var require_build$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.toUtf8 = exports.fromUtf8 = exports.fixUint8Array = exports.toRfc3339 = exports.fromRfc3339 = exports.toHex = exports.fromHex = exports.toBech32 = exports.normalizeBech32 = exports.fromBech32 = exports.toBase64 = exports.fromBase64 = exports.toAscii = exports.fromAscii = void 0;
	var ascii_1 = require_ascii();
	Object.defineProperty(exports, "fromAscii", {
		enumerable: true,
		get: function() {
			return ascii_1.fromAscii;
		}
	});
	Object.defineProperty(exports, "toAscii", {
		enumerable: true,
		get: function() {
			return ascii_1.toAscii;
		}
	});
	var base64_1 = require_base64();
	Object.defineProperty(exports, "fromBase64", {
		enumerable: true,
		get: function() {
			return base64_1.fromBase64;
		}
	});
	Object.defineProperty(exports, "toBase64", {
		enumerable: true,
		get: function() {
			return base64_1.toBase64;
		}
	});
	var bech32_1 = require_bech32();
	Object.defineProperty(exports, "fromBech32", {
		enumerable: true,
		get: function() {
			return bech32_1.fromBech32;
		}
	});
	Object.defineProperty(exports, "normalizeBech32", {
		enumerable: true,
		get: function() {
			return bech32_1.normalizeBech32;
		}
	});
	Object.defineProperty(exports, "toBech32", {
		enumerable: true,
		get: function() {
			return bech32_1.toBech32;
		}
	});
	var hex_1 = require_hex();
	Object.defineProperty(exports, "fromHex", {
		enumerable: true,
		get: function() {
			return hex_1.fromHex;
		}
	});
	Object.defineProperty(exports, "toHex", {
		enumerable: true,
		get: function() {
			return hex_1.toHex;
		}
	});
	var rfc3339_1 = require_rfc3339();
	Object.defineProperty(exports, "fromRfc3339", {
		enumerable: true,
		get: function() {
			return rfc3339_1.fromRfc3339;
		}
	});
	Object.defineProperty(exports, "toRfc3339", {
		enumerable: true,
		get: function() {
			return rfc3339_1.toRfc3339;
		}
	});
	var uint8array_1 = require_uint8array();
	Object.defineProperty(exports, "fixUint8Array", {
		enumerable: true,
		get: function() {
			return uint8array_1.fixUint8Array;
		}
	});
	var utf8_1 = require_utf8();
	Object.defineProperty(exports, "fromUtf8", {
		enumerable: true,
		get: function() {
			return utf8_1.fromUtf8;
		}
	});
	Object.defineProperty(exports, "toUtf8", {
		enumerable: true,
		get: function() {
			return utf8_1.toUtf8;
		}
	});
}));
//#endregion
//#region node_modules/@noble/hashes/crypto.js
var require_crypto = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.crypto = void 0;
	exports.crypto = typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
}));
//#endregion
//#region node_modules/@noble/hashes/utils.js
var require_utils$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Utilities for hex, bytes, CSPRNG.
	* @module
	*/
	/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.wrapXOFConstructorWithOpts = exports.wrapConstructorWithOpts = exports.wrapConstructor = exports.Hash = exports.nextTick = exports.swap32IfBE = exports.byteSwapIfBE = exports.swap8IfBE = exports.isLE = void 0;
	exports.isBytes = isBytes;
	exports.anumber = anumber;
	exports.abytes = abytes;
	exports.ahash = ahash;
	exports.aexists = aexists;
	exports.aoutput = aoutput;
	exports.u8 = u8;
	exports.u32 = u32;
	exports.clean = clean;
	exports.createView = createView;
	exports.rotr = rotr;
	exports.rotl = rotl;
	exports.byteSwap = byteSwap;
	exports.byteSwap32 = byteSwap32;
	exports.bytesToHex = bytesToHex;
	exports.hexToBytes = hexToBytes;
	exports.asyncLoop = asyncLoop;
	exports.utf8ToBytes = utf8ToBytes;
	exports.bytesToUtf8 = bytesToUtf8;
	exports.toBytes = toBytes;
	exports.kdfInputToBytes = kdfInputToBytes;
	exports.concatBytes = concatBytes;
	exports.checkOpts = checkOpts;
	exports.createHasher = createHasher;
	exports.createOptHasher = createOptHasher;
	exports.createXOFer = createXOFer;
	exports.randomBytes = randomBytes;
	var crypto_1 = require_crypto();
	/** Checks if something is Uint8Array. Be careful: nodejs Buffer will return true. */
	function isBytes(a) {
		return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
	}
	/** Asserts something is positive integer. */
	function anumber(n) {
		if (!Number.isSafeInteger(n) || n < 0) throw new Error("positive integer expected, got " + n);
	}
	/** Asserts something is Uint8Array. */
	function abytes(b, ...lengths) {
		if (!isBytes(b)) throw new Error("Uint8Array expected");
		if (lengths.length > 0 && !lengths.includes(b.length)) throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
	}
	/** Asserts something is hash */
	function ahash(h) {
		if (typeof h !== "function" || typeof h.create !== "function") throw new Error("Hash should be wrapped by utils.createHasher");
		anumber(h.outputLen);
		anumber(h.blockLen);
	}
	/** Asserts a hash instance has not been destroyed / finished */
	function aexists(instance, checkFinished = true) {
		if (instance.destroyed) throw new Error("Hash instance has been destroyed");
		if (checkFinished && instance.finished) throw new Error("Hash#digest() has already been called");
	}
	/** Asserts output is properly-sized byte array */
	function aoutput(out, instance) {
		abytes(out);
		const min = instance.outputLen;
		if (out.length < min) throw new Error("digestInto() expects output buffer of length at least " + min);
	}
	/** Cast u8 / u16 / u32 to u8. */
	function u8(arr) {
		return new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
	}
	/** Cast u8 / u16 / u32 to u32. */
	function u32(arr) {
		return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
	}
	/** Zeroize a byte array. Warning: JS provides no guarantees. */
	function clean(...arrays) {
		for (let i = 0; i < arrays.length; i++) arrays[i].fill(0);
	}
	/** Create DataView of an array for easy byte-level manipulation. */
	function createView(arr) {
		return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
	}
	/** The rotate right (circular right shift) operation for uint32 */
	function rotr(word, shift) {
		return word << 32 - shift | word >>> shift;
	}
	/** The rotate left (circular left shift) operation for uint32 */
	function rotl(word, shift) {
		return word << shift | word >>> 32 - shift >>> 0;
	}
	/** Is current platform little-endian? Most are. Big-Endian platform: IBM */
	exports.isLE = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
	/** The byte swap operation for uint32 */
	function byteSwap(word) {
		return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
	}
	/** Conditionally byte swap if on a big-endian platform */
	exports.swap8IfBE = exports.isLE ? (n) => n : (n) => byteSwap(n);
	/** @deprecated */
	exports.byteSwapIfBE = exports.swap8IfBE;
	/** In place byte swap for Uint32Array */
	function byteSwap32(arr) {
		for (let i = 0; i < arr.length; i++) arr[i] = byteSwap(arr[i]);
		return arr;
	}
	exports.swap32IfBE = exports.isLE ? (u) => u : byteSwap32;
	var hasHexBuiltin = typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function";
	var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
	/**
	* Convert byte array to hex string. Uses built-in function, when available.
	* @example bytesToHex(Uint8Array.from([0xca, 0xfe, 0x01, 0x23])) // 'cafe0123'
	*/
	function bytesToHex(bytes) {
		abytes(bytes);
		if (hasHexBuiltin) return bytes.toHex();
		let hex = "";
		for (let i = 0; i < bytes.length; i++) hex += hexes[bytes[i]];
		return hex;
	}
	var asciis = {
		_0: 48,
		_9: 57,
		A: 65,
		F: 70,
		a: 97,
		f: 102
	};
	function asciiToBase16(ch) {
		if (ch >= asciis._0 && ch <= asciis._9) return ch - asciis._0;
		if (ch >= asciis.A && ch <= asciis.F) return ch - (asciis.A - 10);
		if (ch >= asciis.a && ch <= asciis.f) return ch - (asciis.a - 10);
	}
	/**
	* Convert hex string to byte array. Uses built-in function, when available.
	* @example hexToBytes('cafe0123') // Uint8Array.from([0xca, 0xfe, 0x01, 0x23])
	*/
	function hexToBytes(hex) {
		if (typeof hex !== "string") throw new Error("hex string expected, got " + typeof hex);
		if (hasHexBuiltin) return Uint8Array.fromHex(hex);
		const hl = hex.length;
		const al = hl / 2;
		if (hl % 2) throw new Error("hex string expected, got unpadded hex of length " + hl);
		const array = new Uint8Array(al);
		for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
			const n1 = asciiToBase16(hex.charCodeAt(hi));
			const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
			if (n1 === void 0 || n2 === void 0) {
				const char = hex[hi] + hex[hi + 1];
				throw new Error("hex string expected, got non-hex character \"" + char + "\" at index " + hi);
			}
			array[ai] = n1 * 16 + n2;
		}
		return array;
	}
	/**
	* There is no setImmediate in browser and setTimeout is slow.
	* Call of async fn will return Promise, which will be fullfiled only on
	* next scheduler queue processing step and this is exactly what we need.
	*/
	var nextTick = async () => {};
	exports.nextTick = nextTick;
	/** Returns control to thread each 'tick' ms to avoid blocking. */
	async function asyncLoop(iters, tick, cb) {
		let ts = Date.now();
		for (let i = 0; i < iters; i++) {
			cb(i);
			const diff = Date.now() - ts;
			if (diff >= 0 && diff < tick) continue;
			await (0, exports.nextTick)();
			ts += diff;
		}
	}
	/**
	* Converts string to bytes using UTF8 encoding.
	* @example utf8ToBytes('abc') // Uint8Array.from([97, 98, 99])
	*/
	function utf8ToBytes(str) {
		if (typeof str !== "string") throw new Error("string expected");
		return new Uint8Array(new TextEncoder().encode(str));
	}
	/**
	* Converts bytes to string using UTF8 encoding.
	* @example bytesToUtf8(Uint8Array.from([97, 98, 99])) // 'abc'
	*/
	function bytesToUtf8(bytes) {
		return new TextDecoder().decode(bytes);
	}
	/**
	* Normalizes (non-hex) string or Uint8Array to Uint8Array.
	* Warning: when Uint8Array is passed, it would NOT get copied.
	* Keep in mind for future mutable operations.
	*/
	function toBytes(data) {
		if (typeof data === "string") data = utf8ToBytes(data);
		abytes(data);
		return data;
	}
	/**
	* Helper for KDFs: consumes uint8array or string.
	* When string is passed, does utf8 decoding, using TextDecoder.
	*/
	function kdfInputToBytes(data) {
		if (typeof data === "string") data = utf8ToBytes(data);
		abytes(data);
		return data;
	}
	/** Copies several Uint8Arrays into one. */
	function concatBytes(...arrays) {
		let sum = 0;
		for (let i = 0; i < arrays.length; i++) {
			const a = arrays[i];
			abytes(a);
			sum += a.length;
		}
		const res = new Uint8Array(sum);
		for (let i = 0, pad = 0; i < arrays.length; i++) {
			const a = arrays[i];
			res.set(a, pad);
			pad += a.length;
		}
		return res;
	}
	function checkOpts(defaults, opts) {
		if (opts !== void 0 && {}.toString.call(opts) !== "[object Object]") throw new Error("options should be object or undefined");
		return Object.assign(defaults, opts);
	}
	/** For runtime check if class implements interface */
	var Hash = class {};
	exports.Hash = Hash;
	/** Wraps hash function, creating an interface on top of it */
	function createHasher(hashCons) {
		const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
		const tmp = hashCons();
		hashC.outputLen = tmp.outputLen;
		hashC.blockLen = tmp.blockLen;
		hashC.create = () => hashCons();
		return hashC;
	}
	function createOptHasher(hashCons) {
		const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
		const tmp = hashCons({});
		hashC.outputLen = tmp.outputLen;
		hashC.blockLen = tmp.blockLen;
		hashC.create = (opts) => hashCons(opts);
		return hashC;
	}
	function createXOFer(hashCons) {
		const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
		const tmp = hashCons({});
		hashC.outputLen = tmp.outputLen;
		hashC.blockLen = tmp.blockLen;
		hashC.create = (opts) => hashCons(opts);
		return hashC;
	}
	exports.wrapConstructor = createHasher;
	exports.wrapConstructorWithOpts = createOptHasher;
	exports.wrapXOFConstructorWithOpts = createXOFer;
	/** Cryptographically secure PRNG. Uses internal OS-level `crypto.getRandomValues`. */
	function randomBytes(bytesLength = 32) {
		if (crypto_1.crypto && typeof crypto_1.crypto.getRandomValues === "function") return crypto_1.crypto.getRandomValues(new Uint8Array(bytesLength));
		if (crypto_1.crypto && typeof crypto_1.crypto.randomBytes === "function") return Uint8Array.from(crypto_1.crypto.randomBytes(bytesLength));
		throw new Error("crypto.getRandomValues must be defined");
	}
}));
//#endregion
//#region node_modules/@noble/hashes/hmac.js
var require_hmac$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.hmac = exports.HMAC = void 0;
	/**
	* HMAC: RFC2104 message authentication code.
	* @module
	*/
	var utils_ts_1 = require_utils$3();
	var HMAC = class extends utils_ts_1.Hash {
		constructor(hash, _key) {
			super();
			this.finished = false;
			this.destroyed = false;
			(0, utils_ts_1.ahash)(hash);
			const key = (0, utils_ts_1.toBytes)(_key);
			this.iHash = hash.create();
			if (typeof this.iHash.update !== "function") throw new Error("Expected instance of class which extends utils.Hash");
			this.blockLen = this.iHash.blockLen;
			this.outputLen = this.iHash.outputLen;
			const blockLen = this.blockLen;
			const pad = new Uint8Array(blockLen);
			pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
			for (let i = 0; i < pad.length; i++) pad[i] ^= 54;
			this.iHash.update(pad);
			this.oHash = hash.create();
			for (let i = 0; i < pad.length; i++) pad[i] ^= 106;
			this.oHash.update(pad);
			(0, utils_ts_1.clean)(pad);
		}
		update(buf) {
			(0, utils_ts_1.aexists)(this);
			this.iHash.update(buf);
			return this;
		}
		digestInto(out) {
			(0, utils_ts_1.aexists)(this);
			(0, utils_ts_1.abytes)(out, this.outputLen);
			this.finished = true;
			this.iHash.digestInto(out);
			this.oHash.update(out);
			this.oHash.digestInto(out);
			this.destroy();
		}
		digest() {
			const out = new Uint8Array(this.oHash.outputLen);
			this.digestInto(out);
			return out;
		}
		_cloneInto(to) {
			to || (to = Object.create(Object.getPrototypeOf(this), {}));
			const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
			to = to;
			to.finished = finished;
			to.destroyed = destroyed;
			to.blockLen = blockLen;
			to.outputLen = outputLen;
			to.oHash = oHash._cloneInto(to.oHash);
			to.iHash = iHash._cloneInto(to.iHash);
			return to;
		}
		clone() {
			return this._cloneInto();
		}
		destroy() {
			this.destroyed = true;
			this.oHash.destroy();
			this.iHash.destroy();
		}
	};
	exports.HMAC = HMAC;
	/**
	* HMAC: RFC2104 message authentication code.
	* @param hash - function that would be used e.g. sha256
	* @param key - message key
	* @param message - message data
	* @example
	* import { hmac } from '@noble/hashes/hmac';
	* import { sha256 } from '@noble/hashes/sha2';
	* const mac1 = hmac(sha256, 'key', 'message');
	*/
	var hmac = (hash, key, message) => new HMAC(hash, key).update(message).digest();
	exports.hmac = hmac;
	exports.hmac.create = (hash, key) => new HMAC(hash, key);
}));
//#endregion
//#region node_modules/@noble/hashes/pbkdf2.js
var require_pbkdf2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.pbkdf2 = pbkdf2;
	exports.pbkdf2Async = pbkdf2Async;
	/**
	* PBKDF (RFC 2898). Can be used to create a key from password and salt.
	* @module
	*/
	var hmac_ts_1 = require_hmac$1();
	var utils_ts_1 = require_utils$3();
	function pbkdf2Init(hash, _password, _salt, _opts) {
		(0, utils_ts_1.ahash)(hash);
		const { c, dkLen, asyncTick } = (0, utils_ts_1.checkOpts)({
			dkLen: 32,
			asyncTick: 10
		}, _opts);
		(0, utils_ts_1.anumber)(c);
		(0, utils_ts_1.anumber)(dkLen);
		(0, utils_ts_1.anumber)(asyncTick);
		if (c < 1) throw new Error("iterations (c) should be >= 1");
		const password = (0, utils_ts_1.kdfInputToBytes)(_password);
		const salt = (0, utils_ts_1.kdfInputToBytes)(_salt);
		const DK = new Uint8Array(dkLen);
		const PRF = hmac_ts_1.hmac.create(hash, password);
		return {
			c,
			dkLen,
			asyncTick,
			DK,
			PRF,
			PRFSalt: PRF._cloneInto().update(salt)
		};
	}
	function pbkdf2Output(PRF, PRFSalt, DK, prfW, u) {
		PRF.destroy();
		PRFSalt.destroy();
		if (prfW) prfW.destroy();
		(0, utils_ts_1.clean)(u);
		return DK;
	}
	/**
	* PBKDF2-HMAC: RFC 2898 key derivation function
	* @param hash - hash function that would be used e.g. sha256
	* @param password - password from which a derived key is generated
	* @param salt - cryptographic salt
	* @param opts - {c, dkLen} where c is work factor and dkLen is output message size
	* @example
	* const key = pbkdf2(sha256, 'password', 'salt', { dkLen: 32, c: Math.pow(2, 18) });
	*/
	function pbkdf2(hash, password, salt, opts) {
		const { c, dkLen, DK, PRF, PRFSalt } = pbkdf2Init(hash, password, salt, opts);
		let prfW;
		const arr = new Uint8Array(4);
		const view = (0, utils_ts_1.createView)(arr);
		const u = new Uint8Array(PRF.outputLen);
		for (let ti = 1, pos = 0; pos < dkLen; ti++, pos += PRF.outputLen) {
			const Ti = DK.subarray(pos, pos + PRF.outputLen);
			view.setInt32(0, ti, false);
			(prfW = PRFSalt._cloneInto(prfW)).update(arr).digestInto(u);
			Ti.set(u.subarray(0, Ti.length));
			for (let ui = 1; ui < c; ui++) {
				PRF._cloneInto(prfW).update(u).digestInto(u);
				for (let i = 0; i < Ti.length; i++) Ti[i] ^= u[i];
			}
		}
		return pbkdf2Output(PRF, PRFSalt, DK, prfW, u);
	}
	/**
	* PBKDF2-HMAC: RFC 2898 key derivation function. Async version.
	* @example
	* await pbkdf2Async(sha256, 'password', 'salt', { dkLen: 32, c: 500_000 });
	*/
	async function pbkdf2Async(hash, password, salt, opts) {
		const { c, dkLen, asyncTick, DK, PRF, PRFSalt } = pbkdf2Init(hash, password, salt, opts);
		let prfW;
		const arr = new Uint8Array(4);
		const view = (0, utils_ts_1.createView)(arr);
		const u = new Uint8Array(PRF.outputLen);
		for (let ti = 1, pos = 0; pos < dkLen; ti++, pos += PRF.outputLen) {
			const Ti = DK.subarray(pos, pos + PRF.outputLen);
			view.setInt32(0, ti, false);
			(prfW = PRFSalt._cloneInto(prfW)).update(arr).digestInto(u);
			Ti.set(u.subarray(0, Ti.length));
			await (0, utils_ts_1.asyncLoop)(c - 1, asyncTick, () => {
				PRF._cloneInto(prfW).update(u).digestInto(u);
				for (let i = 0; i < Ti.length; i++) Ti[i] ^= u[i];
			});
		}
		return pbkdf2Output(PRF, PRFSalt, DK, prfW, u);
	}
}));
//#endregion
//#region node_modules/@noble/hashes/_md.js
var require__md = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SHA512_IV = exports.SHA384_IV = exports.SHA224_IV = exports.SHA256_IV = exports.HashMD = void 0;
	exports.setBigUint64 = setBigUint64;
	exports.Chi = Chi;
	exports.Maj = Maj;
	/**
	* Internal Merkle-Damgard hash utils.
	* @module
	*/
	var utils_ts_1 = require_utils$3();
	/** Polyfill for Safari 14. https://caniuse.com/mdn-javascript_builtins_dataview_setbiguint64 */
	function setBigUint64(view, byteOffset, value, isLE) {
		if (typeof view.setBigUint64 === "function") return view.setBigUint64(byteOffset, value, isLE);
		const _32n = BigInt(32);
		const _u32_max = BigInt(4294967295);
		const wh = Number(value >> _32n & _u32_max);
		const wl = Number(value & _u32_max);
		const h = isLE ? 4 : 0;
		const l = isLE ? 0 : 4;
		view.setUint32(byteOffset + h, wh, isLE);
		view.setUint32(byteOffset + l, wl, isLE);
	}
	/** Choice: a ? b : c */
	function Chi(a, b, c) {
		return a & b ^ ~a & c;
	}
	/** Majority function, true if any two inputs is true. */
	function Maj(a, b, c) {
		return a & b ^ a & c ^ b & c;
	}
	/**
	* Merkle-Damgard hash construction base class.
	* Could be used to create MD5, RIPEMD, SHA1, SHA2.
	*/
	var HashMD = class extends utils_ts_1.Hash {
		constructor(blockLen, outputLen, padOffset, isLE) {
			super();
			this.finished = false;
			this.length = 0;
			this.pos = 0;
			this.destroyed = false;
			this.blockLen = blockLen;
			this.outputLen = outputLen;
			this.padOffset = padOffset;
			this.isLE = isLE;
			this.buffer = new Uint8Array(blockLen);
			this.view = (0, utils_ts_1.createView)(this.buffer);
		}
		update(data) {
			(0, utils_ts_1.aexists)(this);
			data = (0, utils_ts_1.toBytes)(data);
			(0, utils_ts_1.abytes)(data);
			const { view, buffer, blockLen } = this;
			const len = data.length;
			for (let pos = 0; pos < len;) {
				const take = Math.min(blockLen - this.pos, len - pos);
				if (take === blockLen) {
					const dataView = (0, utils_ts_1.createView)(data);
					for (; blockLen <= len - pos; pos += blockLen) this.process(dataView, pos);
					continue;
				}
				buffer.set(data.subarray(pos, pos + take), this.pos);
				this.pos += take;
				pos += take;
				if (this.pos === blockLen) {
					this.process(view, 0);
					this.pos = 0;
				}
			}
			this.length += data.length;
			this.roundClean();
			return this;
		}
		digestInto(out) {
			(0, utils_ts_1.aexists)(this);
			(0, utils_ts_1.aoutput)(out, this);
			this.finished = true;
			const { buffer, view, blockLen, isLE } = this;
			let { pos } = this;
			buffer[pos++] = 128;
			(0, utils_ts_1.clean)(this.buffer.subarray(pos));
			if (this.padOffset > blockLen - pos) {
				this.process(view, 0);
				pos = 0;
			}
			for (let i = pos; i < blockLen; i++) buffer[i] = 0;
			setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
			this.process(view, 0);
			const oview = (0, utils_ts_1.createView)(out);
			const len = this.outputLen;
			if (len % 4) throw new Error("_sha2: outputLen should be aligned to 32bit");
			const outLen = len / 4;
			const state = this.get();
			if (outLen > state.length) throw new Error("_sha2: outputLen bigger than state");
			for (let i = 0; i < outLen; i++) oview.setUint32(4 * i, state[i], isLE);
		}
		digest() {
			const { buffer, outputLen } = this;
			this.digestInto(buffer);
			const res = buffer.slice(0, outputLen);
			this.destroy();
			return res;
		}
		_cloneInto(to) {
			to || (to = new this.constructor());
			to.set(...this.get());
			const { blockLen, buffer, length, finished, destroyed, pos } = this;
			to.destroyed = destroyed;
			to.finished = finished;
			to.length = length;
			to.pos = pos;
			if (length % blockLen) to.buffer.set(buffer);
			return to;
		}
		clone() {
			return this._cloneInto();
		}
	};
	exports.HashMD = HashMD;
	/**
	* Initial SHA-2 state: fractional parts of square roots of first 16 primes 2..53.
	* Check out `test/misc/sha2-gen-iv.js` for recomputation guide.
	*/
	/** Initial SHA256 state. Bits 0..32 of frac part of sqrt of primes 2..19 */
	exports.SHA256_IV = Uint32Array.from([
		1779033703,
		3144134277,
		1013904242,
		2773480762,
		1359893119,
		2600822924,
		528734635,
		1541459225
	]);
	/** Initial SHA224 state. Bits 32..64 of frac part of sqrt of primes 23..53 */
	exports.SHA224_IV = Uint32Array.from([
		3238371032,
		914150663,
		812702999,
		4144912697,
		4290775857,
		1750603025,
		1694076839,
		3204075428
	]);
	/** Initial SHA384 state. Bits 0..64 of frac part of sqrt of primes 23..53 */
	exports.SHA384_IV = Uint32Array.from([
		3418070365,
		3238371032,
		1654270250,
		914150663,
		2438529370,
		812702999,
		355462360,
		4144912697,
		1731405415,
		4290775857,
		2394180231,
		1750603025,
		3675008525,
		1694076839,
		1203062813,
		3204075428
	]);
	/** Initial SHA512 state. Bits 0..64 of frac part of sqrt of primes 2..19 */
	exports.SHA512_IV = Uint32Array.from([
		1779033703,
		4089235720,
		3144134277,
		2227873595,
		1013904242,
		4271175723,
		2773480762,
		1595750129,
		1359893119,
		2917565137,
		2600822924,
		725511199,
		528734635,
		4215389547,
		1541459225,
		327033209
	]);
}));
//#endregion
//#region node_modules/@noble/hashes/_u64.js
var require__u64 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.toBig = exports.shrSL = exports.shrSH = exports.rotrSL = exports.rotrSH = exports.rotrBL = exports.rotrBH = exports.rotr32L = exports.rotr32H = exports.rotlSL = exports.rotlSH = exports.rotlBL = exports.rotlBH = exports.add5L = exports.add5H = exports.add4L = exports.add4H = exports.add3L = exports.add3H = void 0;
	exports.add = add;
	exports.fromBig = fromBig;
	exports.split = split;
	/**
	* Internal helpers for u64. BigUint64Array is too slow as per 2025, so we implement it using Uint32Array.
	* @todo re-check https://issues.chromium.org/issues/42212588
	* @module
	*/
	var U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
	var _32n = /* @__PURE__ */ BigInt(32);
	function fromBig(n, le = false) {
		if (le) return {
			h: Number(n & U32_MASK64),
			l: Number(n >> _32n & U32_MASK64)
		};
		return {
			h: Number(n >> _32n & U32_MASK64) | 0,
			l: Number(n & U32_MASK64) | 0
		};
	}
	function split(lst, le = false) {
		const len = lst.length;
		let Ah = new Uint32Array(len);
		let Al = new Uint32Array(len);
		for (let i = 0; i < len; i++) {
			const { h, l } = fromBig(lst[i], le);
			[Ah[i], Al[i]] = [h, l];
		}
		return [Ah, Al];
	}
	var toBig = (h, l) => BigInt(h >>> 0) << _32n | BigInt(l >>> 0);
	exports.toBig = toBig;
	var shrSH = (h, _l, s) => h >>> s;
	exports.shrSH = shrSH;
	var shrSL = (h, l, s) => h << 32 - s | l >>> s;
	exports.shrSL = shrSL;
	var rotrSH = (h, l, s) => h >>> s | l << 32 - s;
	exports.rotrSH = rotrSH;
	var rotrSL = (h, l, s) => h << 32 - s | l >>> s;
	exports.rotrSL = rotrSL;
	var rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
	exports.rotrBH = rotrBH;
	var rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
	exports.rotrBL = rotrBL;
	var rotr32H = (_h, l) => l;
	exports.rotr32H = rotr32H;
	var rotr32L = (h, _l) => h;
	exports.rotr32L = rotr32L;
	var rotlSH = (h, l, s) => h << s | l >>> 32 - s;
	exports.rotlSH = rotlSH;
	var rotlSL = (h, l, s) => l << s | h >>> 32 - s;
	exports.rotlSL = rotlSL;
	var rotlBH = (h, l, s) => l << s - 32 | h >>> 64 - s;
	exports.rotlBH = rotlBH;
	var rotlBL = (h, l, s) => h << s - 32 | l >>> 64 - s;
	exports.rotlBL = rotlBL;
	function add(Ah, Al, Bh, Bl) {
		const l = (Al >>> 0) + (Bl >>> 0);
		return {
			h: Ah + Bh + (l / 2 ** 32 | 0) | 0,
			l: l | 0
		};
	}
	var add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
	exports.add3L = add3L;
	var add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
	exports.add3H = add3H;
	var add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
	exports.add4L = add4L;
	var add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
	exports.add4H = add4H;
	var add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
	exports.add5L = add5L;
	var add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
	exports.add5H = add5H;
	exports.default = {
		fromBig,
		split,
		toBig,
		shrSH,
		shrSL,
		rotrSH,
		rotrSL,
		rotrBH,
		rotrBL,
		rotr32H,
		rotr32L,
		rotlSH,
		rotlSL,
		rotlBH,
		rotlBL,
		add,
		add3L,
		add3H,
		add4L,
		add4H,
		add5H,
		add5L
	};
}));
//#endregion
//#region node_modules/@noble/hashes/sha2.js
var require_sha2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.sha512_224 = exports.sha512_256 = exports.sha384 = exports.sha512 = exports.sha224 = exports.sha256 = exports.SHA512_256 = exports.SHA512_224 = exports.SHA384 = exports.SHA512 = exports.SHA224 = exports.SHA256 = void 0;
	/**
	* SHA2 hash function. A.k.a. sha256, sha384, sha512, sha512_224, sha512_256.
	* SHA256 is the fastest hash implementable in JS, even faster than Blake3.
	* Check out [RFC 4634](https://datatracker.ietf.org/doc/html/rfc4634) and
	* [FIPS 180-4](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf).
	* @module
	*/
	var _md_ts_1 = require__md();
	var u64 = require__u64();
	var utils_ts_1 = require_utils$3();
	/**
	* Round constants:
	* First 32 bits of fractional parts of the cube roots of the first 64 primes 2..311)
	*/
	var SHA256_K = /* @__PURE__ */ Uint32Array.from([
		1116352408,
		1899447441,
		3049323471,
		3921009573,
		961987163,
		1508970993,
		2453635748,
		2870763221,
		3624381080,
		310598401,
		607225278,
		1426881987,
		1925078388,
		2162078206,
		2614888103,
		3248222580,
		3835390401,
		4022224774,
		264347078,
		604807628,
		770255983,
		1249150122,
		1555081692,
		1996064986,
		2554220882,
		2821834349,
		2952996808,
		3210313671,
		3336571891,
		3584528711,
		113926993,
		338241895,
		666307205,
		773529912,
		1294757372,
		1396182291,
		1695183700,
		1986661051,
		2177026350,
		2456956037,
		2730485921,
		2820302411,
		3259730800,
		3345764771,
		3516065817,
		3600352804,
		4094571909,
		275423344,
		430227734,
		506948616,
		659060556,
		883997877,
		958139571,
		1322822218,
		1537002063,
		1747873779,
		1955562222,
		2024104815,
		2227730452,
		2361852424,
		2428436474,
		2756734187,
		3204031479,
		3329325298
	]);
	/** Reusable temporary buffer. "W" comes straight from spec. */
	var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
	var SHA256 = class extends _md_ts_1.HashMD {
		constructor(outputLen = 32) {
			super(64, outputLen, 8, false);
			this.A = _md_ts_1.SHA256_IV[0] | 0;
			this.B = _md_ts_1.SHA256_IV[1] | 0;
			this.C = _md_ts_1.SHA256_IV[2] | 0;
			this.D = _md_ts_1.SHA256_IV[3] | 0;
			this.E = _md_ts_1.SHA256_IV[4] | 0;
			this.F = _md_ts_1.SHA256_IV[5] | 0;
			this.G = _md_ts_1.SHA256_IV[6] | 0;
			this.H = _md_ts_1.SHA256_IV[7] | 0;
		}
		get() {
			const { A, B, C, D, E, F, G, H } = this;
			return [
				A,
				B,
				C,
				D,
				E,
				F,
				G,
				H
			];
		}
		set(A, B, C, D, E, F, G, H) {
			this.A = A | 0;
			this.B = B | 0;
			this.C = C | 0;
			this.D = D | 0;
			this.E = E | 0;
			this.F = F | 0;
			this.G = G | 0;
			this.H = H | 0;
		}
		process(view, offset) {
			for (let i = 0; i < 16; i++, offset += 4) SHA256_W[i] = view.getUint32(offset, false);
			for (let i = 16; i < 64; i++) {
				const W15 = SHA256_W[i - 15];
				const W2 = SHA256_W[i - 2];
				const s0 = (0, utils_ts_1.rotr)(W15, 7) ^ (0, utils_ts_1.rotr)(W15, 18) ^ W15 >>> 3;
				SHA256_W[i] = ((0, utils_ts_1.rotr)(W2, 17) ^ (0, utils_ts_1.rotr)(W2, 19) ^ W2 >>> 10) + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
			}
			let { A, B, C, D, E, F, G, H } = this;
			for (let i = 0; i < 64; i++) {
				const sigma1 = (0, utils_ts_1.rotr)(E, 6) ^ (0, utils_ts_1.rotr)(E, 11) ^ (0, utils_ts_1.rotr)(E, 25);
				const T1 = H + sigma1 + (0, _md_ts_1.Chi)(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
				const T2 = ((0, utils_ts_1.rotr)(A, 2) ^ (0, utils_ts_1.rotr)(A, 13) ^ (0, utils_ts_1.rotr)(A, 22)) + (0, _md_ts_1.Maj)(A, B, C) | 0;
				H = G;
				G = F;
				F = E;
				E = D + T1 | 0;
				D = C;
				C = B;
				B = A;
				A = T1 + T2 | 0;
			}
			A = A + this.A | 0;
			B = B + this.B | 0;
			C = C + this.C | 0;
			D = D + this.D | 0;
			E = E + this.E | 0;
			F = F + this.F | 0;
			G = G + this.G | 0;
			H = H + this.H | 0;
			this.set(A, B, C, D, E, F, G, H);
		}
		roundClean() {
			(0, utils_ts_1.clean)(SHA256_W);
		}
		destroy() {
			this.set(0, 0, 0, 0, 0, 0, 0, 0);
			(0, utils_ts_1.clean)(this.buffer);
		}
	};
	exports.SHA256 = SHA256;
	var SHA224 = class extends SHA256 {
		constructor() {
			super(28);
			this.A = _md_ts_1.SHA224_IV[0] | 0;
			this.B = _md_ts_1.SHA224_IV[1] | 0;
			this.C = _md_ts_1.SHA224_IV[2] | 0;
			this.D = _md_ts_1.SHA224_IV[3] | 0;
			this.E = _md_ts_1.SHA224_IV[4] | 0;
			this.F = _md_ts_1.SHA224_IV[5] | 0;
			this.G = _md_ts_1.SHA224_IV[6] | 0;
			this.H = _md_ts_1.SHA224_IV[7] | 0;
		}
	};
	exports.SHA224 = SHA224;
	var K512 = u64.split([
		"0x428a2f98d728ae22",
		"0x7137449123ef65cd",
		"0xb5c0fbcfec4d3b2f",
		"0xe9b5dba58189dbbc",
		"0x3956c25bf348b538",
		"0x59f111f1b605d019",
		"0x923f82a4af194f9b",
		"0xab1c5ed5da6d8118",
		"0xd807aa98a3030242",
		"0x12835b0145706fbe",
		"0x243185be4ee4b28c",
		"0x550c7dc3d5ffb4e2",
		"0x72be5d74f27b896f",
		"0x80deb1fe3b1696b1",
		"0x9bdc06a725c71235",
		"0xc19bf174cf692694",
		"0xe49b69c19ef14ad2",
		"0xefbe4786384f25e3",
		"0x0fc19dc68b8cd5b5",
		"0x240ca1cc77ac9c65",
		"0x2de92c6f592b0275",
		"0x4a7484aa6ea6e483",
		"0x5cb0a9dcbd41fbd4",
		"0x76f988da831153b5",
		"0x983e5152ee66dfab",
		"0xa831c66d2db43210",
		"0xb00327c898fb213f",
		"0xbf597fc7beef0ee4",
		"0xc6e00bf33da88fc2",
		"0xd5a79147930aa725",
		"0x06ca6351e003826f",
		"0x142929670a0e6e70",
		"0x27b70a8546d22ffc",
		"0x2e1b21385c26c926",
		"0x4d2c6dfc5ac42aed",
		"0x53380d139d95b3df",
		"0x650a73548baf63de",
		"0x766a0abb3c77b2a8",
		"0x81c2c92e47edaee6",
		"0x92722c851482353b",
		"0xa2bfe8a14cf10364",
		"0xa81a664bbc423001",
		"0xc24b8b70d0f89791",
		"0xc76c51a30654be30",
		"0xd192e819d6ef5218",
		"0xd69906245565a910",
		"0xf40e35855771202a",
		"0x106aa07032bbd1b8",
		"0x19a4c116b8d2d0c8",
		"0x1e376c085141ab53",
		"0x2748774cdf8eeb99",
		"0x34b0bcb5e19b48a8",
		"0x391c0cb3c5c95a63",
		"0x4ed8aa4ae3418acb",
		"0x5b9cca4f7763e373",
		"0x682e6ff3d6b2b8a3",
		"0x748f82ee5defb2fc",
		"0x78a5636f43172f60",
		"0x84c87814a1f0ab72",
		"0x8cc702081a6439ec",
		"0x90befffa23631e28",
		"0xa4506cebde82bde9",
		"0xbef9a3f7b2c67915",
		"0xc67178f2e372532b",
		"0xca273eceea26619c",
		"0xd186b8c721c0c207",
		"0xeada7dd6cde0eb1e",
		"0xf57d4f7fee6ed178",
		"0x06f067aa72176fba",
		"0x0a637dc5a2c898a6",
		"0x113f9804bef90dae",
		"0x1b710b35131c471b",
		"0x28db77f523047d84",
		"0x32caab7b40c72493",
		"0x3c9ebe0a15c9bebc",
		"0x431d67c49c100d4c",
		"0x4cc5d4becb3e42b6",
		"0x597f299cfc657e2a",
		"0x5fcb6fab3ad6faec",
		"0x6c44198c4a475817"
	].map((n) => BigInt(n)));
	var SHA512_Kh = K512[0];
	var SHA512_Kl = K512[1];
	var SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
	var SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
	var SHA512 = class extends _md_ts_1.HashMD {
		constructor(outputLen = 64) {
			super(128, outputLen, 16, false);
			this.Ah = _md_ts_1.SHA512_IV[0] | 0;
			this.Al = _md_ts_1.SHA512_IV[1] | 0;
			this.Bh = _md_ts_1.SHA512_IV[2] | 0;
			this.Bl = _md_ts_1.SHA512_IV[3] | 0;
			this.Ch = _md_ts_1.SHA512_IV[4] | 0;
			this.Cl = _md_ts_1.SHA512_IV[5] | 0;
			this.Dh = _md_ts_1.SHA512_IV[6] | 0;
			this.Dl = _md_ts_1.SHA512_IV[7] | 0;
			this.Eh = _md_ts_1.SHA512_IV[8] | 0;
			this.El = _md_ts_1.SHA512_IV[9] | 0;
			this.Fh = _md_ts_1.SHA512_IV[10] | 0;
			this.Fl = _md_ts_1.SHA512_IV[11] | 0;
			this.Gh = _md_ts_1.SHA512_IV[12] | 0;
			this.Gl = _md_ts_1.SHA512_IV[13] | 0;
			this.Hh = _md_ts_1.SHA512_IV[14] | 0;
			this.Hl = _md_ts_1.SHA512_IV[15] | 0;
		}
		get() {
			const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
			return [
				Ah,
				Al,
				Bh,
				Bl,
				Ch,
				Cl,
				Dh,
				Dl,
				Eh,
				El,
				Fh,
				Fl,
				Gh,
				Gl,
				Hh,
				Hl
			];
		}
		set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
			this.Ah = Ah | 0;
			this.Al = Al | 0;
			this.Bh = Bh | 0;
			this.Bl = Bl | 0;
			this.Ch = Ch | 0;
			this.Cl = Cl | 0;
			this.Dh = Dh | 0;
			this.Dl = Dl | 0;
			this.Eh = Eh | 0;
			this.El = El | 0;
			this.Fh = Fh | 0;
			this.Fl = Fl | 0;
			this.Gh = Gh | 0;
			this.Gl = Gl | 0;
			this.Hh = Hh | 0;
			this.Hl = Hl | 0;
		}
		process(view, offset) {
			for (let i = 0; i < 16; i++, offset += 4) {
				SHA512_W_H[i] = view.getUint32(offset);
				SHA512_W_L[i] = view.getUint32(offset += 4);
			}
			for (let i = 16; i < 80; i++) {
				const W15h = SHA512_W_H[i - 15] | 0;
				const W15l = SHA512_W_L[i - 15] | 0;
				const s0h = u64.rotrSH(W15h, W15l, 1) ^ u64.rotrSH(W15h, W15l, 8) ^ u64.shrSH(W15h, W15l, 7);
				const s0l = u64.rotrSL(W15h, W15l, 1) ^ u64.rotrSL(W15h, W15l, 8) ^ u64.shrSL(W15h, W15l, 7);
				const W2h = SHA512_W_H[i - 2] | 0;
				const W2l = SHA512_W_L[i - 2] | 0;
				const s1h = u64.rotrSH(W2h, W2l, 19) ^ u64.rotrBH(W2h, W2l, 61) ^ u64.shrSH(W2h, W2l, 6);
				const s1l = u64.rotrSL(W2h, W2l, 19) ^ u64.rotrBL(W2h, W2l, 61) ^ u64.shrSL(W2h, W2l, 6);
				const SUMl = u64.add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
				SHA512_W_H[i] = u64.add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]) | 0;
				SHA512_W_L[i] = SUMl | 0;
			}
			let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
			for (let i = 0; i < 80; i++) {
				const sigma1h = u64.rotrSH(Eh, El, 14) ^ u64.rotrSH(Eh, El, 18) ^ u64.rotrBH(Eh, El, 41);
				const sigma1l = u64.rotrSL(Eh, El, 14) ^ u64.rotrSL(Eh, El, 18) ^ u64.rotrBL(Eh, El, 41);
				const CHIh = Eh & Fh ^ ~Eh & Gh;
				const CHIl = El & Fl ^ ~El & Gl;
				const T1ll = u64.add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
				const T1h = u64.add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
				const T1l = T1ll | 0;
				const sigma0h = u64.rotrSH(Ah, Al, 28) ^ u64.rotrBH(Ah, Al, 34) ^ u64.rotrBH(Ah, Al, 39);
				const sigma0l = u64.rotrSL(Ah, Al, 28) ^ u64.rotrBL(Ah, Al, 34) ^ u64.rotrBL(Ah, Al, 39);
				const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
				const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
				Hh = Gh | 0;
				Hl = Gl | 0;
				Gh = Fh | 0;
				Gl = Fl | 0;
				Fh = Eh | 0;
				Fl = El | 0;
				({h: Eh, l: El} = u64.add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
				Dh = Ch | 0;
				Dl = Cl | 0;
				Ch = Bh | 0;
				Cl = Bl | 0;
				Bh = Ah | 0;
				Bl = Al | 0;
				const All = u64.add3L(T1l, sigma0l, MAJl);
				Ah = u64.add3H(All, T1h, sigma0h, MAJh);
				Al = All | 0;
			}
			({h: Ah, l: Al} = u64.add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
			({h: Bh, l: Bl} = u64.add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
			({h: Ch, l: Cl} = u64.add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
			({h: Dh, l: Dl} = u64.add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
			({h: Eh, l: El} = u64.add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
			({h: Fh, l: Fl} = u64.add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
			({h: Gh, l: Gl} = u64.add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
			({h: Hh, l: Hl} = u64.add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
			this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
		}
		roundClean() {
			(0, utils_ts_1.clean)(SHA512_W_H, SHA512_W_L);
		}
		destroy() {
			(0, utils_ts_1.clean)(this.buffer);
			this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
		}
	};
	exports.SHA512 = SHA512;
	var SHA384 = class extends SHA512 {
		constructor() {
			super(48);
			this.Ah = _md_ts_1.SHA384_IV[0] | 0;
			this.Al = _md_ts_1.SHA384_IV[1] | 0;
			this.Bh = _md_ts_1.SHA384_IV[2] | 0;
			this.Bl = _md_ts_1.SHA384_IV[3] | 0;
			this.Ch = _md_ts_1.SHA384_IV[4] | 0;
			this.Cl = _md_ts_1.SHA384_IV[5] | 0;
			this.Dh = _md_ts_1.SHA384_IV[6] | 0;
			this.Dl = _md_ts_1.SHA384_IV[7] | 0;
			this.Eh = _md_ts_1.SHA384_IV[8] | 0;
			this.El = _md_ts_1.SHA384_IV[9] | 0;
			this.Fh = _md_ts_1.SHA384_IV[10] | 0;
			this.Fl = _md_ts_1.SHA384_IV[11] | 0;
			this.Gh = _md_ts_1.SHA384_IV[12] | 0;
			this.Gl = _md_ts_1.SHA384_IV[13] | 0;
			this.Hh = _md_ts_1.SHA384_IV[14] | 0;
			this.Hl = _md_ts_1.SHA384_IV[15] | 0;
		}
	};
	exports.SHA384 = SHA384;
	/**
	* Truncated SHA512/256 and SHA512/224.
	* SHA512_IV is XORed with 0xa5a5a5a5a5a5a5a5, then used as "intermediary" IV of SHA512/t.
	* Then t hashes string to produce result IV.
	* See `test/misc/sha2-gen-iv.js`.
	*/
	/** SHA512/224 IV */
	var T224_IV = /* @__PURE__ */ Uint32Array.from([
		2352822216,
		424955298,
		1944164710,
		2312950998,
		502970286,
		855612546,
		1738396948,
		1479516111,
		258812777,
		2077511080,
		2011393907,
		79989058,
		1067287976,
		1780299464,
		286451373,
		2446758561
	]);
	/** SHA512/256 IV */
	var T256_IV = /* @__PURE__ */ Uint32Array.from([
		573645204,
		4230739756,
		2673172387,
		3360449730,
		596883563,
		1867755857,
		2520282905,
		1497426621,
		2519219938,
		2827943907,
		3193839141,
		1401305490,
		721525244,
		746961066,
		246885852,
		2177182882
	]);
	var SHA512_224 = class extends SHA512 {
		constructor() {
			super(28);
			this.Ah = T224_IV[0] | 0;
			this.Al = T224_IV[1] | 0;
			this.Bh = T224_IV[2] | 0;
			this.Bl = T224_IV[3] | 0;
			this.Ch = T224_IV[4] | 0;
			this.Cl = T224_IV[5] | 0;
			this.Dh = T224_IV[6] | 0;
			this.Dl = T224_IV[7] | 0;
			this.Eh = T224_IV[8] | 0;
			this.El = T224_IV[9] | 0;
			this.Fh = T224_IV[10] | 0;
			this.Fl = T224_IV[11] | 0;
			this.Gh = T224_IV[12] | 0;
			this.Gl = T224_IV[13] | 0;
			this.Hh = T224_IV[14] | 0;
			this.Hl = T224_IV[15] | 0;
		}
	};
	exports.SHA512_224 = SHA512_224;
	var SHA512_256 = class extends SHA512 {
		constructor() {
			super(32);
			this.Ah = T256_IV[0] | 0;
			this.Al = T256_IV[1] | 0;
			this.Bh = T256_IV[2] | 0;
			this.Bl = T256_IV[3] | 0;
			this.Ch = T256_IV[4] | 0;
			this.Cl = T256_IV[5] | 0;
			this.Dh = T256_IV[6] | 0;
			this.Dl = T256_IV[7] | 0;
			this.Eh = T256_IV[8] | 0;
			this.El = T256_IV[9] | 0;
			this.Fh = T256_IV[10] | 0;
			this.Fl = T256_IV[11] | 0;
			this.Gh = T256_IV[12] | 0;
			this.Gl = T256_IV[13] | 0;
			this.Hh = T256_IV[14] | 0;
			this.Hl = T256_IV[15] | 0;
		}
	};
	exports.SHA512_256 = SHA512_256;
	/**
	* SHA2-256 hash function from RFC 4634.
	*
	* It is the fastest JS hash, even faster than Blake3.
	* To break sha256 using birthday attack, attackers need to try 2^128 hashes.
	* BTC network is doing 2^70 hashes/sec (2^95 hashes/year) as per 2025.
	*/
	exports.sha256 = (0, utils_ts_1.createHasher)(() => new SHA256());
	/** SHA2-224 hash function from RFC 4634 */
	exports.sha224 = (0, utils_ts_1.createHasher)(() => new SHA224());
	/** SHA2-512 hash function from RFC 4634. */
	exports.sha512 = (0, utils_ts_1.createHasher)(() => new SHA512());
	/** SHA2-384 hash function from RFC 4634. */
	exports.sha384 = (0, utils_ts_1.createHasher)(() => new SHA384());
	/**
	* SHA2-512/256 "truncated" hash function, with improved resistance to length extension attacks.
	* See the paper on [truncated SHA512](https://eprint.iacr.org/2010/548.pdf).
	*/
	exports.sha512_256 = (0, utils_ts_1.createHasher)(() => new SHA512_256());
	/**
	* SHA2-512/224 "truncated" hash function, with improved resistance to length extension attacks.
	* See the paper on [truncated SHA512](https://eprint.iacr.org/2010/548.pdf).
	*/
	exports.sha512_224 = (0, utils_ts_1.createHasher)(() => new SHA512_224());
}));
//#endregion
//#region node_modules/@scure/bip39/node_modules/@scure/base/lib/index.js
var require_lib = /* @__PURE__ */ __commonJSMin(((exports) => {
	/*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.bytes = exports.stringToBytes = exports.str = exports.bytesToString = exports.hex = exports.utf8 = exports.bech32m = exports.bech32 = exports.base58check = exports.createBase58check = exports.base58xmr = exports.base58xrp = exports.base58flickr = exports.base58 = exports.base64urlnopad = exports.base64url = exports.base64nopad = exports.base64 = exports.base32crockford = exports.base32hexnopad = exports.base32hex = exports.base32nopad = exports.base32 = exports.base16 = exports.utils = void 0;
	function isBytes(a) {
		return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
	}
	/** Asserts something is Uint8Array. */
	function abytes(b, ...lengths) {
		if (!isBytes(b)) throw new Error("Uint8Array expected");
		if (lengths.length > 0 && !lengths.includes(b.length)) throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
	}
	function isArrayOf(isString, arr) {
		if (!Array.isArray(arr)) return false;
		if (arr.length === 0) return true;
		if (isString) return arr.every((item) => typeof item === "string");
		else return arr.every((item) => Number.isSafeInteger(item));
	}
	function afn(input) {
		if (typeof input !== "function") throw new Error("function expected");
		return true;
	}
	function astr(label, input) {
		if (typeof input !== "string") throw new Error(`${label}: string expected`);
		return true;
	}
	function anumber(n) {
		if (!Number.isSafeInteger(n)) throw new Error(`invalid integer: ${n}`);
	}
	function aArr(input) {
		if (!Array.isArray(input)) throw new Error("array expected");
	}
	function astrArr(label, input) {
		if (!isArrayOf(true, input)) throw new Error(`${label}: array of strings expected`);
	}
	function anumArr(label, input) {
		if (!isArrayOf(false, input)) throw new Error(`${label}: array of numbers expected`);
	}
	/**
	* @__NO_SIDE_EFFECTS__
	*/
	function chain(...args) {
		const id = (a) => a;
		const wrap = (a, b) => (c) => a(b(c));
		return {
			encode: args.map((x) => x.encode).reduceRight(wrap, id),
			decode: args.map((x) => x.decode).reduce(wrap, id)
		};
	}
	/**
	* Encodes integer radix representation to array of strings using alphabet and back.
	* Could also be array of strings.
	* @__NO_SIDE_EFFECTS__
	*/
	function alphabet(letters) {
		const lettersA = typeof letters === "string" ? letters.split("") : letters;
		const len = lettersA.length;
		astrArr("alphabet", lettersA);
		const indexes = new Map(lettersA.map((l, i) => [l, i]));
		return {
			encode: (digits) => {
				aArr(digits);
				return digits.map((i) => {
					if (!Number.isSafeInteger(i) || i < 0 || i >= len) throw new Error(`alphabet.encode: digit index outside alphabet "${i}". Allowed: ${letters}`);
					return lettersA[i];
				});
			},
			decode: (input) => {
				aArr(input);
				return input.map((letter) => {
					astr("alphabet.decode", letter);
					const i = indexes.get(letter);
					if (i === void 0) throw new Error(`Unknown letter: "${letter}". Allowed: ${letters}`);
					return i;
				});
			}
		};
	}
	/**
	* @__NO_SIDE_EFFECTS__
	*/
	function join(separator = "") {
		astr("join", separator);
		return {
			encode: (from) => {
				astrArr("join.decode", from);
				return from.join(separator);
			},
			decode: (to) => {
				astr("join.decode", to);
				return to.split(separator);
			}
		};
	}
	/**
	* Pad strings array so it has integer number of bits
	* @__NO_SIDE_EFFECTS__
	*/
	function padding(bits, chr = "=") {
		anumber(bits);
		astr("padding", chr);
		return {
			encode(data) {
				astrArr("padding.encode", data);
				while (data.length * bits % 8) data.push(chr);
				return data;
			},
			decode(input) {
				astrArr("padding.decode", input);
				let end = input.length;
				if (end * bits % 8) throw new Error("padding: invalid, string should have whole number of bytes");
				for (; end > 0 && input[end - 1] === chr; end--) if ((end - 1) * bits % 8 === 0) throw new Error("padding: invalid, string has too much padding");
				return input.slice(0, end);
			}
		};
	}
	/**
	* @__NO_SIDE_EFFECTS__
	*/
	function normalize(fn) {
		afn(fn);
		return {
			encode: (from) => from,
			decode: (to) => fn(to)
		};
	}
	/**
	* Slow: O(n^2) time complexity
	*/
	function convertRadix(data, from, to) {
		if (from < 2) throw new Error(`convertRadix: invalid from=${from}, base cannot be less than 2`);
		if (to < 2) throw new Error(`convertRadix: invalid to=${to}, base cannot be less than 2`);
		aArr(data);
		if (!data.length) return [];
		let pos = 0;
		const res = [];
		const digits = Array.from(data, (d) => {
			anumber(d);
			if (d < 0 || d >= from) throw new Error(`invalid integer: ${d}`);
			return d;
		});
		const dlen = digits.length;
		while (true) {
			let carry = 0;
			let done = true;
			for (let i = pos; i < dlen; i++) {
				const digit = digits[i];
				const fromCarry = from * carry;
				const digitBase = fromCarry + digit;
				if (!Number.isSafeInteger(digitBase) || fromCarry / from !== carry || digitBase - digit !== fromCarry) throw new Error("convertRadix: carry overflow");
				const div = digitBase / to;
				carry = digitBase % to;
				const rounded = Math.floor(div);
				digits[i] = rounded;
				if (!Number.isSafeInteger(rounded) || rounded * to + carry !== digitBase) throw new Error("convertRadix: carry overflow");
				if (!done) continue;
				else if (!rounded) pos = i;
				else done = false;
			}
			res.push(carry);
			if (done) break;
		}
		for (let i = 0; i < data.length - 1 && data[i] === 0; i++) res.push(0);
		return res.reverse();
	}
	var gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
	var radix2carry = /* @__NO_SIDE_EFFECTS__ */ (from, to) => from + (to - gcd(from, to));
	var powers = /* @__PURE__ */ (() => {
		let res = [];
		for (let i = 0; i < 40; i++) res.push(2 ** i);
		return res;
	})();
	/**
	* Implemented with numbers, because BigInt is 5x slower
	*/
	function convertRadix2(data, from, to, padding) {
		aArr(data);
		if (from <= 0 || from > 32) throw new Error(`convertRadix2: wrong from=${from}`);
		if (to <= 0 || to > 32) throw new Error(`convertRadix2: wrong to=${to}`);
		if (/* @__PURE__ */ radix2carry(from, to) > 32) throw new Error(`convertRadix2: carry overflow from=${from} to=${to} carryBits=${/* @__PURE__ */ radix2carry(from, to)}`);
		let carry = 0;
		let pos = 0;
		const max = powers[from];
		const mask = powers[to] - 1;
		const res = [];
		for (const n of data) {
			anumber(n);
			if (n >= max) throw new Error(`convertRadix2: invalid data word=${n} from=${from}`);
			carry = carry << from | n;
			if (pos + from > 32) throw new Error(`convertRadix2: carry overflow pos=${pos} from=${from}`);
			pos += from;
			for (; pos >= to; pos -= to) res.push((carry >> pos - to & mask) >>> 0);
			const pow = powers[pos];
			if (pow === void 0) throw new Error("invalid carry");
			carry &= pow - 1;
		}
		carry = carry << to - pos & mask;
		if (!padding && pos >= from) throw new Error("Excess padding");
		if (!padding && carry > 0) throw new Error(`Non-zero padding: ${carry}`);
		if (padding && pos > 0) res.push(carry >>> 0);
		return res;
	}
	/**
	* @__NO_SIDE_EFFECTS__
	*/
	function radix(num) {
		anumber(num);
		const _256 = 2 ** 8;
		return {
			encode: (bytes) => {
				if (!isBytes(bytes)) throw new Error("radix.encode input should be Uint8Array");
				return convertRadix(Array.from(bytes), _256, num);
			},
			decode: (digits) => {
				anumArr("radix.decode", digits);
				return Uint8Array.from(convertRadix(digits, num, _256));
			}
		};
	}
	/**
	* If both bases are power of same number (like `2**8 <-> 2**64`),
	* there is a linear algorithm. For now we have implementation for power-of-two bases only.
	* @__NO_SIDE_EFFECTS__
	*/
	function radix2(bits, revPadding = false) {
		anumber(bits);
		if (bits <= 0 || bits > 32) throw new Error("radix2: bits should be in (0..32]");
		if (/* @__PURE__ */ radix2carry(8, bits) > 32 || /* @__PURE__ */ radix2carry(bits, 8) > 32) throw new Error("radix2: carry overflow");
		return {
			encode: (bytes) => {
				if (!isBytes(bytes)) throw new Error("radix2.encode input should be Uint8Array");
				return convertRadix2(Array.from(bytes), 8, bits, !revPadding);
			},
			decode: (digits) => {
				anumArr("radix2.decode", digits);
				return Uint8Array.from(convertRadix2(digits, bits, 8, revPadding));
			}
		};
	}
	function unsafeWrapper(fn) {
		afn(fn);
		return function(...args) {
			try {
				return fn.apply(null, args);
			} catch (e) {}
		};
	}
	function checksum(len, fn) {
		anumber(len);
		afn(fn);
		return {
			encode(data) {
				if (!isBytes(data)) throw new Error("checksum.encode: input should be Uint8Array");
				const sum = fn(data).slice(0, len);
				const res = new Uint8Array(data.length + len);
				res.set(data);
				res.set(sum, data.length);
				return res;
			},
			decode(data) {
				if (!isBytes(data)) throw new Error("checksum.decode: input should be Uint8Array");
				const payload = data.slice(0, -len);
				const oldChecksum = data.slice(-len);
				const newChecksum = fn(payload).slice(0, len);
				for (let i = 0; i < len; i++) if (newChecksum[i] !== oldChecksum[i]) throw new Error("Invalid checksum");
				return payload;
			}
		};
	}
	exports.utils = {
		alphabet,
		chain,
		checksum,
		convertRadix,
		convertRadix2,
		radix,
		radix2,
		join,
		padding
	};
	/**
	* base16 encoding from RFC 4648.
	* @example
	* ```js
	* base16.encode(Uint8Array.from([0x12, 0xab]));
	* // => '12AB'
	* ```
	*/
	exports.base16 = chain(radix2(4), alphabet("0123456789ABCDEF"), join(""));
	/**
	* base32 encoding from RFC 4648. Has padding.
	* Use `base32nopad` for unpadded version.
	* Also check out `base32hex`, `base32hexnopad`, `base32crockford`.
	* @example
	* ```js
	* base32.encode(Uint8Array.from([0x12, 0xab]));
	* // => 'CKVQ===='
	* base32.decode('CKVQ====');
	* // => Uint8Array.from([0x12, 0xab])
	* ```
	*/
	exports.base32 = chain(radix2(5), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"), padding(5), join(""));
	/**
	* base32 encoding from RFC 4648. No padding.
	* Use `base32` for padded version.
	* Also check out `base32hex`, `base32hexnopad`, `base32crockford`.
	* @example
	* ```js
	* base32nopad.encode(Uint8Array.from([0x12, 0xab]));
	* // => 'CKVQ'
	* base32nopad.decode('CKVQ');
	* // => Uint8Array.from([0x12, 0xab])
	* ```
	*/
	exports.base32nopad = chain(radix2(5), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"), join(""));
	/**
	* base32 encoding from RFC 4648. Padded. Compared to ordinary `base32`, slightly different alphabet.
	* Use `base32hexnopad` for unpadded version.
	* @example
	* ```js
	* base32hex.encode(Uint8Array.from([0x12, 0xab]));
	* // => '2ALG===='
	* base32hex.decode('2ALG====');
	* // => Uint8Array.from([0x12, 0xab])
	* ```
	*/
	exports.base32hex = chain(radix2(5), alphabet("0123456789ABCDEFGHIJKLMNOPQRSTUV"), padding(5), join(""));
	/**
	* base32 encoding from RFC 4648. No padding. Compared to ordinary `base32`, slightly different alphabet.
	* Use `base32hex` for padded version.
	* @example
	* ```js
	* base32hexnopad.encode(Uint8Array.from([0x12, 0xab]));
	* // => '2ALG'
	* base32hexnopad.decode('2ALG');
	* // => Uint8Array.from([0x12, 0xab])
	* ```
	*/
	exports.base32hexnopad = chain(radix2(5), alphabet("0123456789ABCDEFGHIJKLMNOPQRSTUV"), join(""));
	/**
	* base32 encoding from RFC 4648. Doug Crockford's version.
	* https://www.crockford.com/base32.html
	* @example
	* ```js
	* base32crockford.encode(Uint8Array.from([0x12, 0xab]));
	* // => '2ANG'
	* base32crockford.decode('2ANG');
	* // => Uint8Array.from([0x12, 0xab])
	* ```
	*/
	exports.base32crockford = chain(radix2(5), alphabet("0123456789ABCDEFGHJKMNPQRSTVWXYZ"), join(""), normalize((s) => s.toUpperCase().replace(/O/g, "0").replace(/[IL]/g, "1")));
	var hasBase64Builtin = typeof Uint8Array.from([]).toBase64 === "function" && typeof Uint8Array.fromBase64 === "function";
	var decodeBase64Builtin = (s, isUrl) => {
		astr("base64", s);
		const re = isUrl ? /^[A-Za-z0-9=_-]+$/ : /^[A-Za-z0-9=+/]+$/;
		const alphabet = isUrl ? "base64url" : "base64";
		if (s.length > 0 && !re.test(s)) throw new Error("invalid base64");
		return Uint8Array.fromBase64(s, {
			alphabet,
			lastChunkHandling: "strict"
		});
	};
	/**
	* base64 from RFC 4648. Padded.
	* Use `base64nopad` for unpadded version.
	* Also check out `base64url`, `base64urlnopad`.
	* Falls back to built-in function, when available.
	* @example
	* ```js
	* base64.encode(Uint8Array.from([0x12, 0xab]));
	* // => 'Eqs='
	* base64.decode('Eqs=');
	* // => Uint8Array.from([0x12, 0xab])
	* ```
	*/
	exports.base64 = hasBase64Builtin ? {
		encode(b) {
			abytes(b);
			return b.toBase64();
		},
		decode(s) {
			return decodeBase64Builtin(s, false);
		}
	} : chain(radix2(6), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"), padding(6), join(""));
	/**
	* base64 from RFC 4648. No padding.
	* Use `base64` for padded version.
	* @example
	* ```js
	* base64nopad.encode(Uint8Array.from([0x12, 0xab]));
	* // => 'Eqs'
	* base64nopad.decode('Eqs');
	* // => Uint8Array.from([0x12, 0xab])
	* ```
	*/
	exports.base64nopad = chain(radix2(6), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"), join(""));
	/**
	* base64 from RFC 4648, using URL-safe alphabet. Padded.
	* Use `base64urlnopad` for unpadded version.
	* Falls back to built-in function, when available.
	* @example
	* ```js
	* base64url.encode(Uint8Array.from([0x12, 0xab]));
	* // => 'Eqs='
	* base64url.decode('Eqs=');
	* // => Uint8Array.from([0x12, 0xab])
	* ```
	*/
	exports.base64url = hasBase64Builtin ? {
		encode(b) {
			abytes(b);
			return b.toBase64({ alphabet: "base64url" });
		},
		decode(s) {
			return decodeBase64Builtin(s, true);
		}
	} : chain(radix2(6), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"), padding(6), join(""));
	/**
	* base64 from RFC 4648, using URL-safe alphabet. No padding.
	* Use `base64url` for padded version.
	* @example
	* ```js
	* base64urlnopad.encode(Uint8Array.from([0x12, 0xab]));
	* // => 'Eqs'
	* base64urlnopad.decode('Eqs');
	* // => Uint8Array.from([0x12, 0xab])
	* ```
	*/
	exports.base64urlnopad = chain(radix2(6), alphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"), join(""));
	var genBase58 = /* @__NO_SIDE_EFFECTS__ */ (abc) => chain(radix(58), alphabet(abc), join(""));
	/**
	* base58: base64 without ambigous characters +, /, 0, O, I, l.
	* Quadratic (O(n^2)) - so, can't be used on large inputs.
	* @example
	* ```js
	* base58.decode('01abcdef');
	* // => '3UhJW'
	* ```
	*/
	exports.base58 = /* @__PURE__ */ genBase58("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");
	/**
	* base58: flickr version. Check out `base58`.
	*/
	exports.base58flickr = /* @__PURE__ */ genBase58("123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ");
	/**
	* base58: XRP version. Check out `base58`.
	*/
	exports.base58xrp = /* @__PURE__ */ genBase58("rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz");
	var XMR_BLOCK_LEN = [
		0,
		2,
		3,
		5,
		6,
		7,
		9,
		10,
		11
	];
	/**
	* base58: XMR version. Check out `base58`.
	* Done in 8-byte blocks (which equals 11 chars in decoding). Last (non-full) block padded with '1' to size in XMR_BLOCK_LEN.
	* Block encoding significantly reduces quadratic complexity of base58.
	*/
	exports.base58xmr = {
		encode(data) {
			let res = "";
			for (let i = 0; i < data.length; i += 8) {
				const block = data.subarray(i, i + 8);
				res += exports.base58.encode(block).padStart(XMR_BLOCK_LEN[block.length], "1");
			}
			return res;
		},
		decode(str) {
			let res = [];
			for (let i = 0; i < str.length; i += 11) {
				const slice = str.slice(i, i + 11);
				const blockLen = XMR_BLOCK_LEN.indexOf(slice.length);
				const block = exports.base58.decode(slice);
				for (let j = 0; j < block.length - blockLen; j++) if (block[j] !== 0) throw new Error("base58xmr: wrong padding");
				res = res.concat(Array.from(block.slice(block.length - blockLen)));
			}
			return Uint8Array.from(res);
		}
	};
	/**
	* Method, which creates base58check encoder.
	* Requires function, calculating sha256.
	*/
	var createBase58check = (sha256) => chain(checksum(4, (data) => sha256(sha256(data))), exports.base58);
	exports.createBase58check = createBase58check;
	/**
	* Use `createBase58check` instead.
	* @deprecated
	*/
	exports.base58check = exports.createBase58check;
	var BECH_ALPHABET = chain(alphabet("qpzry9x8gf2tvdw0s3jn54khce6mua7l"), join(""));
	var POLYMOD_GENERATORS = [
		996825010,
		642813549,
		513874426,
		1027748829,
		705979059
	];
	function bech32Polymod(pre) {
		const b = pre >> 25;
		let chk = (pre & 33554431) << 5;
		for (let i = 0; i < POLYMOD_GENERATORS.length; i++) if ((b >> i & 1) === 1) chk ^= POLYMOD_GENERATORS[i];
		return chk;
	}
	function bechChecksum(prefix, words, encodingConst = 1) {
		const len = prefix.length;
		let chk = 1;
		for (let i = 0; i < len; i++) {
			const c = prefix.charCodeAt(i);
			if (c < 33 || c > 126) throw new Error(`Invalid prefix (${prefix})`);
			chk = bech32Polymod(chk) ^ c >> 5;
		}
		chk = bech32Polymod(chk);
		for (let i = 0; i < len; i++) chk = bech32Polymod(chk) ^ prefix.charCodeAt(i) & 31;
		for (let v of words) chk = bech32Polymod(chk) ^ v;
		for (let i = 0; i < 6; i++) chk = bech32Polymod(chk);
		chk ^= encodingConst;
		return BECH_ALPHABET.encode(convertRadix2([chk % powers[30]], 30, 5, false));
	}
	/**
	* @__NO_SIDE_EFFECTS__
	*/
	function genBech32(encoding) {
		const ENCODING_CONST = encoding === "bech32" ? 1 : 734539939;
		const _words = radix2(5);
		const fromWords = _words.decode;
		const toWords = _words.encode;
		const fromWordsUnsafe = unsafeWrapper(fromWords);
		function encode(prefix, words, limit = 90) {
			astr("bech32.encode prefix", prefix);
			if (isBytes(words)) words = Array.from(words);
			anumArr("bech32.encode", words);
			const plen = prefix.length;
			if (plen === 0) throw new TypeError(`Invalid prefix length ${plen}`);
			const actualLength = plen + 7 + words.length;
			if (limit !== false && actualLength > limit) throw new TypeError(`Length ${actualLength} exceeds limit ${limit}`);
			const lowered = prefix.toLowerCase();
			const sum = bechChecksum(lowered, words, ENCODING_CONST);
			return `${lowered}1${BECH_ALPHABET.encode(words)}${sum}`;
		}
		function decode(str, limit = 90) {
			astr("bech32.decode input", str);
			const slen = str.length;
			if (slen < 8 || limit !== false && slen > limit) throw new TypeError(`invalid string length: ${slen} (${str}). Expected (8..${limit})`);
			const lowered = str.toLowerCase();
			if (str !== lowered && str !== str.toUpperCase()) throw new Error(`String must be lowercase or uppercase`);
			const sepIndex = lowered.lastIndexOf("1");
			if (sepIndex === 0 || sepIndex === -1) throw new Error(`Letter "1" must be present between prefix and data only`);
			const prefix = lowered.slice(0, sepIndex);
			const data = lowered.slice(sepIndex + 1);
			if (data.length < 6) throw new Error("Data must be at least 6 characters long");
			const words = BECH_ALPHABET.decode(data).slice(0, -6);
			const sum = bechChecksum(prefix, words, ENCODING_CONST);
			if (!data.endsWith(sum)) throw new Error(`Invalid checksum in ${str}: expected "${sum}"`);
			return {
				prefix,
				words
			};
		}
		const decodeUnsafe = unsafeWrapper(decode);
		function decodeToBytes(str) {
			const { prefix, words } = decode(str, false);
			return {
				prefix,
				words,
				bytes: fromWords(words)
			};
		}
		function encodeFromBytes(prefix, bytes) {
			return encode(prefix, toWords(bytes));
		}
		return {
			encode,
			decode,
			encodeFromBytes,
			decodeToBytes,
			decodeUnsafe,
			fromWords,
			fromWordsUnsafe,
			toWords
		};
	}
	/**
	* bech32 from BIP 173. Operates on words.
	* For high-level, check out scure-btc-signer:
	* https://github.com/paulmillr/scure-btc-signer.
	*/
	exports.bech32 = genBech32("bech32");
	/**
	* bech32m from BIP 350. Operates on words.
	* It was to mitigate `bech32` weaknesses.
	* For high-level, check out scure-btc-signer:
	* https://github.com/paulmillr/scure-btc-signer.
	*/
	exports.bech32m = genBech32("bech32m");
	/**
	* UTF-8-to-byte decoder. Uses built-in TextDecoder / TextEncoder.
	* @example
	* ```js
	* const b = utf8.decode("hey"); // => new Uint8Array([ 104, 101, 121 ])
	* const str = utf8.encode(b); // "hey"
	* ```
	*/
	exports.utf8 = {
		encode: (data) => new TextDecoder().decode(data),
		decode: (str) => new TextEncoder().encode(str)
	};
	/**
	* hex string decoder. Uses built-in function, when available.
	* @example
	* ```js
	* const b = hex.decode("0102ff"); // => new Uint8Array([ 1, 2, 255 ])
	* const str = hex.encode(b); // "0102ff"
	* ```
	*/
	exports.hex = typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function" ? {
		encode(data) {
			abytes(data);
			return data.toHex();
		},
		decode(s) {
			astr("hex", s);
			return Uint8Array.fromHex(s);
		}
	} : chain(radix2(4), alphabet("0123456789abcdef"), join(""), normalize((s) => {
		if (typeof s !== "string" || s.length % 2 !== 0) throw new TypeError(`hex.decode: expected string, got ${typeof s} with length ${s.length}`);
		return s.toLowerCase();
	}));
	var CODERS = {
		utf8: exports.utf8,
		hex: exports.hex,
		base16: exports.base16,
		base32: exports.base32,
		base64: exports.base64,
		base64url: exports.base64url,
		base58: exports.base58,
		base58xmr: exports.base58xmr
	};
	var coderTypeError = "Invalid encoding type. Available types: utf8, hex, base16, base32, base64, base64url, base58, base58xmr";
	/** @deprecated */
	var bytesToString = (type, bytes) => {
		if (typeof type !== "string" || !CODERS.hasOwnProperty(type)) throw new TypeError(coderTypeError);
		if (!isBytes(bytes)) throw new TypeError("bytesToString() expects Uint8Array");
		return CODERS[type].encode(bytes);
	};
	exports.bytesToString = bytesToString;
	/** @deprecated */
	exports.str = exports.bytesToString;
	/** @deprecated */
	var stringToBytes = (type, str) => {
		if (!CODERS.hasOwnProperty(type)) throw new TypeError(coderTypeError);
		if (typeof str !== "string") throw new TypeError("stringToBytes() expects string");
		return CODERS[type].decode(str);
	};
	exports.stringToBytes = stringToBytes;
	/** @deprecated */
	exports.bytes = exports.stringToBytes;
}));
//#endregion
//#region node_modules/@scure/bip39/index.js
var require_bip39$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Audited & minimal JS implementation of
	* [BIP39 mnemonic phrases](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki).
	* @module
	* @example
	```js
	import * as bip39 from '@scure/bip39';
	import { wordlist } from '@scure/bip39/wordlists/english';
	const mn = bip39.generateMnemonic(wordlist);
	console.log(mn);
	const ent = bip39.mnemonicToEntropy(mn, wordlist)
	bip39.entropyToMnemonic(ent, wordlist);
	bip39.validateMnemonic(mn, wordlist);
	await bip39.mnemonicToSeed(mn, 'password');
	bip39.mnemonicToSeedSync(mn, 'password');
	
	// Wordlists
	import { wordlist as czech } from '@scure/bip39/wordlists/czech';
	import { wordlist as english } from '@scure/bip39/wordlists/english';
	import { wordlist as french } from '@scure/bip39/wordlists/french';
	import { wordlist as italian } from '@scure/bip39/wordlists/italian';
	import { wordlist as japanese } from '@scure/bip39/wordlists/japanese';
	import { wordlist as korean } from '@scure/bip39/wordlists/korean';
	import { wordlist as portuguese } from '@scure/bip39/wordlists/portuguese';
	import { wordlist as simplifiedChinese } from '@scure/bip39/wordlists/simplified-chinese';
	import { wordlist as spanish } from '@scure/bip39/wordlists/spanish';
	import { wordlist as traditionalChinese } from '@scure/bip39/wordlists/traditional-chinese';
	```
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.generateMnemonic = generateMnemonic;
	exports.mnemonicToEntropy = mnemonicToEntropy;
	exports.entropyToMnemonic = entropyToMnemonic;
	exports.validateMnemonic = validateMnemonic;
	exports.mnemonicToSeed = mnemonicToSeed;
	exports.mnemonicToSeedSync = mnemonicToSeedSync;
	/*! scure-bip39 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) */
	var pbkdf2_1 = require_pbkdf2();
	var sha2_1 = require_sha2();
	var utils_1 = require_utils$3();
	var base_1 = require_lib();
	var isJapanese = (wordlist) => wordlist[0] === "あいこくしん";
	function nfkd(str) {
		if (typeof str !== "string") throw new TypeError("invalid mnemonic type: " + typeof str);
		return str.normalize("NFKD");
	}
	function normalize(str) {
		const norm = nfkd(str);
		const words = norm.split(" ");
		if (![
			12,
			15,
			18,
			21,
			24
		].includes(words.length)) throw new Error("Invalid mnemonic");
		return {
			nfkd: norm,
			words
		};
	}
	function aentropy(ent) {
		(0, utils_1.abytes)(ent, 16, 20, 24, 28, 32);
	}
	/**
	* Generate x random words. Uses Cryptographically-Secure Random Number Generator.
	* @param wordlist imported wordlist for specific language
	* @param strength mnemonic strength 128-256 bits
	* @example
	* generateMnemonic(wordlist, 128)
	* // 'legal winner thank year wave sausage worth useful legal winner thank yellow'
	*/
	function generateMnemonic(wordlist, strength = 128) {
		(0, utils_1.anumber)(strength);
		if (strength % 32 !== 0 || strength > 256) throw new TypeError("Invalid entropy");
		return entropyToMnemonic((0, utils_1.randomBytes)(strength / 8), wordlist);
	}
	var calcChecksum = (entropy) => {
		const bitsLeft = 8 - entropy.length / 4;
		return new Uint8Array([(0, sha2_1.sha256)(entropy)[0] >> bitsLeft << bitsLeft]);
	};
	function getCoder(wordlist) {
		if (!Array.isArray(wordlist) || wordlist.length !== 2048 || typeof wordlist[0] !== "string") throw new Error("Wordlist: expected array of 2048 strings");
		wordlist.forEach((i) => {
			if (typeof i !== "string") throw new Error("wordlist: non-string element: " + i);
		});
		return base_1.utils.chain(base_1.utils.checksum(1, calcChecksum), base_1.utils.radix2(11, true), base_1.utils.alphabet(wordlist));
	}
	/**
	* Reversible: Converts mnemonic string to raw entropy in form of byte array.
	* @param mnemonic 12-24 words
	* @param wordlist imported wordlist for specific language
	* @example
	* const mnem = 'legal winner thank year wave sausage worth useful legal winner thank yellow';
	* mnemonicToEntropy(mnem, wordlist)
	* // Produces
	* new Uint8Array([
	*   0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f,
	*   0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f
	* ])
	*/
	function mnemonicToEntropy(mnemonic, wordlist) {
		const { words } = normalize(mnemonic);
		const entropy = getCoder(wordlist).decode(words);
		aentropy(entropy);
		return entropy;
	}
	/**
	* Reversible: Converts raw entropy in form of byte array to mnemonic string.
	* @param entropy byte array
	* @param wordlist imported wordlist for specific language
	* @returns 12-24 words
	* @example
	* const ent = new Uint8Array([
	*   0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f,
	*   0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f
	* ]);
	* entropyToMnemonic(ent, wordlist);
	* // 'legal winner thank year wave sausage worth useful legal winner thank yellow'
	*/
	function entropyToMnemonic(entropy, wordlist) {
		aentropy(entropy);
		return getCoder(wordlist).encode(entropy).join(isJapanese(wordlist) ? "　" : " ");
	}
	/**
	* Validates mnemonic for being 12-24 words contained in `wordlist`.
	*/
	function validateMnemonic(mnemonic, wordlist) {
		try {
			mnemonicToEntropy(mnemonic, wordlist);
		} catch (e) {
			return false;
		}
		return true;
	}
	var psalt = (passphrase) => nfkd("mnemonic" + passphrase);
	/**
	* Irreversible: Uses KDF to derive 64 bytes of key data from mnemonic + optional password.
	* @param mnemonic 12-24 words
	* @param passphrase string that will additionally protect the key
	* @returns 64 bytes of key data
	* @example
	* const mnem = 'legal winner thank year wave sausage worth useful legal winner thank yellow';
	* await mnemonicToSeed(mnem, 'password');
	* // new Uint8Array([...64 bytes])
	*/
	function mnemonicToSeed(mnemonic, passphrase = "") {
		return (0, pbkdf2_1.pbkdf2Async)(sha2_1.sha512, normalize(mnemonic).nfkd, psalt(passphrase), {
			c: 2048,
			dkLen: 64
		});
	}
	/**
	* Irreversible: Uses KDF to derive 64 bytes of key data from mnemonic + optional password.
	* @param mnemonic 12-24 words
	* @param passphrase string that will additionally protect the key
	* @returns 64 bytes of key data
	* @example
	* const mnem = 'legal winner thank year wave sausage worth useful legal winner thank yellow';
	* mnemonicToSeedSync(mnem, 'password');
	* // new Uint8Array([...64 bytes])
	*/
	function mnemonicToSeedSync(mnemonic, passphrase = "") {
		return (0, pbkdf2_1.pbkdf2)(sha2_1.sha512, normalize(mnemonic).nfkd, psalt(passphrase), {
			c: 2048,
			dkLen: 64
		});
	}
}));
//#endregion
//#region node_modules/@scure/bip39/wordlists/english.js
var require_english = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.wordlist = void 0;
	exports.wordlist = `abandon
ability
able
about
above
absent
absorb
abstract
absurd
abuse
access
accident
account
accuse
achieve
acid
acoustic
acquire
across
act
action
actor
actress
actual
adapt
add
addict
address
adjust
admit
adult
advance
advice
aerobic
affair
afford
afraid
again
age
agent
agree
ahead
aim
air
airport
aisle
alarm
album
alcohol
alert
alien
all
alley
allow
almost
alone
alpha
already
also
alter
always
amateur
amazing
among
amount
amused
analyst
anchor
ancient
anger
angle
angry
animal
ankle
announce
annual
another
answer
antenna
antique
anxiety
any
apart
apology
appear
apple
approve
april
arch
arctic
area
arena
argue
arm
armed
armor
army
around
arrange
arrest
arrive
arrow
art
artefact
artist
artwork
ask
aspect
assault
asset
assist
assume
asthma
athlete
atom
attack
attend
attitude
attract
auction
audit
august
aunt
author
auto
autumn
average
avocado
avoid
awake
aware
away
awesome
awful
awkward
axis
baby
bachelor
bacon
badge
bag
balance
balcony
ball
bamboo
banana
banner
bar
barely
bargain
barrel
base
basic
basket
battle
beach
bean
beauty
because
become
beef
before
begin
behave
behind
believe
below
belt
bench
benefit
best
betray
better
between
beyond
bicycle
bid
bike
bind
biology
bird
birth
bitter
black
blade
blame
blanket
blast
bleak
bless
blind
blood
blossom
blouse
blue
blur
blush
board
boat
body
boil
bomb
bone
bonus
book
boost
border
boring
borrow
boss
bottom
bounce
box
boy
bracket
brain
brand
brass
brave
bread
breeze
brick
bridge
brief
bright
bring
brisk
broccoli
broken
bronze
broom
brother
brown
brush
bubble
buddy
budget
buffalo
build
bulb
bulk
bullet
bundle
bunker
burden
burger
burst
bus
business
busy
butter
buyer
buzz
cabbage
cabin
cable
cactus
cage
cake
call
calm
camera
camp
can
canal
cancel
candy
cannon
canoe
canvas
canyon
capable
capital
captain
car
carbon
card
cargo
carpet
carry
cart
case
cash
casino
castle
casual
cat
catalog
catch
category
cattle
caught
cause
caution
cave
ceiling
celery
cement
census
century
cereal
certain
chair
chalk
champion
change
chaos
chapter
charge
chase
chat
cheap
check
cheese
chef
cherry
chest
chicken
chief
child
chimney
choice
choose
chronic
chuckle
chunk
churn
cigar
cinnamon
circle
citizen
city
civil
claim
clap
clarify
claw
clay
clean
clerk
clever
click
client
cliff
climb
clinic
clip
clock
clog
close
cloth
cloud
clown
club
clump
cluster
clutch
coach
coast
coconut
code
coffee
coil
coin
collect
color
column
combine
come
comfort
comic
common
company
concert
conduct
confirm
congress
connect
consider
control
convince
cook
cool
copper
copy
coral
core
corn
correct
cost
cotton
couch
country
couple
course
cousin
cover
coyote
crack
cradle
craft
cram
crane
crash
crater
crawl
crazy
cream
credit
creek
crew
cricket
crime
crisp
critic
crop
cross
crouch
crowd
crucial
cruel
cruise
crumble
crunch
crush
cry
crystal
cube
culture
cup
cupboard
curious
current
curtain
curve
cushion
custom
cute
cycle
dad
damage
damp
dance
danger
daring
dash
daughter
dawn
day
deal
debate
debris
decade
december
decide
decline
decorate
decrease
deer
defense
define
defy
degree
delay
deliver
demand
demise
denial
dentist
deny
depart
depend
deposit
depth
deputy
derive
describe
desert
design
desk
despair
destroy
detail
detect
develop
device
devote
diagram
dial
diamond
diary
dice
diesel
diet
differ
digital
dignity
dilemma
dinner
dinosaur
direct
dirt
disagree
discover
disease
dish
dismiss
disorder
display
distance
divert
divide
divorce
dizzy
doctor
document
dog
doll
dolphin
domain
donate
donkey
donor
door
dose
double
dove
draft
dragon
drama
drastic
draw
dream
dress
drift
drill
drink
drip
drive
drop
drum
dry
duck
dumb
dune
during
dust
dutch
duty
dwarf
dynamic
eager
eagle
early
earn
earth
easily
east
easy
echo
ecology
economy
edge
edit
educate
effort
egg
eight
either
elbow
elder
electric
elegant
element
elephant
elevator
elite
else
embark
embody
embrace
emerge
emotion
employ
empower
empty
enable
enact
end
endless
endorse
enemy
energy
enforce
engage
engine
enhance
enjoy
enlist
enough
enrich
enroll
ensure
enter
entire
entry
envelope
episode
equal
equip
era
erase
erode
erosion
error
erupt
escape
essay
essence
estate
eternal
ethics
evidence
evil
evoke
evolve
exact
example
excess
exchange
excite
exclude
excuse
execute
exercise
exhaust
exhibit
exile
exist
exit
exotic
expand
expect
expire
explain
expose
express
extend
extra
eye
eyebrow
fabric
face
faculty
fade
faint
faith
fall
false
fame
family
famous
fan
fancy
fantasy
farm
fashion
fat
fatal
father
fatigue
fault
favorite
feature
february
federal
fee
feed
feel
female
fence
festival
fetch
fever
few
fiber
fiction
field
figure
file
film
filter
final
find
fine
finger
finish
fire
firm
first
fiscal
fish
fit
fitness
fix
flag
flame
flash
flat
flavor
flee
flight
flip
float
flock
floor
flower
fluid
flush
fly
foam
focus
fog
foil
fold
follow
food
foot
force
forest
forget
fork
fortune
forum
forward
fossil
foster
found
fox
fragile
frame
frequent
fresh
friend
fringe
frog
front
frost
frown
frozen
fruit
fuel
fun
funny
furnace
fury
future
gadget
gain
galaxy
gallery
game
gap
garage
garbage
garden
garlic
garment
gas
gasp
gate
gather
gauge
gaze
general
genius
genre
gentle
genuine
gesture
ghost
giant
gift
giggle
ginger
giraffe
girl
give
glad
glance
glare
glass
glide
glimpse
globe
gloom
glory
glove
glow
glue
goat
goddess
gold
good
goose
gorilla
gospel
gossip
govern
gown
grab
grace
grain
grant
grape
grass
gravity
great
green
grid
grief
grit
grocery
group
grow
grunt
guard
guess
guide
guilt
guitar
gun
gym
habit
hair
half
hammer
hamster
hand
happy
harbor
hard
harsh
harvest
hat
have
hawk
hazard
head
health
heart
heavy
hedgehog
height
hello
helmet
help
hen
hero
hidden
high
hill
hint
hip
hire
history
hobby
hockey
hold
hole
holiday
hollow
home
honey
hood
hope
horn
horror
horse
hospital
host
hotel
hour
hover
hub
huge
human
humble
humor
hundred
hungry
hunt
hurdle
hurry
hurt
husband
hybrid
ice
icon
idea
identify
idle
ignore
ill
illegal
illness
image
imitate
immense
immune
impact
impose
improve
impulse
inch
include
income
increase
index
indicate
indoor
industry
infant
inflict
inform
inhale
inherit
initial
inject
injury
inmate
inner
innocent
input
inquiry
insane
insect
inside
inspire
install
intact
interest
into
invest
invite
involve
iron
island
isolate
issue
item
ivory
jacket
jaguar
jar
jazz
jealous
jeans
jelly
jewel
job
join
joke
journey
joy
judge
juice
jump
jungle
junior
junk
just
kangaroo
keen
keep
ketchup
key
kick
kid
kidney
kind
kingdom
kiss
kit
kitchen
kite
kitten
kiwi
knee
knife
knock
know
lab
label
labor
ladder
lady
lake
lamp
language
laptop
large
later
latin
laugh
laundry
lava
law
lawn
lawsuit
layer
lazy
leader
leaf
learn
leave
lecture
left
leg
legal
legend
leisure
lemon
lend
length
lens
leopard
lesson
letter
level
liar
liberty
library
license
life
lift
light
like
limb
limit
link
lion
liquid
list
little
live
lizard
load
loan
lobster
local
lock
logic
lonely
long
loop
lottery
loud
lounge
love
loyal
lucky
luggage
lumber
lunar
lunch
luxury
lyrics
machine
mad
magic
magnet
maid
mail
main
major
make
mammal
man
manage
mandate
mango
mansion
manual
maple
marble
march
margin
marine
market
marriage
mask
mass
master
match
material
math
matrix
matter
maximum
maze
meadow
mean
measure
meat
mechanic
medal
media
melody
melt
member
memory
mention
menu
mercy
merge
merit
merry
mesh
message
metal
method
middle
midnight
milk
million
mimic
mind
minimum
minor
minute
miracle
mirror
misery
miss
mistake
mix
mixed
mixture
mobile
model
modify
mom
moment
monitor
monkey
monster
month
moon
moral
more
morning
mosquito
mother
motion
motor
mountain
mouse
move
movie
much
muffin
mule
multiply
muscle
museum
mushroom
music
must
mutual
myself
mystery
myth
naive
name
napkin
narrow
nasty
nation
nature
near
neck
need
negative
neglect
neither
nephew
nerve
nest
net
network
neutral
never
news
next
nice
night
noble
noise
nominee
noodle
normal
north
nose
notable
note
nothing
notice
novel
now
nuclear
number
nurse
nut
oak
obey
object
oblige
obscure
observe
obtain
obvious
occur
ocean
october
odor
off
offer
office
often
oil
okay
old
olive
olympic
omit
once
one
onion
online
only
open
opera
opinion
oppose
option
orange
orbit
orchard
order
ordinary
organ
orient
original
orphan
ostrich
other
outdoor
outer
output
outside
oval
oven
over
own
owner
oxygen
oyster
ozone
pact
paddle
page
pair
palace
palm
panda
panel
panic
panther
paper
parade
parent
park
parrot
party
pass
patch
path
patient
patrol
pattern
pause
pave
payment
peace
peanut
pear
peasant
pelican
pen
penalty
pencil
people
pepper
perfect
permit
person
pet
phone
photo
phrase
physical
piano
picnic
picture
piece
pig
pigeon
pill
pilot
pink
pioneer
pipe
pistol
pitch
pizza
place
planet
plastic
plate
play
please
pledge
pluck
plug
plunge
poem
poet
point
polar
pole
police
pond
pony
pool
popular
portion
position
possible
post
potato
pottery
poverty
powder
power
practice
praise
predict
prefer
prepare
present
pretty
prevent
price
pride
primary
print
priority
prison
private
prize
problem
process
produce
profit
program
project
promote
proof
property
prosper
protect
proud
provide
public
pudding
pull
pulp
pulse
pumpkin
punch
pupil
puppy
purchase
purity
purpose
purse
push
put
puzzle
pyramid
quality
quantum
quarter
question
quick
quit
quiz
quote
rabbit
raccoon
race
rack
radar
radio
rail
rain
raise
rally
ramp
ranch
random
range
rapid
rare
rate
rather
raven
raw
razor
ready
real
reason
rebel
rebuild
recall
receive
recipe
record
recycle
reduce
reflect
reform
refuse
region
regret
regular
reject
relax
release
relief
rely
remain
remember
remind
remove
render
renew
rent
reopen
repair
repeat
replace
report
require
rescue
resemble
resist
resource
response
result
retire
retreat
return
reunion
reveal
review
reward
rhythm
rib
ribbon
rice
rich
ride
ridge
rifle
right
rigid
ring
riot
ripple
risk
ritual
rival
river
road
roast
robot
robust
rocket
romance
roof
rookie
room
rose
rotate
rough
round
route
royal
rubber
rude
rug
rule
run
runway
rural
sad
saddle
sadness
safe
sail
salad
salmon
salon
salt
salute
same
sample
sand
satisfy
satoshi
sauce
sausage
save
say
scale
scan
scare
scatter
scene
scheme
school
science
scissors
scorpion
scout
scrap
screen
script
scrub
sea
search
season
seat
second
secret
section
security
seed
seek
segment
select
sell
seminar
senior
sense
sentence
series
service
session
settle
setup
seven
shadow
shaft
shallow
share
shed
shell
sheriff
shield
shift
shine
ship
shiver
shock
shoe
shoot
shop
short
shoulder
shove
shrimp
shrug
shuffle
shy
sibling
sick
side
siege
sight
sign
silent
silk
silly
silver
similar
simple
since
sing
siren
sister
situate
six
size
skate
sketch
ski
skill
skin
skirt
skull
slab
slam
sleep
slender
slice
slide
slight
slim
slogan
slot
slow
slush
small
smart
smile
smoke
smooth
snack
snake
snap
sniff
snow
soap
soccer
social
sock
soda
soft
solar
soldier
solid
solution
solve
someone
song
soon
sorry
sort
soul
sound
soup
source
south
space
spare
spatial
spawn
speak
special
speed
spell
spend
sphere
spice
spider
spike
spin
spirit
split
spoil
sponsor
spoon
sport
spot
spray
spread
spring
spy
square
squeeze
squirrel
stable
stadium
staff
stage
stairs
stamp
stand
start
state
stay
steak
steel
stem
step
stereo
stick
still
sting
stock
stomach
stone
stool
story
stove
strategy
street
strike
strong
struggle
student
stuff
stumble
style
subject
submit
subway
success
such
sudden
suffer
sugar
suggest
suit
summer
sun
sunny
sunset
super
supply
supreme
sure
surface
surge
surprise
surround
survey
suspect
sustain
swallow
swamp
swap
swarm
swear
sweet
swift
swim
swing
switch
sword
symbol
symptom
syrup
system
table
tackle
tag
tail
talent
talk
tank
tape
target
task
taste
tattoo
taxi
teach
team
tell
ten
tenant
tennis
tent
term
test
text
thank
that
theme
then
theory
there
they
thing
this
thought
three
thrive
throw
thumb
thunder
ticket
tide
tiger
tilt
timber
time
tiny
tip
tired
tissue
title
toast
tobacco
today
toddler
toe
together
toilet
token
tomato
tomorrow
tone
tongue
tonight
tool
tooth
top
topic
topple
torch
tornado
tortoise
toss
total
tourist
toward
tower
town
toy
track
trade
traffic
tragic
train
transfer
trap
trash
travel
tray
treat
tree
trend
trial
tribe
trick
trigger
trim
trip
trophy
trouble
truck
true
truly
trumpet
trust
truth
try
tube
tuition
tumble
tuna
tunnel
turkey
turn
turtle
twelve
twenty
twice
twin
twist
two
type
typical
ugly
umbrella
unable
unaware
uncle
uncover
under
undo
unfair
unfold
unhappy
uniform
unique
unit
universe
unknown
unlock
until
unusual
unveil
update
upgrade
uphold
upon
upper
upset
urban
urge
usage
use
used
useful
useless
usual
utility
vacant
vacuum
vague
valid
valley
valve
van
vanish
vapor
various
vast
vault
vehicle
velvet
vendor
venture
venue
verb
verify
version
very
vessel
veteran
viable
vibrant
vicious
victory
video
view
village
vintage
violin
virtual
virus
visa
visit
visual
vital
vivid
vocal
voice
void
volcano
volume
vote
voyage
wage
wagon
wait
walk
wall
walnut
want
warfare
warm
warrior
wash
wasp
waste
water
wave
way
wealth
weapon
wear
weasel
weather
web
wedding
weekend
weird
welcome
west
wet
whale
what
wheat
wheel
when
where
whip
whisper
wide
width
wife
wild
will
win
window
wine
wing
wink
winner
winter
wire
wisdom
wise
wish
witness
wolf
woman
wonder
wood
wool
word
work
world
worry
worth
wrap
wreck
wrestle
wrist
write
wrong
yard
year
yellow
you
young
youth
zebra
zero
zone
zoo`.split("\n");
}));
//#endregion
//#region node_modules/@cosmjs/crypto/build/bip39.js
var require_bip39 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Bip39 = exports.EnglishMnemonic = void 0;
	var encoding_1 = require_build$4();
	var bip39_1 = require_bip39$1();
	var english_1 = require_english();
	var EnglishMnemonic = class {
		static wordlist = english_1.wordlist;
		data;
		constructor(mnemonic) {
			(0, bip39_1.mnemonicToEntropy)(mnemonic, english_1.wordlist);
			this.data = mnemonic;
		}
		toString() {
			return this.data;
		}
	};
	exports.EnglishMnemonic = EnglishMnemonic;
	var Bip39 = class {
		/**
		* Encodes raw entropy of length 16, 20, 24, 28 or 32 bytes as an English mnemonic between 12 and 24 words.
		*
		* | Entropy            | Words |
		* |--------------------|-------|
		* | 128 bit (16 bytes) |    12 |
		* | 160 bit (20 bytes) |    15 |
		* | 192 bit (24 bytes) |    18 |
		* | 224 bit (28 bytes) |    21 |
		* | 256 bit (32 bytes) |    24 |
		*
		*
		* @see https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki#generating-the-mnemonic
		* @param entropy The entropy to be encoded. This must be cryptographically secure.
		*/
		static encode(entropy) {
			return new EnglishMnemonic((0, bip39_1.entropyToMnemonic)(entropy, english_1.wordlist));
		}
		static decode(mnemonic) {
			return (0, encoding_1.fixUint8Array)((0, bip39_1.mnemonicToEntropy)(mnemonic.toString(), english_1.wordlist));
		}
		static async mnemonicToSeed(mnemonic, password) {
			return await (0, bip39_1.mnemonicToSeed)(mnemonic.toString(), password);
		}
	};
	exports.Bip39 = Bip39;
}));
//#endregion
//#region node_modules/@noble/curves/utils.js
var require_utils$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.notImplemented = exports.bitMask = exports.utf8ToBytes = exports.randomBytes = exports.isBytes = exports.hexToBytes = exports.concatBytes = exports.bytesToUtf8 = exports.bytesToHex = exports.anumber = exports.abytes = void 0;
	exports.abool = abool;
	exports._abool2 = _abool2;
	exports._abytes2 = _abytes2;
	exports.numberToHexUnpadded = numberToHexUnpadded;
	exports.hexToNumber = hexToNumber;
	exports.bytesToNumberBE = bytesToNumberBE;
	exports.bytesToNumberLE = bytesToNumberLE;
	exports.numberToBytesBE = numberToBytesBE;
	exports.numberToBytesLE = numberToBytesLE;
	exports.numberToVarBytesBE = numberToVarBytesBE;
	exports.ensureBytes = ensureBytes;
	exports.equalBytes = equalBytes;
	exports.copyBytes = copyBytes;
	exports.asciiToBytes = asciiToBytes;
	exports.inRange = inRange;
	exports.aInRange = aInRange;
	exports.bitLen = bitLen;
	exports.bitGet = bitGet;
	exports.bitSet = bitSet;
	exports.createHmacDrbg = createHmacDrbg;
	exports.validateObject = validateObject;
	exports.isHash = isHash;
	exports._validateObject = _validateObject;
	exports.memoized = memoized;
	/**
	* Hex, bytes and number utilities.
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var utils_js_1 = require_utils$3();
	var utils_js_2 = require_utils$3();
	Object.defineProperty(exports, "abytes", {
		enumerable: true,
		get: function() {
			return utils_js_2.abytes;
		}
	});
	Object.defineProperty(exports, "anumber", {
		enumerable: true,
		get: function() {
			return utils_js_2.anumber;
		}
	});
	Object.defineProperty(exports, "bytesToHex", {
		enumerable: true,
		get: function() {
			return utils_js_2.bytesToHex;
		}
	});
	Object.defineProperty(exports, "bytesToUtf8", {
		enumerable: true,
		get: function() {
			return utils_js_2.bytesToUtf8;
		}
	});
	Object.defineProperty(exports, "concatBytes", {
		enumerable: true,
		get: function() {
			return utils_js_2.concatBytes;
		}
	});
	Object.defineProperty(exports, "hexToBytes", {
		enumerable: true,
		get: function() {
			return utils_js_2.hexToBytes;
		}
	});
	Object.defineProperty(exports, "isBytes", {
		enumerable: true,
		get: function() {
			return utils_js_2.isBytes;
		}
	});
	Object.defineProperty(exports, "randomBytes", {
		enumerable: true,
		get: function() {
			return utils_js_2.randomBytes;
		}
	});
	Object.defineProperty(exports, "utf8ToBytes", {
		enumerable: true,
		get: function() {
			return utils_js_2.utf8ToBytes;
		}
	});
	var _0n = /* @__PURE__ */ BigInt(0);
	var _1n = /* @__PURE__ */ BigInt(1);
	function abool(title, value) {
		if (typeof value !== "boolean") throw new Error(title + " boolean expected, got " + value);
	}
	function _abool2(value, title = "") {
		if (typeof value !== "boolean") {
			const prefix = title && `"${title}"`;
			throw new Error(prefix + "expected boolean, got type=" + typeof value);
		}
		return value;
	}
	/** Asserts something is Uint8Array. */
	function _abytes2(value, length, title = "") {
		const bytes = (0, utils_js_1.isBytes)(value);
		const len = value?.length;
		const needsLen = length !== void 0;
		if (!bytes || needsLen && len !== length) {
			const prefix = title && `"${title}" `;
			const ofLen = needsLen ? ` of length ${length}` : "";
			const got = bytes ? `length=${len}` : `type=${typeof value}`;
			throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
		}
		return value;
	}
	function numberToHexUnpadded(num) {
		const hex = num.toString(16);
		return hex.length & 1 ? "0" + hex : hex;
	}
	function hexToNumber(hex) {
		if (typeof hex !== "string") throw new Error("hex string expected, got " + typeof hex);
		return hex === "" ? _0n : BigInt("0x" + hex);
	}
	function bytesToNumberBE(bytes) {
		return hexToNumber((0, utils_js_1.bytesToHex)(bytes));
	}
	function bytesToNumberLE(bytes) {
		(0, utils_js_1.abytes)(bytes);
		return hexToNumber((0, utils_js_1.bytesToHex)(Uint8Array.from(bytes).reverse()));
	}
	function numberToBytesBE(n, len) {
		return (0, utils_js_1.hexToBytes)(n.toString(16).padStart(len * 2, "0"));
	}
	function numberToBytesLE(n, len) {
		return numberToBytesBE(n, len).reverse();
	}
	function numberToVarBytesBE(n) {
		return (0, utils_js_1.hexToBytes)(numberToHexUnpadded(n));
	}
	/**
	* Takes hex string or Uint8Array, converts to Uint8Array.
	* Validates output length.
	* Will throw error for other types.
	* @param title descriptive title for an error e.g. 'secret key'
	* @param hex hex string or Uint8Array
	* @param expectedLength optional, will compare to result array's length
	* @returns
	*/
	function ensureBytes(title, hex, expectedLength) {
		let res;
		if (typeof hex === "string") try {
			res = (0, utils_js_1.hexToBytes)(hex);
		} catch (e) {
			throw new Error(title + " must be hex string or Uint8Array, cause: " + e);
		}
		else if ((0, utils_js_1.isBytes)(hex)) res = Uint8Array.from(hex);
		else throw new Error(title + " must be hex string or Uint8Array");
		const len = res.length;
		if (typeof expectedLength === "number" && len !== expectedLength) throw new Error(title + " of length " + expectedLength + " expected, got " + len);
		return res;
	}
	function equalBytes(a, b) {
		if (a.length !== b.length) return false;
		let diff = 0;
		for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
		return diff === 0;
	}
	/**
	* Copies Uint8Array. We can't use u8a.slice(), because u8a can be Buffer,
	* and Buffer#slice creates mutable copy. Never use Buffers!
	*/
	function copyBytes(bytes) {
		return Uint8Array.from(bytes);
	}
	/**
	* Decodes 7-bit ASCII string to Uint8Array, throws on non-ascii symbols
	* Should be safe to use for things expected to be ASCII.
	* Returns exact same result as utf8ToBytes for ASCII or throws.
	*/
	function asciiToBytes(ascii) {
		return Uint8Array.from(ascii, (c, i) => {
			const charCode = c.charCodeAt(0);
			if (c.length !== 1 || charCode > 127) throw new Error(`string contains non-ASCII character "${ascii[i]}" with code ${charCode} at position ${i}`);
			return charCode;
		});
	}
	/**
	* @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
	*/
	/**
	* Converts bytes to string using UTF8 encoding.
	* @example bytesToUtf8(Uint8Array.from([97, 98, 99])) // 'abc'
	*/
	var isPosBig = (n) => typeof n === "bigint" && _0n <= n;
	function inRange(n, min, max) {
		return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
	}
	/**
	* Asserts min <= n < max. NOTE: It's < max and not <= max.
	* @example
	* aInRange('x', x, 1n, 256n); // would assume x is in (1n..255n)
	*/
	function aInRange(title, n, min, max) {
		if (!inRange(n, min, max)) throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
	}
	/**
	* Calculates amount of bits in a bigint.
	* Same as `n.toString(2).length`
	* TODO: merge with nLength in modular
	*/
	function bitLen(n) {
		let len;
		for (len = 0; n > _0n; n >>= _1n, len += 1);
		return len;
	}
	/**
	* Gets single bit at position.
	* NOTE: first bit position is 0 (same as arrays)
	* Same as `!!+Array.from(n.toString(2)).reverse()[pos]`
	*/
	function bitGet(n, pos) {
		return n >> BigInt(pos) & _1n;
	}
	/**
	* Sets single bit at position.
	*/
	function bitSet(n, pos, value) {
		return n | (value ? _1n : _0n) << BigInt(pos);
	}
	/**
	* Calculate mask for N bits. Not using ** operator with bigints because of old engines.
	* Same as BigInt(`0b${Array(i).fill('1').join('')}`)
	*/
	var bitMask = (n) => (_1n << BigInt(n)) - _1n;
	exports.bitMask = bitMask;
	/**
	* Minimal HMAC-DRBG from NIST 800-90 for RFC6979 sigs.
	* @returns function that will call DRBG until 2nd arg returns something meaningful
	* @example
	*   const drbg = createHmacDRBG<Key>(32, 32, hmac);
	*   drbg(seed, bytesToKey); // bytesToKey must return Key or undefined
	*/
	function createHmacDrbg(hashLen, qByteLen, hmacFn) {
		if (typeof hashLen !== "number" || hashLen < 2) throw new Error("hashLen must be a number");
		if (typeof qByteLen !== "number" || qByteLen < 2) throw new Error("qByteLen must be a number");
		if (typeof hmacFn !== "function") throw new Error("hmacFn must be a function");
		const u8n = (len) => new Uint8Array(len);
		const u8of = (byte) => Uint8Array.of(byte);
		let v = u8n(hashLen);
		let k = u8n(hashLen);
		let i = 0;
		const reset = () => {
			v.fill(1);
			k.fill(0);
			i = 0;
		};
		const h = (...b) => hmacFn(k, v, ...b);
		const reseed = (seed = u8n(0)) => {
			k = h(u8of(0), seed);
			v = h();
			if (seed.length === 0) return;
			k = h(u8of(1), seed);
			v = h();
		};
		const gen = () => {
			if (i++ >= 1e3) throw new Error("drbg: tried 1000 values");
			let len = 0;
			const out = [];
			while (len < qByteLen) {
				v = h();
				const sl = v.slice();
				out.push(sl);
				len += v.length;
			}
			return (0, utils_js_1.concatBytes)(...out);
		};
		const genUntil = (seed, pred) => {
			reset();
			reseed(seed);
			let res = void 0;
			while (!(res = pred(gen()))) reseed();
			reset();
			return res;
		};
		return genUntil;
	}
	var validatorFns = {
		bigint: (val) => typeof val === "bigint",
		function: (val) => typeof val === "function",
		boolean: (val) => typeof val === "boolean",
		string: (val) => typeof val === "string",
		stringOrUint8Array: (val) => typeof val === "string" || (0, utils_js_1.isBytes)(val),
		isSafeInteger: (val) => Number.isSafeInteger(val),
		array: (val) => Array.isArray(val),
		field: (val, object) => object.Fp.isValid(val),
		hash: (val) => typeof val === "function" && Number.isSafeInteger(val.outputLen)
	};
	function validateObject(object, validators, optValidators = {}) {
		const checkField = (fieldName, type, isOptional) => {
			const checkVal = validatorFns[type];
			if (typeof checkVal !== "function") throw new Error("invalid validator function");
			const val = object[fieldName];
			if (isOptional && val === void 0) return;
			if (!checkVal(val, object)) throw new Error("param " + String(fieldName) + " is invalid. Expected " + type + ", got " + val);
		};
		for (const [fieldName, type] of Object.entries(validators)) checkField(fieldName, type, false);
		for (const [fieldName, type] of Object.entries(optValidators)) checkField(fieldName, type, true);
		return object;
	}
	function isHash(val) {
		return typeof val === "function" && Number.isSafeInteger(val.outputLen);
	}
	function _validateObject(object, fields, optFields = {}) {
		if (!object || typeof object !== "object") throw new Error("expected valid options object");
		function checkField(fieldName, expectedType, isOpt) {
			const val = object[fieldName];
			if (isOpt && val === void 0) return;
			const current = typeof val;
			if (current !== expectedType || val === null) throw new Error(`param "${fieldName}" is invalid: expected ${expectedType}, got ${current}`);
		}
		Object.entries(fields).forEach(([k, v]) => checkField(k, v, false));
		Object.entries(optFields).forEach(([k, v]) => checkField(k, v, true));
	}
	/**
	* throws not implemented error
	*/
	var notImplemented = () => {
		throw new Error("not implemented");
	};
	exports.notImplemented = notImplemented;
	/**
	* Memoizes (caches) computation result.
	* Uses WeakMap: the value is going auto-cleaned by GC after last reference is removed.
	*/
	function memoized(fn) {
		const map = /* @__PURE__ */ new WeakMap();
		return (arg, ...args) => {
			const val = map.get(arg);
			if (val !== void 0) return val;
			const computed = fn(arg, ...args);
			map.set(arg, computed);
			return computed;
		};
	}
}));
//#endregion
//#region node_modules/@noble/curves/abstract/modular.js
var require_modular = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isNegativeLE = void 0;
	exports.mod = mod;
	exports.pow = pow;
	exports.pow2 = pow2;
	exports.invert = invert;
	exports.tonelliShanks = tonelliShanks;
	exports.FpSqrt = FpSqrt;
	exports.validateField = validateField;
	exports.FpPow = FpPow;
	exports.FpInvertBatch = FpInvertBatch;
	exports.FpDiv = FpDiv;
	exports.FpLegendre = FpLegendre;
	exports.FpIsSquare = FpIsSquare;
	exports.nLength = nLength;
	exports.Field = Field;
	exports.FpSqrtOdd = FpSqrtOdd;
	exports.FpSqrtEven = FpSqrtEven;
	exports.hashToPrivateScalar = hashToPrivateScalar;
	exports.getFieldBytesLength = getFieldBytesLength;
	exports.getMinHashLength = getMinHashLength;
	exports.mapHashToField = mapHashToField;
	/**
	* Utils for modular division and fields.
	* Field over 11 is a finite (Galois) field is integer number operations `mod 11`.
	* There is no division: it is replaced by modular multiplicative inverse.
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var utils_ts_1 = require_utils$2();
	var _0n = BigInt(0), _1n = BigInt(1), _2n = /* @__PURE__ */ BigInt(2), _3n = /* @__PURE__ */ BigInt(3);
	var _4n = /* @__PURE__ */ BigInt(4), _5n = /* @__PURE__ */ BigInt(5), _7n = /* @__PURE__ */ BigInt(7);
	var _8n = /* @__PURE__ */ BigInt(8), _9n = /* @__PURE__ */ BigInt(9), _16n = /* @__PURE__ */ BigInt(16);
	function mod(a, b) {
		const result = a % b;
		return result >= _0n ? result : b + result;
	}
	/**
	* Efficiently raise num to power and do modular division.
	* Unsafe in some contexts: uses ladder, so can expose bigint bits.
	* @example
	* pow(2n, 6n, 11n) // 64n % 11n == 9n
	*/
	function pow(num, power, modulo) {
		return FpPow(Field(modulo), num, power);
	}
	/** Does `x^(2^power)` mod p. `pow2(30, 4)` == `30^(2^4)` */
	function pow2(x, power, modulo) {
		let res = x;
		while (power-- > _0n) {
			res *= res;
			res %= modulo;
		}
		return res;
	}
	/**
	* Inverses number over modulo.
	* Implemented using [Euclidean GCD](https://brilliant.org/wiki/extended-euclidean-algorithm/).
	*/
	function invert(number, modulo) {
		if (number === _0n) throw new Error("invert: expected non-zero number");
		if (modulo <= _0n) throw new Error("invert: expected positive modulus, got " + modulo);
		let a = mod(number, modulo);
		let b = modulo;
		let x = _0n, y = _1n, u = _1n, v = _0n;
		while (a !== _0n) {
			const q = b / a;
			const r = b % a;
			const m = x - u * q;
			const n = y - v * q;
			b = a, a = r, x = u, y = v, u = m, v = n;
		}
		if (b !== _1n) throw new Error("invert: does not exist");
		return mod(x, modulo);
	}
	function assertIsSquare(Fp, root, n) {
		if (!Fp.eql(Fp.sqr(root), n)) throw new Error("Cannot find square root");
	}
	function sqrt3mod4(Fp, n) {
		const p1div4 = (Fp.ORDER + _1n) / _4n;
		const root = Fp.pow(n, p1div4);
		assertIsSquare(Fp, root, n);
		return root;
	}
	function sqrt5mod8(Fp, n) {
		const p5div8 = (Fp.ORDER - _5n) / _8n;
		const n2 = Fp.mul(n, _2n);
		const v = Fp.pow(n2, p5div8);
		const nv = Fp.mul(n, v);
		const i = Fp.mul(Fp.mul(nv, _2n), v);
		const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
		assertIsSquare(Fp, root, n);
		return root;
	}
	function sqrt9mod16(P) {
		const Fp_ = Field(P);
		const tn = tonelliShanks(P);
		const c1 = tn(Fp_, Fp_.neg(Fp_.ONE));
		const c2 = tn(Fp_, c1);
		const c3 = tn(Fp_, Fp_.neg(c1));
		const c4 = (P + _7n) / _16n;
		return (Fp, n) => {
			let tv1 = Fp.pow(n, c4);
			let tv2 = Fp.mul(tv1, c1);
			const tv3 = Fp.mul(tv1, c2);
			const tv4 = Fp.mul(tv1, c3);
			const e1 = Fp.eql(Fp.sqr(tv2), n);
			const e2 = Fp.eql(Fp.sqr(tv3), n);
			tv1 = Fp.cmov(tv1, tv2, e1);
			tv2 = Fp.cmov(tv4, tv3, e2);
			const e3 = Fp.eql(Fp.sqr(tv2), n);
			const root = Fp.cmov(tv1, tv2, e3);
			assertIsSquare(Fp, root, n);
			return root;
		};
	}
	/**
	* Tonelli-Shanks square root search algorithm.
	* 1. https://eprint.iacr.org/2012/685.pdf (page 12)
	* 2. Square Roots from 1; 24, 51, 10 to Dan Shanks
	* @param P field order
	* @returns function that takes field Fp (created from P) and number n
	*/
	function tonelliShanks(P) {
		if (P < _3n) throw new Error("sqrt is not defined for small field");
		let Q = P - _1n;
		let S = 0;
		while (Q % _2n === _0n) {
			Q /= _2n;
			S++;
		}
		let Z = _2n;
		const _Fp = Field(P);
		while (FpLegendre(_Fp, Z) === 1) if (Z++ > 1e3) throw new Error("Cannot find square root: probably non-prime P");
		if (S === 1) return sqrt3mod4;
		let cc = _Fp.pow(Z, Q);
		const Q1div2 = (Q + _1n) / _2n;
		return function tonelliSlow(Fp, n) {
			if (Fp.is0(n)) return n;
			if (FpLegendre(Fp, n) !== 1) throw new Error("Cannot find square root");
			let M = S;
			let c = Fp.mul(Fp.ONE, cc);
			let t = Fp.pow(n, Q);
			let R = Fp.pow(n, Q1div2);
			while (!Fp.eql(t, Fp.ONE)) {
				if (Fp.is0(t)) return Fp.ZERO;
				let i = 1;
				let t_tmp = Fp.sqr(t);
				while (!Fp.eql(t_tmp, Fp.ONE)) {
					i++;
					t_tmp = Fp.sqr(t_tmp);
					if (i === M) throw new Error("Cannot find square root");
				}
				const exponent = _1n << BigInt(M - i - 1);
				const b = Fp.pow(c, exponent);
				M = i;
				c = Fp.sqr(b);
				t = Fp.mul(t, c);
				R = Fp.mul(R, b);
			}
			return R;
		};
	}
	/**
	* Square root for a finite field. Will try optimized versions first:
	*
	* 1. P ≡ 3 (mod 4)
	* 2. P ≡ 5 (mod 8)
	* 3. P ≡ 9 (mod 16)
	* 4. Tonelli-Shanks algorithm
	*
	* Different algorithms can give different roots, it is up to user to decide which one they want.
	* For example there is FpSqrtOdd/FpSqrtEven to choice root based on oddness (used for hash-to-curve).
	*/
	function FpSqrt(P) {
		if (P % _4n === _3n) return sqrt3mod4;
		if (P % _8n === _5n) return sqrt5mod8;
		if (P % _16n === _9n) return sqrt9mod16(P);
		return tonelliShanks(P);
	}
	var isNegativeLE = (num, modulo) => (mod(num, modulo) & _1n) === _1n;
	exports.isNegativeLE = isNegativeLE;
	var FIELD_FIELDS = [
		"create",
		"isValid",
		"is0",
		"neg",
		"inv",
		"sqrt",
		"sqr",
		"eql",
		"add",
		"sub",
		"mul",
		"pow",
		"div",
		"addN",
		"subN",
		"mulN",
		"sqrN"
	];
	function validateField(field) {
		const opts = FIELD_FIELDS.reduce((map, val) => {
			map[val] = "function";
			return map;
		}, {
			ORDER: "bigint",
			MASK: "bigint",
			BYTES: "number",
			BITS: "number"
		});
		(0, utils_ts_1._validateObject)(field, opts);
		return field;
	}
	/**
	* Same as `pow` but for Fp: non-constant-time.
	* Unsafe in some contexts: uses ladder, so can expose bigint bits.
	*/
	function FpPow(Fp, num, power) {
		if (power < _0n) throw new Error("invalid exponent, negatives unsupported");
		if (power === _0n) return Fp.ONE;
		if (power === _1n) return num;
		let p = Fp.ONE;
		let d = num;
		while (power > _0n) {
			if (power & _1n) p = Fp.mul(p, d);
			d = Fp.sqr(d);
			power >>= _1n;
		}
		return p;
	}
	/**
	* Efficiently invert an array of Field elements.
	* Exception-free. Will return `undefined` for 0 elements.
	* @param passZero map 0 to 0 (instead of undefined)
	*/
	function FpInvertBatch(Fp, nums, passZero = false) {
		const inverted = new Array(nums.length).fill(passZero ? Fp.ZERO : void 0);
		const multipliedAcc = nums.reduce((acc, num, i) => {
			if (Fp.is0(num)) return acc;
			inverted[i] = acc;
			return Fp.mul(acc, num);
		}, Fp.ONE);
		const invertedAcc = Fp.inv(multipliedAcc);
		nums.reduceRight((acc, num, i) => {
			if (Fp.is0(num)) return acc;
			inverted[i] = Fp.mul(acc, inverted[i]);
			return Fp.mul(acc, num);
		}, invertedAcc);
		return inverted;
	}
	function FpDiv(Fp, lhs, rhs) {
		return Fp.mul(lhs, typeof rhs === "bigint" ? invert(rhs, Fp.ORDER) : Fp.inv(rhs));
	}
	/**
	* Legendre symbol.
	* Legendre constant is used to calculate Legendre symbol (a | p)
	* which denotes the value of a^((p-1)/2) (mod p).
	*
	* * (a | p) ≡ 1    if a is a square (mod p), quadratic residue
	* * (a | p) ≡ -1   if a is not a square (mod p), quadratic non residue
	* * (a | p) ≡ 0    if a ≡ 0 (mod p)
	*/
	function FpLegendre(Fp, n) {
		const p1mod2 = (Fp.ORDER - _1n) / _2n;
		const powered = Fp.pow(n, p1mod2);
		const yes = Fp.eql(powered, Fp.ONE);
		const zero = Fp.eql(powered, Fp.ZERO);
		const no = Fp.eql(powered, Fp.neg(Fp.ONE));
		if (!yes && !zero && !no) throw new Error("invalid Legendre symbol result");
		return yes ? 1 : zero ? 0 : -1;
	}
	function FpIsSquare(Fp, n) {
		return FpLegendre(Fp, n) === 1;
	}
	function nLength(n, nBitLength) {
		if (nBitLength !== void 0) (0, utils_ts_1.anumber)(nBitLength);
		const _nBitLength = nBitLength !== void 0 ? nBitLength : n.toString(2).length;
		return {
			nBitLength: _nBitLength,
			nByteLength: Math.ceil(_nBitLength / 8)
		};
	}
	/**
	* Creates a finite field. Major performance optimizations:
	* * 1. Denormalized operations like mulN instead of mul.
	* * 2. Identical object shape: never add or remove keys.
	* * 3. `Object.freeze`.
	* Fragile: always run a benchmark on a change.
	* Security note: operations don't check 'isValid' for all elements for performance reasons,
	* it is caller responsibility to check this.
	* This is low-level code, please make sure you know what you're doing.
	*
	* Note about field properties:
	* * CHARACTERISTIC p = prime number, number of elements in main subgroup.
	* * ORDER q = similar to cofactor in curves, may be composite `q = p^m`.
	*
	* @param ORDER field order, probably prime, or could be composite
	* @param bitLen how many bits the field consumes
	* @param isLE (default: false) if encoding / decoding should be in little-endian
	* @param redef optional faster redefinitions of sqrt and other methods
	*/
	function Field(ORDER, bitLenOrOpts, isLE = false, opts = {}) {
		if (ORDER <= _0n) throw new Error("invalid field: expected ORDER > 0, got " + ORDER);
		let _nbitLength = void 0;
		let _sqrt = void 0;
		let modFromBytes = false;
		let allowedLengths = void 0;
		if (typeof bitLenOrOpts === "object" && bitLenOrOpts != null) {
			if (opts.sqrt || isLE) throw new Error("cannot specify opts in two arguments");
			const _opts = bitLenOrOpts;
			if (_opts.BITS) _nbitLength = _opts.BITS;
			if (_opts.sqrt) _sqrt = _opts.sqrt;
			if (typeof _opts.isLE === "boolean") isLE = _opts.isLE;
			if (typeof _opts.modFromBytes === "boolean") modFromBytes = _opts.modFromBytes;
			allowedLengths = _opts.allowedLengths;
		} else {
			if (typeof bitLenOrOpts === "number") _nbitLength = bitLenOrOpts;
			if (opts.sqrt) _sqrt = opts.sqrt;
		}
		const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, _nbitLength);
		if (BYTES > 2048) throw new Error("invalid field: expected ORDER of <= 2048 bytes");
		let sqrtP;
		const f = Object.freeze({
			ORDER,
			isLE,
			BITS,
			BYTES,
			MASK: (0, utils_ts_1.bitMask)(BITS),
			ZERO: _0n,
			ONE: _1n,
			allowedLengths,
			create: (num) => mod(num, ORDER),
			isValid: (num) => {
				if (typeof num !== "bigint") throw new Error("invalid field element: expected bigint, got " + typeof num);
				return _0n <= num && num < ORDER;
			},
			is0: (num) => num === _0n,
			isValidNot0: (num) => !f.is0(num) && f.isValid(num),
			isOdd: (num) => (num & _1n) === _1n,
			neg: (num) => mod(-num, ORDER),
			eql: (lhs, rhs) => lhs === rhs,
			sqr: (num) => mod(num * num, ORDER),
			add: (lhs, rhs) => mod(lhs + rhs, ORDER),
			sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
			mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
			pow: (num, power) => FpPow(f, num, power),
			div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
			sqrN: (num) => num * num,
			addN: (lhs, rhs) => lhs + rhs,
			subN: (lhs, rhs) => lhs - rhs,
			mulN: (lhs, rhs) => lhs * rhs,
			inv: (num) => invert(num, ORDER),
			sqrt: _sqrt || ((n) => {
				if (!sqrtP) sqrtP = FpSqrt(ORDER);
				return sqrtP(f, n);
			}),
			toBytes: (num) => isLE ? (0, utils_ts_1.numberToBytesLE)(num, BYTES) : (0, utils_ts_1.numberToBytesBE)(num, BYTES),
			fromBytes: (bytes, skipValidation = true) => {
				if (allowedLengths) {
					if (!allowedLengths.includes(bytes.length) || bytes.length > BYTES) throw new Error("Field.fromBytes: expected " + allowedLengths + " bytes, got " + bytes.length);
					const padded = new Uint8Array(BYTES);
					padded.set(bytes, isLE ? 0 : padded.length - bytes.length);
					bytes = padded;
				}
				if (bytes.length !== BYTES) throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
				let scalar = isLE ? (0, utils_ts_1.bytesToNumberLE)(bytes) : (0, utils_ts_1.bytesToNumberBE)(bytes);
				if (modFromBytes) scalar = mod(scalar, ORDER);
				if (!skipValidation) {
					if (!f.isValid(scalar)) throw new Error("invalid field element: outside of range 0..ORDER");
				}
				return scalar;
			},
			invertBatch: (lst) => FpInvertBatch(f, lst),
			cmov: (a, b, c) => c ? b : a
		});
		return Object.freeze(f);
	}
	function FpSqrtOdd(Fp, elm) {
		if (!Fp.isOdd) throw new Error("Field doesn't have isOdd");
		const root = Fp.sqrt(elm);
		return Fp.isOdd(root) ? root : Fp.neg(root);
	}
	function FpSqrtEven(Fp, elm) {
		if (!Fp.isOdd) throw new Error("Field doesn't have isOdd");
		const root = Fp.sqrt(elm);
		return Fp.isOdd(root) ? Fp.neg(root) : root;
	}
	/**
	* "Constant-time" private key generation utility.
	* Same as mapKeyToField, but accepts less bytes (40 instead of 48 for 32-byte field).
	* Which makes it slightly more biased, less secure.
	* @deprecated use `mapKeyToField` instead
	*/
	function hashToPrivateScalar(hash, groupOrder, isLE = false) {
		hash = (0, utils_ts_1.ensureBytes)("privateHash", hash);
		const hashLen = hash.length;
		const minLen = nLength(groupOrder).nByteLength + 8;
		if (minLen < 24 || hashLen < minLen || hashLen > 1024) throw new Error("hashToPrivateScalar: expected " + minLen + "-1024 bytes of input, got " + hashLen);
		return mod(isLE ? (0, utils_ts_1.bytesToNumberLE)(hash) : (0, utils_ts_1.bytesToNumberBE)(hash), groupOrder - _1n) + _1n;
	}
	/**
	* Returns total number of bytes consumed by the field element.
	* For example, 32 bytes for usual 256-bit weierstrass curve.
	* @param fieldOrder number of field elements, usually CURVE.n
	* @returns byte length of field
	*/
	function getFieldBytesLength(fieldOrder) {
		if (typeof fieldOrder !== "bigint") throw new Error("field order must be bigint");
		const bitLength = fieldOrder.toString(2).length;
		return Math.ceil(bitLength / 8);
	}
	/**
	* Returns minimal amount of bytes that can be safely reduced
	* by field order.
	* Should be 2^-128 for 128-bit curve such as P256.
	* @param fieldOrder number of field elements, usually CURVE.n
	* @returns byte length of target hash
	*/
	function getMinHashLength(fieldOrder) {
		const length = getFieldBytesLength(fieldOrder);
		return length + Math.ceil(length / 2);
	}
	/**
	* "Constant-time" private key generation utility.
	* Can take (n + n/2) or more bytes of uniform input e.g. from CSPRNG or KDF
	* and convert them into private scalar, with the modulo bias being negligible.
	* Needs at least 48 bytes of input for 32-byte private key.
	* https://research.kudelskisecurity.com/2020/07/28/the-definitive-guide-to-modulo-bias-and-how-to-avoid-it/
	* FIPS 186-5, A.2 https://csrc.nist.gov/publications/detail/fips/186/5/final
	* RFC 9380, https://www.rfc-editor.org/rfc/rfc9380#section-5
	* @param hash hash output from SHA3 or a similar function
	* @param groupOrder size of subgroup - (e.g. secp256k1.CURVE.n)
	* @param isLE interpret hash bytes as LE num
	* @returns valid private scalar
	*/
	function mapHashToField(key, fieldOrder, isLE = false) {
		const len = key.length;
		const fieldLen = getFieldBytesLength(fieldOrder);
		const minLen = getMinHashLength(fieldOrder);
		if (len < 16 || len < minLen || len > 1024) throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
		const reduced = mod(isLE ? (0, utils_ts_1.bytesToNumberLE)(key) : (0, utils_ts_1.bytesToNumberBE)(key), fieldOrder - _1n) + _1n;
		return isLE ? (0, utils_ts_1.numberToBytesLE)(reduced, fieldLen) : (0, utils_ts_1.numberToBytesBE)(reduced, fieldLen);
	}
}));
//#endregion
//#region node_modules/@noble/curves/abstract/curve.js
var require_curve = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.wNAF = void 0;
	exports.negateCt = negateCt;
	exports.normalizeZ = normalizeZ;
	exports.mulEndoUnsafe = mulEndoUnsafe;
	exports.pippenger = pippenger;
	exports.precomputeMSMUnsafe = precomputeMSMUnsafe;
	exports.validateBasic = validateBasic;
	exports._createCurveFields = _createCurveFields;
	/**
	* Methods for elliptic curve multiplication by scalars.
	* Contains wNAF, pippenger.
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var utils_ts_1 = require_utils$2();
	var modular_ts_1 = require_modular();
	var _0n = BigInt(0);
	var _1n = BigInt(1);
	function negateCt(condition, item) {
		const neg = item.negate();
		return condition ? neg : item;
	}
	/**
	* Takes a bunch of Projective Points but executes only one
	* inversion on all of them. Inversion is very slow operation,
	* so this improves performance massively.
	* Optimization: converts a list of projective points to a list of identical points with Z=1.
	*/
	function normalizeZ(c, points) {
		const invertedZs = (0, modular_ts_1.FpInvertBatch)(c.Fp, points.map((p) => p.Z));
		return points.map((p, i) => c.fromAffine(p.toAffine(invertedZs[i])));
	}
	function validateW(W, bits) {
		if (!Number.isSafeInteger(W) || W <= 0 || W > bits) throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
	}
	function calcWOpts(W, scalarBits) {
		validateW(W, scalarBits);
		const windows = Math.ceil(scalarBits / W) + 1;
		const windowSize = 2 ** (W - 1);
		const maxNumber = 2 ** W;
		return {
			windows,
			windowSize,
			mask: (0, utils_ts_1.bitMask)(W),
			maxNumber,
			shiftBy: BigInt(W)
		};
	}
	function calcOffsets(n, window, wOpts) {
		const { windowSize, mask, maxNumber, shiftBy } = wOpts;
		let wbits = Number(n & mask);
		let nextN = n >> shiftBy;
		if (wbits > windowSize) {
			wbits -= maxNumber;
			nextN += _1n;
		}
		const offsetStart = window * windowSize;
		const offset = offsetStart + Math.abs(wbits) - 1;
		const isZero = wbits === 0;
		const isNeg = wbits < 0;
		const isNegF = window % 2 !== 0;
		return {
			nextN,
			offset,
			isZero,
			isNeg,
			isNegF,
			offsetF: offsetStart
		};
	}
	function validateMSMPoints(points, c) {
		if (!Array.isArray(points)) throw new Error("array expected");
		points.forEach((p, i) => {
			if (!(p instanceof c)) throw new Error("invalid point at index " + i);
		});
	}
	function validateMSMScalars(scalars, field) {
		if (!Array.isArray(scalars)) throw new Error("array of scalars expected");
		scalars.forEach((s, i) => {
			if (!field.isValid(s)) throw new Error("invalid scalar at index " + i);
		});
	}
	var pointPrecomputes = /* @__PURE__ */ new WeakMap();
	var pointWindowSizes = /* @__PURE__ */ new WeakMap();
	function getW(P) {
		return pointWindowSizes.get(P) || 1;
	}
	function assert0(n) {
		if (n !== _0n) throw new Error("invalid wNAF");
	}
	/**
	* Elliptic curve multiplication of Point by scalar. Fragile.
	* Table generation takes **30MB of ram and 10ms on high-end CPU**,
	* but may take much longer on slow devices. Actual generation will happen on
	* first call of `multiply()`. By default, `BASE` point is precomputed.
	*
	* Scalars should always be less than curve order: this should be checked inside of a curve itself.
	* Creates precomputation tables for fast multiplication:
	* - private scalar is split by fixed size windows of W bits
	* - every window point is collected from window's table & added to accumulator
	* - since windows are different, same point inside tables won't be accessed more than once per calc
	* - each multiplication is 'Math.ceil(CURVE_ORDER / 𝑊) + 1' point additions (fixed for any scalar)
	* - +1 window is neccessary for wNAF
	* - wNAF reduces table size: 2x less memory + 2x faster generation, but 10% slower multiplication
	*
	* @todo Research returning 2d JS array of windows, instead of a single window.
	* This would allow windows to be in different memory locations
	*/
	var wNAF = class {
		constructor(Point, bits) {
			this.BASE = Point.BASE;
			this.ZERO = Point.ZERO;
			this.Fn = Point.Fn;
			this.bits = bits;
		}
		_unsafeLadder(elm, n, p = this.ZERO) {
			let d = elm;
			while (n > _0n) {
				if (n & _1n) p = p.add(d);
				d = d.double();
				n >>= _1n;
			}
			return p;
		}
		/**
		* Creates a wNAF precomputation window. Used for caching.
		* Default window size is set by `utils.precompute()` and is equal to 8.
		* Number of precomputed points depends on the curve size:
		* 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
		* - 𝑊 is the window size
		* - 𝑛 is the bitlength of the curve order.
		* For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
		* @param point Point instance
		* @param W window size
		* @returns precomputed point tables flattened to a single array
		*/
		precomputeWindow(point, W) {
			const { windows, windowSize } = calcWOpts(W, this.bits);
			const points = [];
			let p = point;
			let base = p;
			for (let window = 0; window < windows; window++) {
				base = p;
				points.push(base);
				for (let i = 1; i < windowSize; i++) {
					base = base.add(p);
					points.push(base);
				}
				p = base.double();
			}
			return points;
		}
		/**
		* Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
		* More compact implementation:
		* https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
		* @returns real and fake (for const-time) points
		*/
		wNAF(W, precomputes, n) {
			if (!this.Fn.isValid(n)) throw new Error("invalid scalar");
			let p = this.ZERO;
			let f = this.BASE;
			const wo = calcWOpts(W, this.bits);
			for (let window = 0; window < wo.windows; window++) {
				const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n, window, wo);
				n = nextN;
				if (isZero) f = f.add(negateCt(isNegF, precomputes[offsetF]));
				else p = p.add(negateCt(isNeg, precomputes[offset]));
			}
			assert0(n);
			return {
				p,
				f
			};
		}
		/**
		* Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
		* @param acc accumulator point to add result of multiplication
		* @returns point
		*/
		wNAFUnsafe(W, precomputes, n, acc = this.ZERO) {
			const wo = calcWOpts(W, this.bits);
			for (let window = 0; window < wo.windows; window++) {
				if (n === _0n) break;
				const { nextN, offset, isZero, isNeg } = calcOffsets(n, window, wo);
				n = nextN;
				if (isZero) continue;
				else {
					const item = precomputes[offset];
					acc = acc.add(isNeg ? item.negate() : item);
				}
			}
			assert0(n);
			return acc;
		}
		getPrecomputes(W, point, transform) {
			let comp = pointPrecomputes.get(point);
			if (!comp) {
				comp = this.precomputeWindow(point, W);
				if (W !== 1) {
					if (typeof transform === "function") comp = transform(comp);
					pointPrecomputes.set(point, comp);
				}
			}
			return comp;
		}
		cached(point, scalar, transform) {
			const W = getW(point);
			return this.wNAF(W, this.getPrecomputes(W, point, transform), scalar);
		}
		unsafe(point, scalar, transform, prev) {
			const W = getW(point);
			if (W === 1) return this._unsafeLadder(point, scalar, prev);
			return this.wNAFUnsafe(W, this.getPrecomputes(W, point, transform), scalar, prev);
		}
		createCache(P, W) {
			validateW(W, this.bits);
			pointWindowSizes.set(P, W);
			pointPrecomputes.delete(P);
		}
		hasCache(elm) {
			return getW(elm) !== 1;
		}
	};
	exports.wNAF = wNAF;
	/**
	* Endomorphism-specific multiplication for Koblitz curves.
	* Cost: 128 dbl, 0-256 adds.
	*/
	function mulEndoUnsafe(Point, point, k1, k2) {
		let acc = point;
		let p1 = Point.ZERO;
		let p2 = Point.ZERO;
		while (k1 > _0n || k2 > _0n) {
			if (k1 & _1n) p1 = p1.add(acc);
			if (k2 & _1n) p2 = p2.add(acc);
			acc = acc.double();
			k1 >>= _1n;
			k2 >>= _1n;
		}
		return {
			p1,
			p2
		};
	}
	/**
	* Pippenger algorithm for multi-scalar multiplication (MSM, Pa + Qb + Rc + ...).
	* 30x faster vs naive addition on L=4096, 10x faster than precomputes.
	* For N=254bit, L=1, it does: 1024 ADD + 254 DBL. For L=5: 1536 ADD + 254 DBL.
	* Algorithmically constant-time (for same L), even when 1 point + scalar, or when scalar = 0.
	* @param c Curve Point constructor
	* @param fieldN field over CURVE.N - important that it's not over CURVE.P
	* @param points array of L curve points
	* @param scalars array of L scalars (aka secret keys / bigints)
	*/
	function pippenger(c, fieldN, points, scalars) {
		validateMSMPoints(points, c);
		validateMSMScalars(scalars, fieldN);
		const plength = points.length;
		const slength = scalars.length;
		if (plength !== slength) throw new Error("arrays of points and scalars must have equal length");
		const zero = c.ZERO;
		const wbits = (0, utils_ts_1.bitLen)(BigInt(plength));
		let windowSize = 1;
		if (wbits > 12) windowSize = wbits - 3;
		else if (wbits > 4) windowSize = wbits - 2;
		else if (wbits > 0) windowSize = 2;
		const MASK = (0, utils_ts_1.bitMask)(windowSize);
		const buckets = new Array(Number(MASK) + 1).fill(zero);
		const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize;
		let sum = zero;
		for (let i = lastBits; i >= 0; i -= windowSize) {
			buckets.fill(zero);
			for (let j = 0; j < slength; j++) {
				const scalar = scalars[j];
				const wbits = Number(scalar >> BigInt(i) & MASK);
				buckets[wbits] = buckets[wbits].add(points[j]);
			}
			let resI = zero;
			for (let j = buckets.length - 1, sumI = zero; j > 0; j--) {
				sumI = sumI.add(buckets[j]);
				resI = resI.add(sumI);
			}
			sum = sum.add(resI);
			if (i !== 0) for (let j = 0; j < windowSize; j++) sum = sum.double();
		}
		return sum;
	}
	/**
	* Precomputed multi-scalar multiplication (MSM, Pa + Qb + Rc + ...).
	* @param c Curve Point constructor
	* @param fieldN field over CURVE.N - important that it's not over CURVE.P
	* @param points array of L curve points
	* @returns function which multiplies points with scaars
	*/
	function precomputeMSMUnsafe(c, fieldN, points, windowSize) {
		/**
		* Performance Analysis of Window-based Precomputation
		*
		* Base Case (256-bit scalar, 8-bit window):
		* - Standard precomputation requires:
		*   - 31 additions per scalar × 256 scalars = 7,936 ops
		*   - Plus 255 summary additions = 8,191 total ops
		*   Note: Summary additions can be optimized via accumulator
		*
		* Chunked Precomputation Analysis:
		* - Using 32 chunks requires:
		*   - 255 additions per chunk
		*   - 256 doublings
		*   - Total: (255 × 32) + 256 = 8,416 ops
		*
		* Memory Usage Comparison:
		* Window Size | Standard Points | Chunked Points
		* ------------|-----------------|---------------
		*     4-bit   |     520         |      15
		*     8-bit   |    4,224        |     255
		*    10-bit   |   13,824        |   1,023
		*    16-bit   |  557,056        |  65,535
		*
		* Key Advantages:
		* 1. Enables larger window sizes due to reduced memory overhead
		* 2. More efficient for smaller scalar counts:
		*    - 16 chunks: (16 × 255) + 256 = 4,336 ops
		*    - ~2x faster than standard 8,191 ops
		*
		* Limitations:
		* - Not suitable for plain precomputes (requires 256 constant doublings)
		* - Performance degrades with larger scalar counts:
		*   - Optimal for ~256 scalars
		*   - Less efficient for 4096+ scalars (Pippenger preferred)
		*/
		validateW(windowSize, fieldN.BITS);
		validateMSMPoints(points, c);
		const zero = c.ZERO;
		const tableSize = 2 ** windowSize - 1;
		const chunks = Math.ceil(fieldN.BITS / windowSize);
		const MASK = (0, utils_ts_1.bitMask)(windowSize);
		const tables = points.map((p) => {
			const res = [];
			for (let i = 0, acc = p; i < tableSize; i++) {
				res.push(acc);
				acc = acc.add(p);
			}
			return res;
		});
		return (scalars) => {
			validateMSMScalars(scalars, fieldN);
			if (scalars.length > points.length) throw new Error("array of scalars must be smaller than array of points");
			let res = zero;
			for (let i = 0; i < chunks; i++) {
				if (res !== zero) for (let j = 0; j < windowSize; j++) res = res.double();
				const shiftBy = BigInt(chunks * windowSize - (i + 1) * windowSize);
				for (let j = 0; j < scalars.length; j++) {
					const n = scalars[j];
					const curr = Number(n >> shiftBy & MASK);
					if (!curr) continue;
					res = res.add(tables[j][curr - 1]);
				}
			}
			return res;
		};
	}
	/** @deprecated */
	function validateBasic(curve) {
		(0, modular_ts_1.validateField)(curve.Fp);
		(0, utils_ts_1.validateObject)(curve, {
			n: "bigint",
			h: "bigint",
			Gx: "field",
			Gy: "field"
		}, {
			nBitLength: "isSafeInteger",
			nByteLength: "isSafeInteger"
		});
		return Object.freeze({
			...(0, modular_ts_1.nLength)(curve.n, curve.nBitLength),
			...curve,
			p: curve.Fp.ORDER
		});
	}
	function createField(order, field, isLE) {
		if (field) {
			if (field.ORDER !== order) throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
			(0, modular_ts_1.validateField)(field);
			return field;
		} else return (0, modular_ts_1.Field)(order, { isLE });
	}
	/** Validates CURVE opts and creates fields */
	function _createCurveFields(type, CURVE, curveOpts = {}, FpFnLE) {
		if (FpFnLE === void 0) FpFnLE = type === "edwards";
		if (!CURVE || typeof CURVE !== "object") throw new Error(`expected valid ${type} CURVE object`);
		for (const p of [
			"p",
			"n",
			"h"
		]) {
			const val = CURVE[p];
			if (!(typeof val === "bigint" && val > _0n)) throw new Error(`CURVE.${p} must be positive bigint`);
		}
		const Fp = createField(CURVE.p, curveOpts.Fp, FpFnLE);
		const Fn = createField(CURVE.n, curveOpts.Fn, FpFnLE);
		const params = [
			"Gx",
			"Gy",
			"a",
			type === "weierstrass" ? "b" : "d"
		];
		for (const p of params) if (!Fp.isValid(CURVE[p])) throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
		CURVE = Object.freeze(Object.assign({}, CURVE));
		return {
			CURVE,
			Fp,
			Fn
		};
	}
}));
//#endregion
//#region node_modules/@noble/curves/abstract/edwards.js
var require_edwards = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PrimeEdwardsPoint = void 0;
	exports.edwards = edwards;
	exports.eddsa = eddsa;
	exports.twistedEdwards = twistedEdwards;
	/**
	* Twisted Edwards curve. The formula is: ax² + y² = 1 + dx²y².
	* For design rationale of types / exports, see weierstrass module documentation.
	* Untwisted Edwards curves exist, but they aren't used in real-world protocols.
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var utils_ts_1 = require_utils$2();
	var curve_ts_1 = require_curve();
	var modular_ts_1 = require_modular();
	var _0n = BigInt(0), _1n = BigInt(1), _2n = BigInt(2), _8n = BigInt(8);
	function isEdValidXY(Fp, CURVE, x, y) {
		const x2 = Fp.sqr(x);
		const y2 = Fp.sqr(y);
		const left = Fp.add(Fp.mul(CURVE.a, x2), y2);
		const right = Fp.add(Fp.ONE, Fp.mul(CURVE.d, Fp.mul(x2, y2)));
		return Fp.eql(left, right);
	}
	function edwards(params, extraOpts = {}) {
		const validated = (0, curve_ts_1._createCurveFields)("edwards", params, extraOpts, extraOpts.FpFnLE);
		const { Fp, Fn } = validated;
		let CURVE = validated.CURVE;
		const { h: cofactor } = CURVE;
		(0, utils_ts_1._validateObject)(extraOpts, {}, { uvRatio: "function" });
		const MASK = _2n << BigInt(Fn.BYTES * 8) - _1n;
		const modP = (n) => Fp.create(n);
		const uvRatio = extraOpts.uvRatio || ((u, v) => {
			try {
				return {
					isValid: true,
					value: Fp.sqrt(Fp.div(u, v))
				};
			} catch (e) {
				return {
					isValid: false,
					value: _0n
				};
			}
		});
		if (!isEdValidXY(Fp, CURVE, CURVE.Gx, CURVE.Gy)) throw new Error("bad curve params: generator point");
		/**
		* Asserts coordinate is valid: 0 <= n < MASK.
		* Coordinates >= Fp.ORDER are allowed for zip215.
		*/
		function acoord(title, n, banZero = false) {
			const min = banZero ? _1n : _0n;
			(0, utils_ts_1.aInRange)("coordinate " + title, n, min, MASK);
			return n;
		}
		function aextpoint(other) {
			if (!(other instanceof Point)) throw new Error("ExtendedPoint expected");
		}
		const toAffineMemo = (0, utils_ts_1.memoized)((p, iz) => {
			const { X, Y, Z } = p;
			const is0 = p.is0();
			if (iz == null) iz = is0 ? _8n : Fp.inv(Z);
			const x = modP(X * iz);
			const y = modP(Y * iz);
			const zz = Fp.mul(Z, iz);
			if (is0) return {
				x: _0n,
				y: _1n
			};
			if (zz !== _1n) throw new Error("invZ was invalid");
			return {
				x,
				y
			};
		});
		const assertValidMemo = (0, utils_ts_1.memoized)((p) => {
			const { a, d } = CURVE;
			if (p.is0()) throw new Error("bad point: ZERO");
			const { X, Y, Z, T } = p;
			const X2 = modP(X * X);
			const Y2 = modP(Y * Y);
			const Z2 = modP(Z * Z);
			const Z4 = modP(Z2 * Z2);
			if (modP(Z2 * modP(modP(X2 * a) + Y2)) !== modP(Z4 + modP(d * modP(X2 * Y2)))) throw new Error("bad point: equation left != right (1)");
			if (modP(X * Y) !== modP(Z * T)) throw new Error("bad point: equation left != right (2)");
			return true;
		});
		class Point {
			constructor(X, Y, Z, T) {
				this.X = acoord("x", X);
				this.Y = acoord("y", Y);
				this.Z = acoord("z", Z, true);
				this.T = acoord("t", T);
				Object.freeze(this);
			}
			static CURVE() {
				return CURVE;
			}
			static fromAffine(p) {
				if (p instanceof Point) throw new Error("extended point not allowed");
				const { x, y } = p || {};
				acoord("x", x);
				acoord("y", y);
				return new Point(x, y, _1n, modP(x * y));
			}
			static fromBytes(bytes, zip215 = false) {
				const len = Fp.BYTES;
				const { a, d } = CURVE;
				bytes = (0, utils_ts_1.copyBytes)((0, utils_ts_1._abytes2)(bytes, len, "point"));
				(0, utils_ts_1._abool2)(zip215, "zip215");
				const normed = (0, utils_ts_1.copyBytes)(bytes);
				const lastByte = bytes[len - 1];
				normed[len - 1] = lastByte & -129;
				const y = (0, utils_ts_1.bytesToNumberLE)(normed);
				const max = zip215 ? MASK : Fp.ORDER;
				(0, utils_ts_1.aInRange)("point.y", y, _0n, max);
				const y2 = modP(y * y);
				let { isValid, value: x } = uvRatio(modP(y2 - _1n), modP(d * y2 - a));
				if (!isValid) throw new Error("bad point: invalid y coordinate");
				const isXOdd = (x & _1n) === _1n;
				const isLastByteOdd = (lastByte & 128) !== 0;
				if (!zip215 && x === _0n && isLastByteOdd) throw new Error("bad point: x=0 and x_0=1");
				if (isLastByteOdd !== isXOdd) x = modP(-x);
				return Point.fromAffine({
					x,
					y
				});
			}
			static fromHex(bytes, zip215 = false) {
				return Point.fromBytes((0, utils_ts_1.ensureBytes)("point", bytes), zip215);
			}
			get x() {
				return this.toAffine().x;
			}
			get y() {
				return this.toAffine().y;
			}
			precompute(windowSize = 8, isLazy = true) {
				wnaf.createCache(this, windowSize);
				if (!isLazy) this.multiply(_2n);
				return this;
			}
			assertValidity() {
				assertValidMemo(this);
			}
			equals(other) {
				aextpoint(other);
				const { X: X1, Y: Y1, Z: Z1 } = this;
				const { X: X2, Y: Y2, Z: Z2 } = other;
				const X1Z2 = modP(X1 * Z2);
				const X2Z1 = modP(X2 * Z1);
				const Y1Z2 = modP(Y1 * Z2);
				const Y2Z1 = modP(Y2 * Z1);
				return X1Z2 === X2Z1 && Y1Z2 === Y2Z1;
			}
			is0() {
				return this.equals(Point.ZERO);
			}
			negate() {
				return new Point(modP(-this.X), this.Y, this.Z, modP(-this.T));
			}
			double() {
				const { a } = CURVE;
				const { X: X1, Y: Y1, Z: Z1 } = this;
				const A = modP(X1 * X1);
				const B = modP(Y1 * Y1);
				const C = modP(_2n * modP(Z1 * Z1));
				const D = modP(a * A);
				const x1y1 = X1 + Y1;
				const E = modP(modP(x1y1 * x1y1) - A - B);
				const G = D + B;
				const F = G - C;
				const H = D - B;
				const X3 = modP(E * F);
				const Y3 = modP(G * H);
				const T3 = modP(E * H);
				return new Point(X3, Y3, modP(F * G), T3);
			}
			add(other) {
				aextpoint(other);
				const { a, d } = CURVE;
				const { X: X1, Y: Y1, Z: Z1, T: T1 } = this;
				const { X: X2, Y: Y2, Z: Z2, T: T2 } = other;
				const A = modP(X1 * X2);
				const B = modP(Y1 * Y2);
				const C = modP(T1 * d * T2);
				const D = modP(Z1 * Z2);
				const E = modP((X1 + Y1) * (X2 + Y2) - A - B);
				const F = D - C;
				const G = D + C;
				const H = modP(B - a * A);
				const X3 = modP(E * F);
				const Y3 = modP(G * H);
				const T3 = modP(E * H);
				return new Point(X3, Y3, modP(F * G), T3);
			}
			subtract(other) {
				return this.add(other.negate());
			}
			multiply(scalar) {
				if (!Fn.isValidNot0(scalar)) throw new Error("invalid scalar: expected 1 <= sc < curve.n");
				const { p, f } = wnaf.cached(this, scalar, (p) => (0, curve_ts_1.normalizeZ)(Point, p));
				return (0, curve_ts_1.normalizeZ)(Point, [p, f])[0];
			}
			multiplyUnsafe(scalar, acc = Point.ZERO) {
				if (!Fn.isValid(scalar)) throw new Error("invalid scalar: expected 0 <= sc < curve.n");
				if (scalar === _0n) return Point.ZERO;
				if (this.is0() || scalar === _1n) return this;
				return wnaf.unsafe(this, scalar, (p) => (0, curve_ts_1.normalizeZ)(Point, p), acc);
			}
			isSmallOrder() {
				return this.multiplyUnsafe(cofactor).is0();
			}
			isTorsionFree() {
				return wnaf.unsafe(this, CURVE.n).is0();
			}
			toAffine(invertedZ) {
				return toAffineMemo(this, invertedZ);
			}
			clearCofactor() {
				if (cofactor === _1n) return this;
				return this.multiplyUnsafe(cofactor);
			}
			toBytes() {
				const { x, y } = this.toAffine();
				const bytes = Fp.toBytes(y);
				bytes[bytes.length - 1] |= x & _1n ? 128 : 0;
				return bytes;
			}
			toHex() {
				return (0, utils_ts_1.bytesToHex)(this.toBytes());
			}
			toString() {
				return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
			}
			get ex() {
				return this.X;
			}
			get ey() {
				return this.Y;
			}
			get ez() {
				return this.Z;
			}
			get et() {
				return this.T;
			}
			static normalizeZ(points) {
				return (0, curve_ts_1.normalizeZ)(Point, points);
			}
			static msm(points, scalars) {
				return (0, curve_ts_1.pippenger)(Point, Fn, points, scalars);
			}
			_setWindowSize(windowSize) {
				this.precompute(windowSize);
			}
			toRawBytes() {
				return this.toBytes();
			}
		}
		Point.BASE = new Point(CURVE.Gx, CURVE.Gy, _1n, modP(CURVE.Gx * CURVE.Gy));
		Point.ZERO = new Point(_0n, _1n, _1n, _0n);
		Point.Fp = Fp;
		Point.Fn = Fn;
		const wnaf = new curve_ts_1.wNAF(Point, Fn.BITS);
		Point.BASE.precompute(8);
		return Point;
	}
	/**
	* Base class for prime-order points like Ristretto255 and Decaf448.
	* These points eliminate cofactor issues by representing equivalence classes
	* of Edwards curve points.
	*/
	var PrimeEdwardsPoint = class {
		constructor(ep) {
			this.ep = ep;
		}
		static fromBytes(_bytes) {
			(0, utils_ts_1.notImplemented)();
		}
		static fromHex(_hex) {
			(0, utils_ts_1.notImplemented)();
		}
		get x() {
			return this.toAffine().x;
		}
		get y() {
			return this.toAffine().y;
		}
		clearCofactor() {
			return this;
		}
		assertValidity() {
			this.ep.assertValidity();
		}
		toAffine(invertedZ) {
			return this.ep.toAffine(invertedZ);
		}
		toHex() {
			return (0, utils_ts_1.bytesToHex)(this.toBytes());
		}
		toString() {
			return this.toHex();
		}
		isTorsionFree() {
			return true;
		}
		isSmallOrder() {
			return false;
		}
		add(other) {
			this.assertSame(other);
			return this.init(this.ep.add(other.ep));
		}
		subtract(other) {
			this.assertSame(other);
			return this.init(this.ep.subtract(other.ep));
		}
		multiply(scalar) {
			return this.init(this.ep.multiply(scalar));
		}
		multiplyUnsafe(scalar) {
			return this.init(this.ep.multiplyUnsafe(scalar));
		}
		double() {
			return this.init(this.ep.double());
		}
		negate() {
			return this.init(this.ep.negate());
		}
		precompute(windowSize, isLazy) {
			return this.init(this.ep.precompute(windowSize, isLazy));
		}
		/** @deprecated use `toBytes` */
		toRawBytes() {
			return this.toBytes();
		}
	};
	exports.PrimeEdwardsPoint = PrimeEdwardsPoint;
	/**
	* Initializes EdDSA signatures over given Edwards curve.
	*/
	function eddsa(Point, cHash, eddsaOpts = {}) {
		if (typeof cHash !== "function") throw new Error("\"hash\" function param is required");
		(0, utils_ts_1._validateObject)(eddsaOpts, {}, {
			adjustScalarBytes: "function",
			randomBytes: "function",
			domain: "function",
			prehash: "function",
			mapToCurve: "function"
		});
		const { prehash } = eddsaOpts;
		const { BASE, Fp, Fn } = Point;
		const randomBytes = eddsaOpts.randomBytes || utils_ts_1.randomBytes;
		const adjustScalarBytes = eddsaOpts.adjustScalarBytes || ((bytes) => bytes);
		const domain = eddsaOpts.domain || ((data, ctx, phflag) => {
			(0, utils_ts_1._abool2)(phflag, "phflag");
			if (ctx.length || phflag) throw new Error("Contexts/pre-hash are not supported");
			return data;
		});
		function modN_LE(hash) {
			return Fn.create((0, utils_ts_1.bytesToNumberLE)(hash));
		}
		function getPrivateScalar(key) {
			const len = lengths.secretKey;
			key = (0, utils_ts_1.ensureBytes)("private key", key, len);
			const hashed = (0, utils_ts_1.ensureBytes)("hashed private key", cHash(key), 2 * len);
			const head = adjustScalarBytes(hashed.slice(0, len));
			return {
				head,
				prefix: hashed.slice(len, 2 * len),
				scalar: modN_LE(head)
			};
		}
		/** Convenience method that creates public key from scalar. RFC8032 5.1.5 */
		function getExtendedPublicKey(secretKey) {
			const { head, prefix, scalar } = getPrivateScalar(secretKey);
			const point = BASE.multiply(scalar);
			return {
				head,
				prefix,
				scalar,
				point,
				pointBytes: point.toBytes()
			};
		}
		/** Calculates EdDSA pub key. RFC8032 5.1.5. */
		function getPublicKey(secretKey) {
			return getExtendedPublicKey(secretKey).pointBytes;
		}
		function hashDomainToScalar(context = Uint8Array.of(), ...msgs) {
			return modN_LE(cHash(domain((0, utils_ts_1.concatBytes)(...msgs), (0, utils_ts_1.ensureBytes)("context", context), !!prehash)));
		}
		/** Signs message with privateKey. RFC8032 5.1.6 */
		function sign(msg, secretKey, options = {}) {
			msg = (0, utils_ts_1.ensureBytes)("message", msg);
			if (prehash) msg = prehash(msg);
			const { prefix, scalar, pointBytes } = getExtendedPublicKey(secretKey);
			const r = hashDomainToScalar(options.context, prefix, msg);
			const R = BASE.multiply(r).toBytes();
			const k = hashDomainToScalar(options.context, R, pointBytes, msg);
			const s = Fn.create(r + k * scalar);
			if (!Fn.isValid(s)) throw new Error("sign failed: invalid s");
			const rs = (0, utils_ts_1.concatBytes)(R, Fn.toBytes(s));
			return (0, utils_ts_1._abytes2)(rs, lengths.signature, "result");
		}
		const verifyOpts = { zip215: true };
		/**
		* Verifies EdDSA signature against message and public key. RFC8032 5.1.7.
		* An extended group equation is checked.
		*/
		function verify(sig, msg, publicKey, options = verifyOpts) {
			const { context, zip215 } = options;
			const len = lengths.signature;
			sig = (0, utils_ts_1.ensureBytes)("signature", sig, len);
			msg = (0, utils_ts_1.ensureBytes)("message", msg);
			publicKey = (0, utils_ts_1.ensureBytes)("publicKey", publicKey, lengths.publicKey);
			if (zip215 !== void 0) (0, utils_ts_1._abool2)(zip215, "zip215");
			if (prehash) msg = prehash(msg);
			const mid = len / 2;
			const r = sig.subarray(0, mid);
			const s = (0, utils_ts_1.bytesToNumberLE)(sig.subarray(mid, len));
			let A, R, SB;
			try {
				A = Point.fromBytes(publicKey, zip215);
				R = Point.fromBytes(r, zip215);
				SB = BASE.multiplyUnsafe(s);
			} catch (error) {
				return false;
			}
			if (!zip215 && A.isSmallOrder()) return false;
			const k = hashDomainToScalar(context, R.toBytes(), A.toBytes(), msg);
			return R.add(A.multiplyUnsafe(k)).subtract(SB).clearCofactor().is0();
		}
		const _size = Fp.BYTES;
		const lengths = {
			secretKey: _size,
			publicKey: _size,
			signature: 2 * _size,
			seed: _size
		};
		function randomSecretKey(seed = randomBytes(lengths.seed)) {
			return (0, utils_ts_1._abytes2)(seed, lengths.seed, "seed");
		}
		function keygen(seed) {
			const secretKey = utils.randomSecretKey(seed);
			return {
				secretKey,
				publicKey: getPublicKey(secretKey)
			};
		}
		function isValidSecretKey(key) {
			return (0, utils_ts_1.isBytes)(key) && key.length === Fn.BYTES;
		}
		function isValidPublicKey(key, zip215) {
			try {
				return !!Point.fromBytes(key, zip215);
			} catch (error) {
				return false;
			}
		}
		const utils = {
			getExtendedPublicKey,
			randomSecretKey,
			isValidSecretKey,
			isValidPublicKey,
			/**
			* Converts ed public key to x public key. Uses formula:
			* - ed25519:
			*   - `(u, v) = ((1+y)/(1-y), sqrt(-486664)*u/x)`
			*   - `(x, y) = (sqrt(-486664)*u/v, (u-1)/(u+1))`
			* - ed448:
			*   - `(u, v) = ((y-1)/(y+1), sqrt(156324)*u/x)`
			*   - `(x, y) = (sqrt(156324)*u/v, (1+u)/(1-u))`
			*/
			toMontgomery(publicKey) {
				const { y } = Point.fromBytes(publicKey);
				const size = lengths.publicKey;
				const is25519 = size === 32;
				if (!is25519 && size !== 57) throw new Error("only defined for 25519 and 448");
				const u = is25519 ? Fp.div(_1n + y, _1n - y) : Fp.div(y - _1n, y + _1n);
				return Fp.toBytes(u);
			},
			toMontgomerySecret(secretKey) {
				const size = lengths.secretKey;
				(0, utils_ts_1._abytes2)(secretKey, size);
				return adjustScalarBytes(cHash(secretKey.subarray(0, size))).subarray(0, size);
			},
			/** @deprecated */
			randomPrivateKey: randomSecretKey,
			/** @deprecated */
			precompute(windowSize = 8, point = Point.BASE) {
				return point.precompute(windowSize, false);
			}
		};
		return Object.freeze({
			keygen,
			getPublicKey,
			sign,
			verify,
			utils,
			Point,
			lengths
		});
	}
	function _eddsa_legacy_opts_to_new(c) {
		const CURVE = {
			a: c.a,
			d: c.d,
			p: c.Fp.ORDER,
			n: c.n,
			h: c.h,
			Gx: c.Gx,
			Gy: c.Gy
		};
		const curveOpts = {
			Fp: c.Fp,
			Fn: (0, modular_ts_1.Field)(CURVE.n, c.nBitLength, true),
			uvRatio: c.uvRatio
		};
		const eddsaOpts = {
			randomBytes: c.randomBytes,
			adjustScalarBytes: c.adjustScalarBytes,
			domain: c.domain,
			prehash: c.prehash,
			mapToCurve: c.mapToCurve
		};
		return {
			CURVE,
			curveOpts,
			hash: c.hash,
			eddsaOpts
		};
	}
	function _eddsa_new_output_to_legacy(c, eddsa) {
		const Point = eddsa.Point;
		return Object.assign({}, eddsa, {
			ExtendedPoint: Point,
			CURVE: c,
			nBitLength: Point.Fn.BITS,
			nByteLength: Point.Fn.BYTES
		});
	}
	function twistedEdwards(c) {
		const { CURVE, curveOpts, hash, eddsaOpts } = _eddsa_legacy_opts_to_new(c);
		return _eddsa_new_output_to_legacy(c, eddsa(edwards(CURVE, curveOpts), hash, eddsaOpts));
	}
}));
//#endregion
//#region node_modules/@noble/curves/abstract/hash-to-curve.js
var require_hash_to_curve = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports._DST_scalar = void 0;
	exports.expand_message_xmd = expand_message_xmd;
	exports.expand_message_xof = expand_message_xof;
	exports.hash_to_field = hash_to_field;
	exports.isogenyMap = isogenyMap;
	exports.createHasher = createHasher;
	var utils_ts_1 = require_utils$2();
	var modular_ts_1 = require_modular();
	var os2ip = utils_ts_1.bytesToNumberBE;
	function i2osp(value, length) {
		anum(value);
		anum(length);
		if (value < 0 || value >= 1 << 8 * length) throw new Error("invalid I2OSP input: " + value);
		const res = Array.from({ length }).fill(0);
		for (let i = length - 1; i >= 0; i--) {
			res[i] = value & 255;
			value >>>= 8;
		}
		return new Uint8Array(res);
	}
	function strxor(a, b) {
		const arr = new Uint8Array(a.length);
		for (let i = 0; i < a.length; i++) arr[i] = a[i] ^ b[i];
		return arr;
	}
	function anum(item) {
		if (!Number.isSafeInteger(item)) throw new Error("number expected");
	}
	function normDST(DST) {
		if (!(0, utils_ts_1.isBytes)(DST) && typeof DST !== "string") throw new Error("DST must be Uint8Array or string");
		return typeof DST === "string" ? (0, utils_ts_1.utf8ToBytes)(DST) : DST;
	}
	/**
	* Produces a uniformly random byte string using a cryptographic hash function H that outputs b bits.
	* [RFC 9380 5.3.1](https://www.rfc-editor.org/rfc/rfc9380#section-5.3.1).
	*/
	function expand_message_xmd(msg, DST, lenInBytes, H) {
		(0, utils_ts_1.abytes)(msg);
		anum(lenInBytes);
		DST = normDST(DST);
		if (DST.length > 255) DST = H((0, utils_ts_1.concatBytes)((0, utils_ts_1.utf8ToBytes)("H2C-OVERSIZE-DST-"), DST));
		const { outputLen: b_in_bytes, blockLen: r_in_bytes } = H;
		const ell = Math.ceil(lenInBytes / b_in_bytes);
		if (lenInBytes > 65535 || ell > 255) throw new Error("expand_message_xmd: invalid lenInBytes");
		const DST_prime = (0, utils_ts_1.concatBytes)(DST, i2osp(DST.length, 1));
		const Z_pad = i2osp(0, r_in_bytes);
		const l_i_b_str = i2osp(lenInBytes, 2);
		const b = new Array(ell);
		const b_0 = H((0, utils_ts_1.concatBytes)(Z_pad, msg, l_i_b_str, i2osp(0, 1), DST_prime));
		b[0] = H((0, utils_ts_1.concatBytes)(b_0, i2osp(1, 1), DST_prime));
		for (let i = 1; i <= ell; i++) {
			const args = [
				strxor(b_0, b[i - 1]),
				i2osp(i + 1, 1),
				DST_prime
			];
			b[i] = H((0, utils_ts_1.concatBytes)(...args));
		}
		return (0, utils_ts_1.concatBytes)(...b).slice(0, lenInBytes);
	}
	/**
	* Produces a uniformly random byte string using an extendable-output function (XOF) H.
	* 1. The collision resistance of H MUST be at least k bits.
	* 2. H MUST be an XOF that has been proved indifferentiable from
	*    a random oracle under a reasonable cryptographic assumption.
	* [RFC 9380 5.3.2](https://www.rfc-editor.org/rfc/rfc9380#section-5.3.2).
	*/
	function expand_message_xof(msg, DST, lenInBytes, k, H) {
		(0, utils_ts_1.abytes)(msg);
		anum(lenInBytes);
		DST = normDST(DST);
		if (DST.length > 255) {
			const dkLen = Math.ceil(2 * k / 8);
			DST = H.create({ dkLen }).update((0, utils_ts_1.utf8ToBytes)("H2C-OVERSIZE-DST-")).update(DST).digest();
		}
		if (lenInBytes > 65535 || DST.length > 255) throw new Error("expand_message_xof: invalid lenInBytes");
		return H.create({ dkLen: lenInBytes }).update(msg).update(i2osp(lenInBytes, 2)).update(DST).update(i2osp(DST.length, 1)).digest();
	}
	/**
	* Hashes arbitrary-length byte strings to a list of one or more elements of a finite field F.
	* [RFC 9380 5.2](https://www.rfc-editor.org/rfc/rfc9380#section-5.2).
	* @param msg a byte string containing the message to hash
	* @param count the number of elements of F to output
	* @param options `{DST: string, p: bigint, m: number, k: number, expand: 'xmd' | 'xof', hash: H}`, see above
	* @returns [u_0, ..., u_(count - 1)], a list of field elements.
	*/
	function hash_to_field(msg, count, options) {
		(0, utils_ts_1._validateObject)(options, {
			p: "bigint",
			m: "number",
			k: "number",
			hash: "function"
		});
		const { p, k, m, hash, expand, DST } = options;
		if (!(0, utils_ts_1.isHash)(options.hash)) throw new Error("expected valid hash");
		(0, utils_ts_1.abytes)(msg);
		anum(count);
		const log2p = p.toString(2).length;
		const L = Math.ceil((log2p + k) / 8);
		const len_in_bytes = count * m * L;
		let prb;
		if (expand === "xmd") prb = expand_message_xmd(msg, DST, len_in_bytes, hash);
		else if (expand === "xof") prb = expand_message_xof(msg, DST, len_in_bytes, k, hash);
		else if (expand === "_internal_pass") prb = msg;
		else throw new Error("expand must be \"xmd\" or \"xof\"");
		const u = new Array(count);
		for (let i = 0; i < count; i++) {
			const e = new Array(m);
			for (let j = 0; j < m; j++) {
				const elm_offset = L * (j + i * m);
				const tv = prb.subarray(elm_offset, elm_offset + L);
				e[j] = (0, modular_ts_1.mod)(os2ip(tv), p);
			}
			u[i] = e;
		}
		return u;
	}
	function isogenyMap(field, map) {
		const coeff = map.map((i) => Array.from(i).reverse());
		return (x, y) => {
			const [xn, xd, yn, yd] = coeff.map((val) => val.reduce((acc, i) => field.add(field.mul(acc, x), i)));
			const [xd_inv, yd_inv] = (0, modular_ts_1.FpInvertBatch)(field, [xd, yd], true);
			x = field.mul(xn, xd_inv);
			y = field.mul(y, field.mul(yn, yd_inv));
			return {
				x,
				y
			};
		};
	}
	exports._DST_scalar = (0, utils_ts_1.utf8ToBytes)("HashToScalar-");
	/** Creates hash-to-curve methods from EC Point and mapToCurve function. See {@link H2CHasher}. */
	function createHasher(Point, mapToCurve, defaults) {
		if (typeof mapToCurve !== "function") throw new Error("mapToCurve() must be defined");
		function map(num) {
			return Point.fromAffine(mapToCurve(num));
		}
		function clear(initial) {
			const P = initial.clearCofactor();
			if (P.equals(Point.ZERO)) return Point.ZERO;
			P.assertValidity();
			return P;
		}
		return {
			defaults,
			hashToCurve(msg, options) {
				const u = hash_to_field(msg, 2, Object.assign({}, defaults, options));
				const u0 = map(u[0]);
				const u1 = map(u[1]);
				return clear(u0.add(u1));
			},
			encodeToCurve(msg, options) {
				const optsDst = defaults.encodeDST ? { DST: defaults.encodeDST } : {};
				return clear(map(hash_to_field(msg, 1, Object.assign({}, defaults, optsDst, options))[0]));
			},
			/** See {@link H2CHasher} */
			mapToCurve(scalars) {
				if (!Array.isArray(scalars)) throw new Error("expected array of bigints");
				for (const i of scalars) if (typeof i !== "bigint") throw new Error("expected array of bigints");
				return clear(map(scalars));
			},
			hashToScalar(msg, options) {
				const N = Point.Fn.ORDER;
				return hash_to_field(msg, 1, Object.assign({}, defaults, {
					p: N,
					m: 1,
					DST: exports._DST_scalar
				}, options))[0][0];
			}
		};
	}
}));
//#endregion
//#region node_modules/@noble/curves/abstract/montgomery.js
var require_montgomery = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.montgomery = montgomery;
	/**
	* Montgomery curve methods. It's not really whole montgomery curve,
	* just bunch of very specific methods for X25519 / X448 from
	* [RFC 7748](https://www.rfc-editor.org/rfc/rfc7748)
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var utils_ts_1 = require_utils$2();
	var modular_ts_1 = require_modular();
	var _0n = BigInt(0);
	var _1n = BigInt(1);
	var _2n = BigInt(2);
	function validateOpts(curve) {
		(0, utils_ts_1._validateObject)(curve, {
			adjustScalarBytes: "function",
			powPminus2: "function"
		});
		return Object.freeze({ ...curve });
	}
	function montgomery(curveDef) {
		const { P, type, adjustScalarBytes, powPminus2, randomBytes: rand } = validateOpts(curveDef);
		const is25519 = type === "x25519";
		if (!is25519 && type !== "x448") throw new Error("invalid type");
		const randomBytes_ = rand || utils_ts_1.randomBytes;
		const montgomeryBits = is25519 ? 255 : 448;
		const fieldLen = is25519 ? 32 : 56;
		const Gu = is25519 ? BigInt(9) : BigInt(5);
		const a24 = is25519 ? BigInt(121665) : BigInt(39081);
		const minScalar = is25519 ? _2n ** BigInt(254) : _2n ** BigInt(447);
		const maxScalar = minScalar + (is25519 ? BigInt(8) * _2n ** BigInt(251) - _1n : BigInt(4) * _2n ** BigInt(445) - _1n) + _1n;
		const modP = (n) => (0, modular_ts_1.mod)(n, P);
		const GuBytes = encodeU(Gu);
		function encodeU(u) {
			return (0, utils_ts_1.numberToBytesLE)(modP(u), fieldLen);
		}
		function decodeU(u) {
			const _u = (0, utils_ts_1.ensureBytes)("u coordinate", u, fieldLen);
			if (is25519) _u[31] &= 127;
			return modP((0, utils_ts_1.bytesToNumberLE)(_u));
		}
		function decodeScalar(scalar) {
			return (0, utils_ts_1.bytesToNumberLE)(adjustScalarBytes((0, utils_ts_1.ensureBytes)("scalar", scalar, fieldLen)));
		}
		function scalarMult(scalar, u) {
			const pu = montgomeryLadder(decodeU(u), decodeScalar(scalar));
			if (pu === _0n) throw new Error("invalid private or public key received");
			return encodeU(pu);
		}
		function scalarMultBase(scalar) {
			return scalarMult(scalar, GuBytes);
		}
		function cswap(swap, x_2, x_3) {
			const dummy = modP(swap * (x_2 - x_3));
			x_2 = modP(x_2 - dummy);
			x_3 = modP(x_3 + dummy);
			return {
				x_2,
				x_3
			};
		}
		/**
		* Montgomery x-only multiplication ladder.
		* @param pointU u coordinate (x) on Montgomery Curve 25519
		* @param scalar by which the point would be multiplied
		* @returns new Point on Montgomery curve
		*/
		function montgomeryLadder(u, scalar) {
			(0, utils_ts_1.aInRange)("u", u, _0n, P);
			(0, utils_ts_1.aInRange)("scalar", scalar, minScalar, maxScalar);
			const k = scalar;
			const x_1 = u;
			let x_2 = _1n;
			let z_2 = _0n;
			let x_3 = u;
			let z_3 = _1n;
			let swap = _0n;
			for (let t = BigInt(montgomeryBits - 1); t >= _0n; t--) {
				const k_t = k >> t & _1n;
				swap ^= k_t;
				({x_2, x_3} = cswap(swap, x_2, x_3));
				({x_2: z_2, x_3: z_3} = cswap(swap, z_2, z_3));
				swap = k_t;
				const A = x_2 + z_2;
				const AA = modP(A * A);
				const B = x_2 - z_2;
				const BB = modP(B * B);
				const E = AA - BB;
				const C = x_3 + z_3;
				const DA = modP((x_3 - z_3) * A);
				const CB = modP(C * B);
				const dacb = DA + CB;
				const da_cb = DA - CB;
				x_3 = modP(dacb * dacb);
				z_3 = modP(x_1 * modP(da_cb * da_cb));
				x_2 = modP(AA * BB);
				z_2 = modP(E * (AA + modP(a24 * E)));
			}
			({x_2, x_3} = cswap(swap, x_2, x_3));
			({x_2: z_2, x_3: z_3} = cswap(swap, z_2, z_3));
			const z2 = powPminus2(z_2);
			return modP(x_2 * z2);
		}
		const lengths = {
			secretKey: fieldLen,
			publicKey: fieldLen,
			seed: fieldLen
		};
		const randomSecretKey = (seed = randomBytes_(fieldLen)) => {
			(0, utils_ts_1.abytes)(seed, lengths.seed);
			return seed;
		};
		function keygen(seed) {
			const secretKey = randomSecretKey(seed);
			return {
				secretKey,
				publicKey: scalarMultBase(secretKey)
			};
		}
		return {
			keygen,
			getSharedSecret: (secretKey, publicKey) => scalarMult(secretKey, publicKey),
			getPublicKey: (secretKey) => scalarMultBase(secretKey),
			scalarMult,
			scalarMultBase,
			utils: {
				randomSecretKey,
				randomPrivateKey: randomSecretKey
			},
			GuBytes: GuBytes.slice(),
			lengths
		};
	}
}));
//#endregion
//#region node_modules/@noble/curves/ed25519.js
var require_ed25519$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.hash_to_ristretto255 = exports.hashToRistretto255 = exports.encodeToCurve = exports.hashToCurve = exports.RistrettoPoint = exports.edwardsToMontgomery = exports.ED25519_TORSION_SUBGROUP = exports.ristretto255_hasher = exports.ristretto255 = exports.ed25519_hasher = exports.x25519 = exports.ed25519ph = exports.ed25519ctx = exports.ed25519 = void 0;
	exports.edwardsToMontgomeryPub = edwardsToMontgomeryPub;
	exports.edwardsToMontgomeryPriv = edwardsToMontgomeryPriv;
	/**
	* ed25519 Twisted Edwards curve with following addons:
	* - X25519 ECDH
	* - Ristretto cofactor elimination
	* - Elligator hash-to-group / point indistinguishability
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var sha2_js_1 = require_sha2();
	var utils_js_1 = require_utils$3();
	var curve_ts_1 = require_curve();
	var edwards_ts_1 = require_edwards();
	var hash_to_curve_ts_1 = require_hash_to_curve();
	var modular_ts_1 = require_modular();
	var montgomery_ts_1 = require_montgomery();
	var utils_ts_1 = require_utils$2();
	var _0n = /* @__PURE__ */ BigInt(0), _1n = BigInt(1), _2n = BigInt(2), _3n = BigInt(3);
	var _5n = BigInt(5), _8n = BigInt(8);
	var ed25519_CURVE_p = BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed");
	var ed25519_CURVE = {
		p: ed25519_CURVE_p,
		n: BigInt("0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed"),
		h: _8n,
		a: BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffec"),
		d: BigInt("0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3"),
		Gx: BigInt("0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a"),
		Gy: BigInt("0x6666666666666666666666666666666666666666666666666666666666666658")
	};
	function ed25519_pow_2_252_3(x) {
		const _10n = BigInt(10), _20n = BigInt(20), _40n = BigInt(40), _80n = BigInt(80);
		const P = ed25519_CURVE_p;
		const b2 = x * x % P * x % P;
		const b4 = (0, modular_ts_1.pow2)(b2, _2n, P) * b2 % P;
		const b5 = (0, modular_ts_1.pow2)(b4, _1n, P) * x % P;
		const b10 = (0, modular_ts_1.pow2)(b5, _5n, P) * b5 % P;
		const b20 = (0, modular_ts_1.pow2)(b10, _10n, P) * b10 % P;
		const b40 = (0, modular_ts_1.pow2)(b20, _20n, P) * b20 % P;
		const b80 = (0, modular_ts_1.pow2)(b40, _40n, P) * b40 % P;
		const b160 = (0, modular_ts_1.pow2)(b80, _80n, P) * b80 % P;
		const b240 = (0, modular_ts_1.pow2)(b160, _80n, P) * b80 % P;
		const b250 = (0, modular_ts_1.pow2)(b240, _10n, P) * b10 % P;
		return {
			pow_p_5_8: (0, modular_ts_1.pow2)(b250, _2n, P) * x % P,
			b2
		};
	}
	function adjustScalarBytes(bytes) {
		bytes[0] &= 248;
		bytes[31] &= 127;
		bytes[31] |= 64;
		return bytes;
	}
	var ED25519_SQRT_M1 = /* @__PURE__ */ BigInt("19681161376707505956807079304988542015446066515923890162744021073123829784752");
	function uvRatio(u, v) {
		const P = ed25519_CURVE_p;
		const v3 = (0, modular_ts_1.mod)(v * v * v, P);
		const pow = ed25519_pow_2_252_3(u * (0, modular_ts_1.mod)(v3 * v3 * v, P)).pow_p_5_8;
		let x = (0, modular_ts_1.mod)(u * v3 * pow, P);
		const vx2 = (0, modular_ts_1.mod)(v * x * x, P);
		const root1 = x;
		const root2 = (0, modular_ts_1.mod)(x * ED25519_SQRT_M1, P);
		const useRoot1 = vx2 === u;
		const useRoot2 = vx2 === (0, modular_ts_1.mod)(-u, P);
		const noRoot = vx2 === (0, modular_ts_1.mod)(-u * ED25519_SQRT_M1, P);
		if (useRoot1) x = root1;
		if (useRoot2 || noRoot) x = root2;
		if ((0, modular_ts_1.isNegativeLE)(x, P)) x = (0, modular_ts_1.mod)(-x, P);
		return {
			isValid: useRoot1 || useRoot2,
			value: x
		};
	}
	var Fp = (0, modular_ts_1.Field)(ed25519_CURVE.p, { isLE: true });
	var Fn = (0, modular_ts_1.Field)(ed25519_CURVE.n, { isLE: true });
	var ed25519Defaults = {
		...ed25519_CURVE,
		Fp,
		hash: sha2_js_1.sha512,
		adjustScalarBytes,
		uvRatio
	};
	/**
	* ed25519 curve with EdDSA signatures.
	* @example
	* import { ed25519 } from '@noble/curves/ed25519';
	* const { secretKey, publicKey } = ed25519.keygen();
	* const msg = new TextEncoder().encode('hello');
	* const sig = ed25519.sign(msg, priv);
	* ed25519.verify(sig, msg, pub); // Default mode: follows ZIP215
	* ed25519.verify(sig, msg, pub, { zip215: false }); // RFC8032 / FIPS 186-5
	*/
	exports.ed25519 = (0, edwards_ts_1.twistedEdwards)(ed25519Defaults);
	function ed25519_domain(data, ctx, phflag) {
		if (ctx.length > 255) throw new Error("Context is too big");
		return (0, utils_js_1.concatBytes)((0, utils_js_1.utf8ToBytes)("SigEd25519 no Ed25519 collisions"), new Uint8Array([phflag ? 1 : 0, ctx.length]), ctx, data);
	}
	/** Context of ed25519. Uses context for domain separation. */
	exports.ed25519ctx = (0, edwards_ts_1.twistedEdwards)({
		...ed25519Defaults,
		domain: ed25519_domain
	});
	/** Prehashed version of ed25519. Accepts already-hashed messages in sign() and verify(). */
	exports.ed25519ph = (0, edwards_ts_1.twistedEdwards)(Object.assign({}, ed25519Defaults, {
		domain: ed25519_domain,
		prehash: sha2_js_1.sha512
	}));
	/**
	* ECDH using curve25519 aka x25519.
	* @example
	* import { x25519 } from '@noble/curves/ed25519';
	* const priv = 'a546e36bf0527c9d3b16154b82465edd62144c0ac1fc5a18506a2244ba449ac4';
	* const pub = 'e6db6867583030db3594c1a424b15f7c726624ec26b3353b10a903a6d0ab1c4c';
	* x25519.getSharedSecret(priv, pub) === x25519.scalarMult(priv, pub); // aliases
	* x25519.getPublicKey(priv) === x25519.scalarMultBase(priv);
	* x25519.getPublicKey(x25519.utils.randomSecretKey());
	*/
	exports.x25519 = (() => {
		const P = Fp.ORDER;
		return (0, montgomery_ts_1.montgomery)({
			P,
			type: "x25519",
			powPminus2: (x) => {
				const { pow_p_5_8, b2 } = ed25519_pow_2_252_3(x);
				return (0, modular_ts_1.mod)((0, modular_ts_1.pow2)(pow_p_5_8, _3n, P) * b2, P);
			},
			adjustScalarBytes
		});
	})();
	var ELL2_C1 = (ed25519_CURVE_p + _3n) / _8n;
	var ELL2_C2 = Fp.pow(_2n, ELL2_C1);
	var ELL2_C3 = Fp.sqrt(Fp.neg(Fp.ONE));
	function map_to_curve_elligator2_curve25519(u) {
		const ELL2_C4 = (ed25519_CURVE_p - _5n) / _8n;
		const ELL2_J = BigInt(486662);
		let tv1 = Fp.sqr(u);
		tv1 = Fp.mul(tv1, _2n);
		let xd = Fp.add(tv1, Fp.ONE);
		let x1n = Fp.neg(ELL2_J);
		let tv2 = Fp.sqr(xd);
		let gxd = Fp.mul(tv2, xd);
		let gx1 = Fp.mul(tv1, ELL2_J);
		gx1 = Fp.mul(gx1, x1n);
		gx1 = Fp.add(gx1, tv2);
		gx1 = Fp.mul(gx1, x1n);
		let tv3 = Fp.sqr(gxd);
		tv2 = Fp.sqr(tv3);
		tv3 = Fp.mul(tv3, gxd);
		tv3 = Fp.mul(tv3, gx1);
		tv2 = Fp.mul(tv2, tv3);
		let y11 = Fp.pow(tv2, ELL2_C4);
		y11 = Fp.mul(y11, tv3);
		let y12 = Fp.mul(y11, ELL2_C3);
		tv2 = Fp.sqr(y11);
		tv2 = Fp.mul(tv2, gxd);
		let e1 = Fp.eql(tv2, gx1);
		let y1 = Fp.cmov(y12, y11, e1);
		let x2n = Fp.mul(x1n, tv1);
		let y21 = Fp.mul(y11, u);
		y21 = Fp.mul(y21, ELL2_C2);
		let y22 = Fp.mul(y21, ELL2_C3);
		let gx2 = Fp.mul(gx1, tv1);
		tv2 = Fp.sqr(y21);
		tv2 = Fp.mul(tv2, gxd);
		let e2 = Fp.eql(tv2, gx2);
		let y2 = Fp.cmov(y22, y21, e2);
		tv2 = Fp.sqr(y1);
		tv2 = Fp.mul(tv2, gxd);
		let e3 = Fp.eql(tv2, gx1);
		let xn = Fp.cmov(x2n, x1n, e3);
		let y = Fp.cmov(y2, y1, e3);
		let e4 = Fp.isOdd(y);
		y = Fp.cmov(y, Fp.neg(y), e3 !== e4);
		return {
			xMn: xn,
			xMd: xd,
			yMn: y,
			yMd: _1n
		};
	}
	var ELL2_C1_EDWARDS = (0, modular_ts_1.FpSqrtEven)(Fp, Fp.neg(BigInt(486664)));
	function map_to_curve_elligator2_edwards25519(u) {
		const { xMn, xMd, yMn, yMd } = map_to_curve_elligator2_curve25519(u);
		let xn = Fp.mul(xMn, yMd);
		xn = Fp.mul(xn, ELL2_C1_EDWARDS);
		let xd = Fp.mul(xMd, yMn);
		let yn = Fp.sub(xMn, xMd);
		let yd = Fp.add(xMn, xMd);
		let tv1 = Fp.mul(xd, yd);
		let e = Fp.eql(tv1, Fp.ZERO);
		xn = Fp.cmov(xn, Fp.ZERO, e);
		xd = Fp.cmov(xd, Fp.ONE, e);
		yn = Fp.cmov(yn, Fp.ONE, e);
		yd = Fp.cmov(yd, Fp.ONE, e);
		const [xd_inv, yd_inv] = (0, modular_ts_1.FpInvertBatch)(Fp, [xd, yd], true);
		return {
			x: Fp.mul(xn, xd_inv),
			y: Fp.mul(yn, yd_inv)
		};
	}
	/** Hashing to ed25519 points / field. RFC 9380 methods. */
	exports.ed25519_hasher = (0, hash_to_curve_ts_1.createHasher)(exports.ed25519.Point, (scalars) => map_to_curve_elligator2_edwards25519(scalars[0]), {
		DST: "edwards25519_XMD:SHA-512_ELL2_RO_",
		encodeDST: "edwards25519_XMD:SHA-512_ELL2_NU_",
		p: ed25519_CURVE_p,
		m: 1,
		k: 128,
		expand: "xmd",
		hash: sha2_js_1.sha512
	});
	var SQRT_M1 = ED25519_SQRT_M1;
	var SQRT_AD_MINUS_ONE = /* @__PURE__ */ BigInt("25063068953384623474111414158702152701244531502492656460079210482610430750235");
	var INVSQRT_A_MINUS_D = /* @__PURE__ */ BigInt("54469307008909316920995813868745141605393597292927456921205312896311721017578");
	var ONE_MINUS_D_SQ = /* @__PURE__ */ BigInt("1159843021668779879193775521855586647937357759715417654439879720876111806838");
	var D_MINUS_ONE_SQ = /* @__PURE__ */ BigInt("40440834346308536858101042469323190826248399146238708352240133220865137265952");
	var invertSqrt = (number) => uvRatio(_1n, number);
	var MAX_255B = /* @__PURE__ */ BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
	var bytes255ToNumberLE = (bytes) => exports.ed25519.Point.Fp.create((0, utils_ts_1.bytesToNumberLE)(bytes) & MAX_255B);
	/**
	* Computes Elligator map for Ristretto255.
	* Described in [RFC9380](https://www.rfc-editor.org/rfc/rfc9380#appendix-B) and on
	* the [website](https://ristretto.group/formulas/elligator.html).
	*/
	function calcElligatorRistrettoMap(r0) {
		const { d } = ed25519_CURVE;
		const P = ed25519_CURVE_p;
		const mod = (n) => Fp.create(n);
		const r = mod(SQRT_M1 * r0 * r0);
		const Ns = mod((r + _1n) * ONE_MINUS_D_SQ);
		let c = BigInt(-1);
		const D = mod((c - d * r) * mod(r + d));
		let { isValid: Ns_D_is_sq, value: s } = uvRatio(Ns, D);
		let s_ = mod(s * r0);
		if (!(0, modular_ts_1.isNegativeLE)(s_, P)) s_ = mod(-s_);
		if (!Ns_D_is_sq) s = s_;
		if (!Ns_D_is_sq) c = r;
		const Nt = mod(c * (r - _1n) * D_MINUS_ONE_SQ - D);
		const s2 = s * s;
		const W0 = mod((s + s) * D);
		const W1 = mod(Nt * SQRT_AD_MINUS_ONE);
		const W2 = mod(_1n - s2);
		const W3 = mod(_1n + s2);
		return new exports.ed25519.Point(mod(W0 * W3), mod(W2 * W1), mod(W1 * W3), mod(W0 * W2));
	}
	function ristretto255_map(bytes) {
		(0, utils_js_1.abytes)(bytes, 64);
		const R1 = calcElligatorRistrettoMap(bytes255ToNumberLE(bytes.subarray(0, 32)));
		const R2 = calcElligatorRistrettoMap(bytes255ToNumberLE(bytes.subarray(32, 64)));
		return new _RistrettoPoint(R1.add(R2));
	}
	/**
	* Wrapper over Edwards Point for ristretto255.
	*
	* Each ed25519/ExtendedPoint has 8 different equivalent points. This can be
	* a source of bugs for protocols like ring signatures. Ristretto was created to solve this.
	* Ristretto point operates in X:Y:Z:T extended coordinates like ExtendedPoint,
	* but it should work in its own namespace: do not combine those two.
	* See [RFC9496](https://www.rfc-editor.org/rfc/rfc9496).
	*/
	var _RistrettoPoint = class _RistrettoPoint extends edwards_ts_1.PrimeEdwardsPoint {
		constructor(ep) {
			super(ep);
		}
		static fromAffine(ap) {
			return new _RistrettoPoint(exports.ed25519.Point.fromAffine(ap));
		}
		assertSame(other) {
			if (!(other instanceof _RistrettoPoint)) throw new Error("RistrettoPoint expected");
		}
		init(ep) {
			return new _RistrettoPoint(ep);
		}
		/** @deprecated use `import { ristretto255_hasher } from '@noble/curves/ed25519.js';` */
		static hashToCurve(hex) {
			return ristretto255_map((0, utils_ts_1.ensureBytes)("ristrettoHash", hex, 64));
		}
		static fromBytes(bytes) {
			(0, utils_js_1.abytes)(bytes, 32);
			const { a, d } = ed25519_CURVE;
			const P = ed25519_CURVE_p;
			const mod = (n) => Fp.create(n);
			const s = bytes255ToNumberLE(bytes);
			if (!(0, utils_ts_1.equalBytes)(Fp.toBytes(s), bytes) || (0, modular_ts_1.isNegativeLE)(s, P)) throw new Error("invalid ristretto255 encoding 1");
			const s2 = mod(s * s);
			const u1 = mod(_1n + a * s2);
			const u2 = mod(_1n - a * s2);
			const u1_2 = mod(u1 * u1);
			const u2_2 = mod(u2 * u2);
			const v = mod(a * d * u1_2 - u2_2);
			const { isValid, value: I } = invertSqrt(mod(v * u2_2));
			const Dx = mod(I * u2);
			const Dy = mod(I * Dx * v);
			let x = mod((s + s) * Dx);
			if ((0, modular_ts_1.isNegativeLE)(x, P)) x = mod(-x);
			const y = mod(u1 * Dy);
			const t = mod(x * y);
			if (!isValid || (0, modular_ts_1.isNegativeLE)(t, P) || y === _0n) throw new Error("invalid ristretto255 encoding 2");
			return new _RistrettoPoint(new exports.ed25519.Point(x, y, _1n, t));
		}
		/**
		* Converts ristretto-encoded string to ristretto point.
		* Described in [RFC9496](https://www.rfc-editor.org/rfc/rfc9496#name-decode).
		* @param hex Ristretto-encoded 32 bytes. Not every 32-byte string is valid ristretto encoding
		*/
		static fromHex(hex) {
			return _RistrettoPoint.fromBytes((0, utils_ts_1.ensureBytes)("ristrettoHex", hex, 32));
		}
		static msm(points, scalars) {
			return (0, curve_ts_1.pippenger)(_RistrettoPoint, exports.ed25519.Point.Fn, points, scalars);
		}
		/**
		* Encodes ristretto point to Uint8Array.
		* Described in [RFC9496](https://www.rfc-editor.org/rfc/rfc9496#name-encode).
		*/
		toBytes() {
			let { X, Y, Z, T } = this.ep;
			const P = ed25519_CURVE_p;
			const mod = (n) => Fp.create(n);
			const u1 = mod(mod(Z + Y) * mod(Z - Y));
			const u2 = mod(X * Y);
			const { value: invsqrt } = invertSqrt(mod(u1 * mod(u2 * u2)));
			const D1 = mod(invsqrt * u1);
			const D2 = mod(invsqrt * u2);
			const zInv = mod(D1 * D2 * T);
			let D;
			if ((0, modular_ts_1.isNegativeLE)(T * zInv, P)) {
				let _x = mod(Y * SQRT_M1);
				let _y = mod(X * SQRT_M1);
				X = _x;
				Y = _y;
				D = mod(D1 * INVSQRT_A_MINUS_D);
			} else D = D2;
			if ((0, modular_ts_1.isNegativeLE)(X * zInv, P)) Y = mod(-Y);
			let s = mod((Z - Y) * D);
			if ((0, modular_ts_1.isNegativeLE)(s, P)) s = mod(-s);
			return Fp.toBytes(s);
		}
		/**
		* Compares two Ristretto points.
		* Described in [RFC9496](https://www.rfc-editor.org/rfc/rfc9496#name-equals).
		*/
		equals(other) {
			this.assertSame(other);
			const { X: X1, Y: Y1 } = this.ep;
			const { X: X2, Y: Y2 } = other.ep;
			const mod = (n) => Fp.create(n);
			const one = mod(X1 * Y2) === mod(Y1 * X2);
			const two = mod(Y1 * Y2) === mod(X1 * X2);
			return one || two;
		}
		is0() {
			return this.equals(_RistrettoPoint.ZERO);
		}
	};
	_RistrettoPoint.BASE = new _RistrettoPoint(exports.ed25519.Point.BASE);
	_RistrettoPoint.ZERO = new _RistrettoPoint(exports.ed25519.Point.ZERO);
	_RistrettoPoint.Fp = Fp;
	_RistrettoPoint.Fn = Fn;
	exports.ristretto255 = { Point: _RistrettoPoint };
	/** Hashing to ristretto255 points / field. RFC 9380 methods. */
	exports.ristretto255_hasher = {
		hashToCurve(msg, options) {
			const DST = options?.DST || "ristretto255_XMD:SHA-512_R255MAP_RO_";
			return ristretto255_map((0, hash_to_curve_ts_1.expand_message_xmd)(msg, DST, 64, sha2_js_1.sha512));
		},
		hashToScalar(msg, options = { DST: hash_to_curve_ts_1._DST_scalar }) {
			const xmd = (0, hash_to_curve_ts_1.expand_message_xmd)(msg, options.DST, 64, sha2_js_1.sha512);
			return Fn.create((0, utils_ts_1.bytesToNumberLE)(xmd));
		}
	};
	/**
	* Weird / bogus points, useful for debugging.
	* All 8 ed25519 points of 8-torsion subgroup can be generated from the point
	* T = `26e8958fc2b227b045c3f489f2ef98f0d5dfac05d3c63339b13802886d53fc05`.
	* ⟨T⟩ = { O, T, 2T, 3T, 4T, 5T, 6T, 7T }
	*/
	exports.ED25519_TORSION_SUBGROUP = [
		"0100000000000000000000000000000000000000000000000000000000000000",
		"c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac037a",
		"0000000000000000000000000000000000000000000000000000000000000080",
		"26e8958fc2b227b045c3f489f2ef98f0d5dfac05d3c63339b13802886d53fc05",
		"ecffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7f",
		"26e8958fc2b227b045c3f489f2ef98f0d5dfac05d3c63339b13802886d53fc85",
		"0000000000000000000000000000000000000000000000000000000000000000",
		"c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac03fa"
	];
	/** @deprecated use `ed25519.utils.toMontgomery` */
	function edwardsToMontgomeryPub(edwardsPub) {
		return exports.ed25519.utils.toMontgomery((0, utils_ts_1.ensureBytes)("pub", edwardsPub));
	}
	/** @deprecated use `ed25519.utils.toMontgomery` */
	exports.edwardsToMontgomery = edwardsToMontgomeryPub;
	/** @deprecated use `ed25519.utils.toMontgomerySecret` */
	function edwardsToMontgomeryPriv(edwardsPriv) {
		return exports.ed25519.utils.toMontgomerySecret((0, utils_ts_1.ensureBytes)("pub", edwardsPriv));
	}
	/** @deprecated use `ristretto255.Point` */
	exports.RistrettoPoint = _RistrettoPoint;
	/** @deprecated use `import { ed25519_hasher } from '@noble/curves/ed25519.js';` */
	exports.hashToCurve = exports.ed25519_hasher.hashToCurve;
	/** @deprecated use `import { ed25519_hasher } from '@noble/curves/ed25519.js';` */
	exports.encodeToCurve = exports.ed25519_hasher.encodeToCurve;
	/** @deprecated use `import { ristretto255_hasher } from '@noble/curves/ed25519.js';` */
	exports.hashToRistretto255 = exports.ristretto255_hasher.hashToCurve;
	/** @deprecated use `import { ristretto255_hasher } from '@noble/curves/ed25519.js';` */
	exports.hash_to_ristretto255 = exports.ristretto255_hasher.hashToCurve;
}));
//#endregion
//#region node_modules/@cosmjs/crypto/build/ed25519.js
var require_ed25519 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Ed25519 = exports.Ed25519Keypair = void 0;
	var ed25519_js_1 = require_ed25519$1();
	var Ed25519Keypair = class Ed25519Keypair {
		static fromLibsodiumPrivkey(libsodiumPrivkey) {
			if (libsodiumPrivkey.length !== 64) throw new Error(`Unexpected key length ${libsodiumPrivkey.length}. Must be 64.`);
			return new Ed25519Keypair(libsodiumPrivkey.slice(0, 32), libsodiumPrivkey.slice(32, 64));
		}
		privkey;
		pubkey;
		constructor(privkey, pubkey) {
			this.privkey = privkey;
			this.pubkey = pubkey;
		}
		toLibsodiumPrivkey() {
			return new Uint8Array([...this.privkey, ...this.pubkey]);
		}
	};
	exports.Ed25519Keypair = Ed25519Keypair;
	var Ed25519 = class {
		/**
		* Generates a keypair deterministically from a given 32 bytes seed.
		*
		* This seed equals the Ed25519 private key.
		* For implementation details see crypto_sign_seed_keypair in
		* https://download.libsodium.org/doc/public-key_cryptography/public-key_signatures.html
		* and diagram on https://blog.mozilla.org/warner/2011/11/29/ed25519-keys/
		*/
		static async makeKeypair(privKey) {
			return new Ed25519Keypair(privKey, ed25519_js_1.ed25519.getPublicKey(privKey));
		}
		static async createSignature(message, keyPair) {
			return ed25519_js_1.ed25519.sign(message, keyPair.privkey);
		}
		static async verifySignature(signature, message, pubkey) {
			return ed25519_js_1.ed25519.verify(signature, message, pubkey);
		}
	};
	exports.Ed25519 = Ed25519;
}));
//#endregion
//#region node_modules/@cosmjs/crypto/build/hmac.js
var require_hmac = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Hmac = void 0;
	var encoding_1 = require_build$4();
	var Hmac = class {
		blockSize;
		messageHasher;
		oKeyPad;
		iKeyPad;
		hash;
		constructor(hashFunctionConstructor, originalKey) {
			const blockSize = new hashFunctionConstructor().blockSize;
			this.hash = (data) => (0, encoding_1.fixUint8Array)(new hashFunctionConstructor().update(data).digest());
			let key = originalKey;
			if (key.length > blockSize) key = this.hash(key);
			if (key.length < blockSize) {
				const zeroPadding = new Uint8Array(blockSize - key.length);
				key = new Uint8Array([...key, ...zeroPadding]);
			}
			this.oKeyPad = key.map((keyByte) => keyByte ^ 92);
			this.iKeyPad = key.map((keyByte) => keyByte ^ 54);
			this.messageHasher = new hashFunctionConstructor();
			this.blockSize = blockSize;
			this.update(this.iKeyPad);
		}
		update(data) {
			this.messageHasher.update(data);
			return this;
		}
		digest() {
			const innerHash = this.messageHasher.digest();
			return this.hash(new Uint8Array([...this.oKeyPad, ...innerHash]));
		}
	};
	exports.Hmac = Hmac;
}));
//#endregion
//#region node_modules/@noble/hashes/sha3.js
var require_sha3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.shake256 = exports.shake128 = exports.keccak_512 = exports.keccak_384 = exports.keccak_256 = exports.keccak_224 = exports.sha3_512 = exports.sha3_384 = exports.sha3_256 = exports.sha3_224 = exports.Keccak = void 0;
	exports.keccakP = keccakP;
	/**
	* SHA3 (keccak) hash function, based on a new "Sponge function" design.
	* Different from older hashes, the internal state is bigger than output size.
	*
	* Check out [FIPS-202](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.202.pdf),
	* [Website](https://keccak.team/keccak.html),
	* [the differences between SHA-3 and Keccak](https://crypto.stackexchange.com/questions/15727/what-are-the-key-differences-between-the-draft-sha-3-standard-and-the-keccak-sub).
	*
	* Check out `sha3-addons` module for cSHAKE, k12, and others.
	* @module
	*/
	var _u64_ts_1 = require__u64();
	var utils_ts_1 = require_utils$3();
	var _0n = BigInt(0);
	var _1n = BigInt(1);
	var _2n = BigInt(2);
	var _7n = BigInt(7);
	var _256n = BigInt(256);
	var _0x71n = BigInt(113);
	var SHA3_PI = [];
	var SHA3_ROTL = [];
	var _SHA3_IOTA = [];
	for (let round = 0, R = _1n, x = 1, y = 0; round < 24; round++) {
		[x, y] = [y, (2 * x + 3 * y) % 5];
		SHA3_PI.push(2 * (5 * y + x));
		SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
		let t = _0n;
		for (let j = 0; j < 7; j++) {
			R = (R << _1n ^ (R >> _7n) * _0x71n) % _256n;
			if (R & _2n) t ^= _1n << (_1n << /* @__PURE__ */ BigInt(j)) - _1n;
		}
		_SHA3_IOTA.push(t);
	}
	var IOTAS = (0, _u64_ts_1.split)(_SHA3_IOTA, true);
	var SHA3_IOTA_H = IOTAS[0];
	var SHA3_IOTA_L = IOTAS[1];
	var rotlH = (h, l, s) => s > 32 ? (0, _u64_ts_1.rotlBH)(h, l, s) : (0, _u64_ts_1.rotlSH)(h, l, s);
	var rotlL = (h, l, s) => s > 32 ? (0, _u64_ts_1.rotlBL)(h, l, s) : (0, _u64_ts_1.rotlSL)(h, l, s);
	/** `keccakf1600` internal function, additionally allows to adjust round count. */
	function keccakP(s, rounds = 24) {
		const B = new Uint32Array(10);
		for (let round = 24 - rounds; round < 24; round++) {
			for (let x = 0; x < 10; x++) B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
			for (let x = 0; x < 10; x += 2) {
				const idx1 = (x + 8) % 10;
				const idx0 = (x + 2) % 10;
				const B0 = B[idx0];
				const B1 = B[idx0 + 1];
				const Th = rotlH(B0, B1, 1) ^ B[idx1];
				const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
				for (let y = 0; y < 50; y += 10) {
					s[x + y] ^= Th;
					s[x + y + 1] ^= Tl;
				}
			}
			let curH = s[2];
			let curL = s[3];
			for (let t = 0; t < 24; t++) {
				const shift = SHA3_ROTL[t];
				const Th = rotlH(curH, curL, shift);
				const Tl = rotlL(curH, curL, shift);
				const PI = SHA3_PI[t];
				curH = s[PI];
				curL = s[PI + 1];
				s[PI] = Th;
				s[PI + 1] = Tl;
			}
			for (let y = 0; y < 50; y += 10) {
				for (let x = 0; x < 10; x++) B[x] = s[y + x];
				for (let x = 0; x < 10; x++) s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
			}
			s[0] ^= SHA3_IOTA_H[round];
			s[1] ^= SHA3_IOTA_L[round];
		}
		(0, utils_ts_1.clean)(B);
	}
	/** Keccak sponge function. */
	var Keccak = class Keccak extends utils_ts_1.Hash {
		constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
			super();
			this.pos = 0;
			this.posOut = 0;
			this.finished = false;
			this.destroyed = false;
			this.enableXOF = false;
			this.blockLen = blockLen;
			this.suffix = suffix;
			this.outputLen = outputLen;
			this.enableXOF = enableXOF;
			this.rounds = rounds;
			(0, utils_ts_1.anumber)(outputLen);
			if (!(0 < blockLen && blockLen < 200)) throw new Error("only keccak-f1600 function is supported");
			this.state = new Uint8Array(200);
			this.state32 = (0, utils_ts_1.u32)(this.state);
		}
		clone() {
			return this._cloneInto();
		}
		keccak() {
			(0, utils_ts_1.swap32IfBE)(this.state32);
			keccakP(this.state32, this.rounds);
			(0, utils_ts_1.swap32IfBE)(this.state32);
			this.posOut = 0;
			this.pos = 0;
		}
		update(data) {
			(0, utils_ts_1.aexists)(this);
			data = (0, utils_ts_1.toBytes)(data);
			(0, utils_ts_1.abytes)(data);
			const { blockLen, state } = this;
			const len = data.length;
			for (let pos = 0; pos < len;) {
				const take = Math.min(blockLen - this.pos, len - pos);
				for (let i = 0; i < take; i++) state[this.pos++] ^= data[pos++];
				if (this.pos === blockLen) this.keccak();
			}
			return this;
		}
		finish() {
			if (this.finished) return;
			this.finished = true;
			const { state, suffix, pos, blockLen } = this;
			state[pos] ^= suffix;
			if ((suffix & 128) !== 0 && pos === blockLen - 1) this.keccak();
			state[blockLen - 1] ^= 128;
			this.keccak();
		}
		writeInto(out) {
			(0, utils_ts_1.aexists)(this, false);
			(0, utils_ts_1.abytes)(out);
			this.finish();
			const bufferOut = this.state;
			const { blockLen } = this;
			for (let pos = 0, len = out.length; pos < len;) {
				if (this.posOut >= blockLen) this.keccak();
				const take = Math.min(blockLen - this.posOut, len - pos);
				out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
				this.posOut += take;
				pos += take;
			}
			return out;
		}
		xofInto(out) {
			if (!this.enableXOF) throw new Error("XOF is not possible for this instance");
			return this.writeInto(out);
		}
		xof(bytes) {
			(0, utils_ts_1.anumber)(bytes);
			return this.xofInto(new Uint8Array(bytes));
		}
		digestInto(out) {
			(0, utils_ts_1.aoutput)(out, this);
			if (this.finished) throw new Error("digest() was already called");
			this.writeInto(out);
			this.destroy();
			return out;
		}
		digest() {
			return this.digestInto(new Uint8Array(this.outputLen));
		}
		destroy() {
			this.destroyed = true;
			(0, utils_ts_1.clean)(this.state);
		}
		_cloneInto(to) {
			const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
			to || (to = new Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
			to.state32.set(this.state32);
			to.pos = this.pos;
			to.posOut = this.posOut;
			to.finished = this.finished;
			to.rounds = rounds;
			to.suffix = suffix;
			to.outputLen = outputLen;
			to.enableXOF = enableXOF;
			to.destroyed = this.destroyed;
			return to;
		}
	};
	exports.Keccak = Keccak;
	var gen = (suffix, blockLen, outputLen) => (0, utils_ts_1.createHasher)(() => new Keccak(blockLen, suffix, outputLen));
	/** SHA3-224 hash function. */
	exports.sha3_224 = gen(6, 144, 224 / 8);
	/** SHA3-256 hash function. Different from keccak-256. */
	exports.sha3_256 = gen(6, 136, 256 / 8);
	/** SHA3-384 hash function. */
	exports.sha3_384 = gen(6, 104, 384 / 8);
	/** SHA3-512 hash function. */
	exports.sha3_512 = gen(6, 72, 512 / 8);
	/** keccak-224 hash function. */
	exports.keccak_224 = gen(1, 144, 224 / 8);
	/** keccak-256 hash function. Different from SHA3-256. */
	exports.keccak_256 = gen(1, 136, 256 / 8);
	/** keccak-384 hash function. */
	exports.keccak_384 = gen(1, 104, 384 / 8);
	/** keccak-512 hash function. */
	exports.keccak_512 = gen(1, 72, 512 / 8);
	var genShake = (suffix, blockLen, outputLen) => (0, utils_ts_1.createXOFer)((opts = {}) => new Keccak(blockLen, suffix, opts.dkLen === void 0 ? outputLen : opts.dkLen, true));
	/** SHAKE128 XOF with 128-bit security. */
	exports.shake128 = genShake(31, 168, 128 / 8);
	/** SHAKE256 XOF with 256-bit security. */
	exports.shake256 = genShake(31, 136, 256 / 8);
}));
//#endregion
//#region node_modules/@cosmjs/crypto/build/utils.js
var require_utils$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.toRealUint8Array = toRealUint8Array;
	function toRealUint8Array(data) {
		if (data instanceof Uint8Array) return data;
		else return Uint8Array.from(data);
	}
}));
//#endregion
//#region node_modules/@cosmjs/crypto/build/keccak.js
var require_keccak = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Keccak256 = void 0;
	exports.keccak256 = keccak256;
	var encoding_1 = require_build$4();
	var sha3_js_1 = require_sha3();
	var utils_1 = require_utils$1();
	var Keccak256 = class {
		blockSize = 512 / 8;
		impl = sha3_js_1.keccak_256.create();
		constructor(firstData) {
			if (firstData) this.update(firstData);
		}
		update(data) {
			this.impl.update((0, utils_1.toRealUint8Array)(data));
			return this;
		}
		digest() {
			return (0, encoding_1.fixUint8Array)(this.impl.digest());
		}
	};
	exports.Keccak256 = Keccak256;
	/** Convenience function equivalent to `new Keccak256(data).digest()` */
	function keccak256(data) {
		return new Keccak256(data).digest();
	}
}));
//#endregion
//#region node_modules/@cosmjs/crypto/build/random.js
var require_random = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Random = void 0;
	var Random = class {
		/**
		* Returns `count` cryptographically secure random bytes
		*/
		static getBytes(count) {
			const out = new Uint8Array(count);
			globalThis.crypto.getRandomValues(out);
			return out;
		}
	};
	exports.Random = Random;
}));
//#endregion
//#region node_modules/@noble/hashes/legacy.js
var require_legacy = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ripemd160 = exports.RIPEMD160 = exports.md5 = exports.MD5 = exports.sha1 = exports.SHA1 = void 0;
	/**
	
	SHA1 (RFC 3174), MD5 (RFC 1321) and RIPEMD160 (RFC 2286) legacy, weak hash functions.
	Don't use them in a new protocol. What "weak" means:
	
	- Collisions can be made with 2^18 effort in MD5, 2^60 in SHA1, 2^80 in RIPEMD160.
	- No practical pre-image attacks (only theoretical, 2^123.4)
	- HMAC seems kinda ok: https://datatracker.ietf.org/doc/html/rfc6151
	* @module
	*/
	var _md_ts_1 = require__md();
	var utils_ts_1 = require_utils$3();
	/** Initial SHA1 state */
	var SHA1_IV = /* @__PURE__ */ Uint32Array.from([
		1732584193,
		4023233417,
		2562383102,
		271733878,
		3285377520
	]);
	var SHA1_W = /* @__PURE__ */ new Uint32Array(80);
	/** SHA1 legacy hash class. */
	var SHA1 = class extends _md_ts_1.HashMD {
		constructor() {
			super(64, 20, 8, false);
			this.A = SHA1_IV[0] | 0;
			this.B = SHA1_IV[1] | 0;
			this.C = SHA1_IV[2] | 0;
			this.D = SHA1_IV[3] | 0;
			this.E = SHA1_IV[4] | 0;
		}
		get() {
			const { A, B, C, D, E } = this;
			return [
				A,
				B,
				C,
				D,
				E
			];
		}
		set(A, B, C, D, E) {
			this.A = A | 0;
			this.B = B | 0;
			this.C = C | 0;
			this.D = D | 0;
			this.E = E | 0;
		}
		process(view, offset) {
			for (let i = 0; i < 16; i++, offset += 4) SHA1_W[i] = view.getUint32(offset, false);
			for (let i = 16; i < 80; i++) SHA1_W[i] = (0, utils_ts_1.rotl)(SHA1_W[i - 3] ^ SHA1_W[i - 8] ^ SHA1_W[i - 14] ^ SHA1_W[i - 16], 1);
			let { A, B, C, D, E } = this;
			for (let i = 0; i < 80; i++) {
				let F, K;
				if (i < 20) {
					F = (0, _md_ts_1.Chi)(B, C, D);
					K = 1518500249;
				} else if (i < 40) {
					F = B ^ C ^ D;
					K = 1859775393;
				} else if (i < 60) {
					F = (0, _md_ts_1.Maj)(B, C, D);
					K = 2400959708;
				} else {
					F = B ^ C ^ D;
					K = 3395469782;
				}
				const T = (0, utils_ts_1.rotl)(A, 5) + F + E + K + SHA1_W[i] | 0;
				E = D;
				D = C;
				C = (0, utils_ts_1.rotl)(B, 30);
				B = A;
				A = T;
			}
			A = A + this.A | 0;
			B = B + this.B | 0;
			C = C + this.C | 0;
			D = D + this.D | 0;
			E = E + this.E | 0;
			this.set(A, B, C, D, E);
		}
		roundClean() {
			(0, utils_ts_1.clean)(SHA1_W);
		}
		destroy() {
			this.set(0, 0, 0, 0, 0);
			(0, utils_ts_1.clean)(this.buffer);
		}
	};
	exports.SHA1 = SHA1;
	/** SHA1 (RFC 3174) legacy hash function. It was cryptographically broken. */
	exports.sha1 = (0, utils_ts_1.createHasher)(() => new SHA1());
	/** Per-round constants */
	var p32 = /* @__PURE__ */ Math.pow(2, 32);
	var K = /* @__PURE__ */ Array.from({ length: 64 }, (_, i) => Math.floor(p32 * Math.abs(Math.sin(i + 1))));
	/** md5 initial state: same as sha1, but 4 u32 instead of 5. */
	var MD5_IV = /* @__PURE__ */ SHA1_IV.slice(0, 4);
	var MD5_W = /* @__PURE__ */ new Uint32Array(16);
	/** MD5 legacy hash class. */
	var MD5 = class extends _md_ts_1.HashMD {
		constructor() {
			super(64, 16, 8, true);
			this.A = MD5_IV[0] | 0;
			this.B = MD5_IV[1] | 0;
			this.C = MD5_IV[2] | 0;
			this.D = MD5_IV[3] | 0;
		}
		get() {
			const { A, B, C, D } = this;
			return [
				A,
				B,
				C,
				D
			];
		}
		set(A, B, C, D) {
			this.A = A | 0;
			this.B = B | 0;
			this.C = C | 0;
			this.D = D | 0;
		}
		process(view, offset) {
			for (let i = 0; i < 16; i++, offset += 4) MD5_W[i] = view.getUint32(offset, true);
			let { A, B, C, D } = this;
			for (let i = 0; i < 64; i++) {
				let F, g, s;
				if (i < 16) {
					F = (0, _md_ts_1.Chi)(B, C, D);
					g = i;
					s = [
						7,
						12,
						17,
						22
					];
				} else if (i < 32) {
					F = (0, _md_ts_1.Chi)(D, B, C);
					g = (5 * i + 1) % 16;
					s = [
						5,
						9,
						14,
						20
					];
				} else if (i < 48) {
					F = B ^ C ^ D;
					g = (3 * i + 5) % 16;
					s = [
						4,
						11,
						16,
						23
					];
				} else {
					F = C ^ (B | ~D);
					g = 7 * i % 16;
					s = [
						6,
						10,
						15,
						21
					];
				}
				F = F + A + K[i] + MD5_W[g];
				A = D;
				D = C;
				C = B;
				B = B + (0, utils_ts_1.rotl)(F, s[i % 4]);
			}
			A = A + this.A | 0;
			B = B + this.B | 0;
			C = C + this.C | 0;
			D = D + this.D | 0;
			this.set(A, B, C, D);
		}
		roundClean() {
			(0, utils_ts_1.clean)(MD5_W);
		}
		destroy() {
			this.set(0, 0, 0, 0);
			(0, utils_ts_1.clean)(this.buffer);
		}
	};
	exports.MD5 = MD5;
	/**
	* MD5 (RFC 1321) legacy hash function. It was cryptographically broken.
	* MD5 architecture is similar to SHA1, with some differences:
	* - Reduced output length: 16 bytes (128 bit) instead of 20
	* - 64 rounds, instead of 80
	* - Little-endian: could be faster, but will require more code
	* - Non-linear index selection: huge speed-up for unroll
	* - Per round constants: more memory accesses, additional speed-up for unroll
	*/
	exports.md5 = (0, utils_ts_1.createHasher)(() => new MD5());
	var Rho160 = /* @__PURE__ */ Uint8Array.from([
		7,
		4,
		13,
		1,
		10,
		6,
		15,
		3,
		12,
		0,
		9,
		5,
		2,
		14,
		11,
		8
	]);
	var Id160 = Uint8Array.from(new Array(16).fill(0).map((_, i) => i));
	var Pi160 = Id160.map((i) => (9 * i + 5) % 16);
	var idxLR = /* @__PURE__ */ (() => {
		const res = [[Id160], [Pi160]];
		for (let i = 0; i < 4; i++) for (let j of res) j.push(j[i].map((k) => Rho160[k]));
		return res;
	})();
	var idxL = idxLR[0];
	var idxR = idxLR[1];
	var shifts160 = /* @__PURE__ */ [
		[
			11,
			14,
			15,
			12,
			5,
			8,
			7,
			9,
			11,
			13,
			14,
			15,
			6,
			7,
			9,
			8
		],
		[
			12,
			13,
			11,
			15,
			6,
			9,
			9,
			7,
			12,
			15,
			11,
			13,
			7,
			8,
			7,
			7
		],
		[
			13,
			15,
			14,
			11,
			7,
			7,
			6,
			8,
			13,
			14,
			13,
			12,
			5,
			5,
			6,
			9
		],
		[
			14,
			11,
			12,
			14,
			8,
			6,
			5,
			5,
			15,
			12,
			15,
			14,
			9,
			9,
			8,
			6
		],
		[
			15,
			12,
			13,
			13,
			9,
			5,
			8,
			6,
			14,
			11,
			12,
			11,
			8,
			6,
			5,
			5
		]
	].map((i) => Uint8Array.from(i));
	var shiftsL160 = /* @__PURE__ */ idxL.map((idx, i) => idx.map((j) => shifts160[i][j]));
	var shiftsR160 = /* @__PURE__ */ idxR.map((idx, i) => idx.map((j) => shifts160[i][j]));
	var Kl160 = /* @__PURE__ */ Uint32Array.from([
		0,
		1518500249,
		1859775393,
		2400959708,
		2840853838
	]);
	var Kr160 = /* @__PURE__ */ Uint32Array.from([
		1352829926,
		1548603684,
		1836072691,
		2053994217,
		0
	]);
	function ripemd_f(group, x, y, z) {
		if (group === 0) return x ^ y ^ z;
		if (group === 1) return x & y | ~x & z;
		if (group === 2) return (x | ~y) ^ z;
		if (group === 3) return x & z | y & ~z;
		return x ^ (y | ~z);
	}
	var BUF_160 = /* @__PURE__ */ new Uint32Array(16);
	var RIPEMD160 = class extends _md_ts_1.HashMD {
		constructor() {
			super(64, 20, 8, true);
			this.h0 = 1732584193;
			this.h1 = -271733879;
			this.h2 = -1732584194;
			this.h3 = 271733878;
			this.h4 = -1009589776;
		}
		get() {
			const { h0, h1, h2, h3, h4 } = this;
			return [
				h0,
				h1,
				h2,
				h3,
				h4
			];
		}
		set(h0, h1, h2, h3, h4) {
			this.h0 = h0 | 0;
			this.h1 = h1 | 0;
			this.h2 = h2 | 0;
			this.h3 = h3 | 0;
			this.h4 = h4 | 0;
		}
		process(view, offset) {
			for (let i = 0; i < 16; i++, offset += 4) BUF_160[i] = view.getUint32(offset, true);
			let al = this.h0 | 0, ar = al, bl = this.h1 | 0, br = bl, cl = this.h2 | 0, cr = cl, dl = this.h3 | 0, dr = dl, el = this.h4 | 0, er = el;
			for (let group = 0; group < 5; group++) {
				const rGroup = 4 - group;
				const hbl = Kl160[group], hbr = Kr160[group];
				const rl = idxL[group], rr = idxR[group];
				const sl = shiftsL160[group], sr = shiftsR160[group];
				for (let i = 0; i < 16; i++) {
					const tl = (0, utils_ts_1.rotl)(al + ripemd_f(group, bl, cl, dl) + BUF_160[rl[i]] + hbl, sl[i]) + el | 0;
					al = el, el = dl, dl = (0, utils_ts_1.rotl)(cl, 10) | 0, cl = bl, bl = tl;
				}
				for (let i = 0; i < 16; i++) {
					const tr = (0, utils_ts_1.rotl)(ar + ripemd_f(rGroup, br, cr, dr) + BUF_160[rr[i]] + hbr, sr[i]) + er | 0;
					ar = er, er = dr, dr = (0, utils_ts_1.rotl)(cr, 10) | 0, cr = br, br = tr;
				}
			}
			this.set(this.h1 + cl + dr | 0, this.h2 + dl + er | 0, this.h3 + el + ar | 0, this.h4 + al + br | 0, this.h0 + bl + cr | 0);
		}
		roundClean() {
			(0, utils_ts_1.clean)(BUF_160);
		}
		destroy() {
			this.destroyed = true;
			(0, utils_ts_1.clean)(this.buffer);
			this.set(0, 0, 0, 0, 0);
		}
	};
	exports.RIPEMD160 = RIPEMD160;
	/**
	* RIPEMD-160 - a legacy hash function from 1990s.
	* * https://homes.esat.kuleuven.be/~bosselae/ripemd160.html
	* * https://homes.esat.kuleuven.be/~bosselae/ripemd160/pdf/AB-9601/AB-9601.pdf
	*/
	exports.ripemd160 = (0, utils_ts_1.createHasher)(() => new RIPEMD160());
}));
//#endregion
//#region node_modules/@cosmjs/crypto/build/ripemd.js
var require_ripemd = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Ripemd160 = void 0;
	exports.ripemd160 = ripemd160;
	var encoding_1 = require_build$4();
	var legacy_js_1 = require_legacy();
	var utils_1 = require_utils$1();
	var Ripemd160 = class {
		blockSize = 512 / 8;
		impl = legacy_js_1.ripemd160.create();
		constructor(firstData) {
			if (firstData) this.update(firstData);
		}
		update(data) {
			this.impl.update((0, utils_1.toRealUint8Array)(data));
			return this;
		}
		digest() {
			return (0, encoding_1.fixUint8Array)(this.impl.digest());
		}
	};
	exports.Ripemd160 = Ripemd160;
	/** Convenience function equivalent to `new Ripemd160(data).digest()` */
	function ripemd160(data) {
		return new Ripemd160(data).digest();
	}
}));
//#endregion
//#region node_modules/@noble/curves/abstract/weierstrass.js
var require_weierstrass = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DER = exports.DERErr = void 0;
	exports._splitEndoScalar = _splitEndoScalar;
	exports._normFnElement = _normFnElement;
	exports.weierstrassN = weierstrassN;
	exports.SWUFpSqrtRatio = SWUFpSqrtRatio;
	exports.mapToCurveSimpleSWU = mapToCurveSimpleSWU;
	exports.ecdh = ecdh;
	exports.ecdsa = ecdsa;
	exports.weierstrassPoints = weierstrassPoints;
	exports._legacyHelperEquat = _legacyHelperEquat;
	exports.weierstrass = weierstrass;
	/**
	* Short Weierstrass curve methods. The formula is: y² = x³ + ax + b.
	*
	* ### Design rationale for types
	*
	* * Interaction between classes from different curves should fail:
	*   `k256.Point.BASE.add(p256.Point.BASE)`
	* * For this purpose we want to use `instanceof` operator, which is fast and works during runtime
	* * Different calls of `curve()` would return different classes -
	*   `curve(params) !== curve(params)`: if somebody decided to monkey-patch their curve,
	*   it won't affect others
	*
	* TypeScript can't infer types for classes created inside a function. Classes is one instance
	* of nominative types in TypeScript and interfaces only check for shape, so it's hard to create
	* unique type for every function call.
	*
	* We can use generic types via some param, like curve opts, but that would:
	*     1. Enable interaction between `curve(params)` and `curve(params)` (curves of same params)
	*     which is hard to debug.
	*     2. Params can be generic and we can't enforce them to be constant value:
	*     if somebody creates curve from non-constant params,
	*     it would be allowed to interact with other curves with non-constant params
	*
	* @todo https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#unique-symbol
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var hmac_js_1 = require_hmac$1();
	var utils_1 = require_utils$3();
	var utils_ts_1 = require_utils$2();
	var curve_ts_1 = require_curve();
	var modular_ts_1 = require_modular();
	var divNearest = (num, den) => (num + (num >= 0 ? den : -den) / _2n) / den;
	/**
	* Splits scalar for GLV endomorphism.
	*/
	function _splitEndoScalar(k, basis, n) {
		const [[a1, b1], [a2, b2]] = basis;
		const c1 = divNearest(b2 * k, n);
		const c2 = divNearest(-b1 * k, n);
		let k1 = k - c1 * a1 - c2 * a2;
		let k2 = -c1 * b1 - c2 * b2;
		const k1neg = k1 < _0n;
		const k2neg = k2 < _0n;
		if (k1neg) k1 = -k1;
		if (k2neg) k2 = -k2;
		const MAX_NUM = (0, utils_ts_1.bitMask)(Math.ceil((0, utils_ts_1.bitLen)(n) / 2)) + _1n;
		if (k1 < _0n || k1 >= MAX_NUM || k2 < _0n || k2 >= MAX_NUM) throw new Error("splitScalar (endomorphism): failed, k=" + k);
		return {
			k1neg,
			k1,
			k2neg,
			k2
		};
	}
	function validateSigFormat(format) {
		if (![
			"compact",
			"recovered",
			"der"
		].includes(format)) throw new Error("Signature format must be \"compact\", \"recovered\", or \"der\"");
		return format;
	}
	function validateSigOpts(opts, def) {
		const optsn = {};
		for (let optName of Object.keys(def)) optsn[optName] = opts[optName] === void 0 ? def[optName] : opts[optName];
		(0, utils_ts_1._abool2)(optsn.lowS, "lowS");
		(0, utils_ts_1._abool2)(optsn.prehash, "prehash");
		if (optsn.format !== void 0) validateSigFormat(optsn.format);
		return optsn;
	}
	var DERErr = class extends Error {
		constructor(m = "") {
			super(m);
		}
	};
	exports.DERErr = DERErr;
	/**
	* ASN.1 DER encoding utilities. ASN is very complex & fragile. Format:
	*
	*     [0x30 (SEQUENCE), bytelength, 0x02 (INTEGER), intLength, R, 0x02 (INTEGER), intLength, S]
	*
	* Docs: https://letsencrypt.org/docs/a-warm-welcome-to-asn1-and-der/, https://luca.ntop.org/Teaching/Appunti/asn1.html
	*/
	exports.DER = {
		Err: DERErr,
		_tlv: {
			encode: (tag, data) => {
				const { Err: E } = exports.DER;
				if (tag < 0 || tag > 256) throw new E("tlv.encode: wrong tag");
				if (data.length & 1) throw new E("tlv.encode: unpadded data");
				const dataLen = data.length / 2;
				const len = (0, utils_ts_1.numberToHexUnpadded)(dataLen);
				if (len.length / 2 & 128) throw new E("tlv.encode: long form length too big");
				const lenLen = dataLen > 127 ? (0, utils_ts_1.numberToHexUnpadded)(len.length / 2 | 128) : "";
				return (0, utils_ts_1.numberToHexUnpadded)(tag) + lenLen + len + data;
			},
			decode(tag, data) {
				const { Err: E } = exports.DER;
				let pos = 0;
				if (tag < 0 || tag > 256) throw new E("tlv.encode: wrong tag");
				if (data.length < 2 || data[pos++] !== tag) throw new E("tlv.decode: wrong tlv");
				const first = data[pos++];
				const isLong = !!(first & 128);
				let length = 0;
				if (!isLong) length = first;
				else {
					const lenLen = first & 127;
					if (!lenLen) throw new E("tlv.decode(long): indefinite length not supported");
					if (lenLen > 4) throw new E("tlv.decode(long): byte length is too big");
					const lengthBytes = data.subarray(pos, pos + lenLen);
					if (lengthBytes.length !== lenLen) throw new E("tlv.decode: length bytes not complete");
					if (lengthBytes[0] === 0) throw new E("tlv.decode(long): zero leftmost byte");
					for (const b of lengthBytes) length = length << 8 | b;
					pos += lenLen;
					if (length < 128) throw new E("tlv.decode(long): not minimal encoding");
				}
				const v = data.subarray(pos, pos + length);
				if (v.length !== length) throw new E("tlv.decode: wrong value length");
				return {
					v,
					l: data.subarray(pos + length)
				};
			}
		},
		_int: {
			encode(num) {
				const { Err: E } = exports.DER;
				if (num < _0n) throw new E("integer: negative integers are not allowed");
				let hex = (0, utils_ts_1.numberToHexUnpadded)(num);
				if (Number.parseInt(hex[0], 16) & 8) hex = "00" + hex;
				if (hex.length & 1) throw new E("unexpected DER parsing assertion: unpadded hex");
				return hex;
			},
			decode(data) {
				const { Err: E } = exports.DER;
				if (data[0] & 128) throw new E("invalid signature integer: negative");
				if (data[0] === 0 && !(data[1] & 128)) throw new E("invalid signature integer: unnecessary leading zero");
				return (0, utils_ts_1.bytesToNumberBE)(data);
			}
		},
		toSig(hex) {
			const { Err: E, _int: int, _tlv: tlv } = exports.DER;
			const data = (0, utils_ts_1.ensureBytes)("signature", hex);
			const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
			if (seqLeftBytes.length) throw new E("invalid signature: left bytes after parsing");
			const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
			const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
			if (sLeftBytes.length) throw new E("invalid signature: left bytes after parsing");
			return {
				r: int.decode(rBytes),
				s: int.decode(sBytes)
			};
		},
		hexFromSig(sig) {
			const { _tlv: tlv, _int: int } = exports.DER;
			const seq = tlv.encode(2, int.encode(sig.r)) + tlv.encode(2, int.encode(sig.s));
			return tlv.encode(48, seq);
		}
	};
	var _0n = BigInt(0), _1n = BigInt(1), _2n = BigInt(2), _3n = BigInt(3), _4n = BigInt(4);
	function _normFnElement(Fn, key) {
		const { BYTES: expected } = Fn;
		let num;
		if (typeof key === "bigint") num = key;
		else {
			let bytes = (0, utils_ts_1.ensureBytes)("private key", key);
			try {
				num = Fn.fromBytes(bytes);
			} catch (error) {
				throw new Error(`invalid private key: expected ui8a of size ${expected}, got ${typeof key}`);
			}
		}
		if (!Fn.isValidNot0(num)) throw new Error("invalid private key: out of range [1..N-1]");
		return num;
	}
	/**
	* Creates weierstrass Point constructor, based on specified curve options.
	*
	* @example
	```js
	const opts = {
	p: BigInt('0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff'),
	n: BigInt('0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551'),
	h: BigInt(1),
	a: BigInt('0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc'),
	b: BigInt('0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b'),
	Gx: BigInt('0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296'),
	Gy: BigInt('0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5'),
	};
	const p256_Point = weierstrass(opts);
	```
	*/
	function weierstrassN(params, extraOpts = {}) {
		const validated = (0, curve_ts_1._createCurveFields)("weierstrass", params, extraOpts);
		const { Fp, Fn } = validated;
		let CURVE = validated.CURVE;
		const { h: cofactor, n: CURVE_ORDER } = CURVE;
		(0, utils_ts_1._validateObject)(extraOpts, {}, {
			allowInfinityPoint: "boolean",
			clearCofactor: "function",
			isTorsionFree: "function",
			fromBytes: "function",
			toBytes: "function",
			endo: "object",
			wrapPrivateKey: "boolean"
		});
		const { endo } = extraOpts;
		if (endo) {
			if (!Fp.is0(CURVE.a) || typeof endo.beta !== "bigint" || !Array.isArray(endo.basises)) throw new Error("invalid endo: expected \"beta\": bigint and \"basises\": array");
		}
		const lengths = getWLengths(Fp, Fn);
		function assertCompressionIsSupported() {
			if (!Fp.isOdd) throw new Error("compression is not supported: Field does not have .isOdd()");
		}
		function pointToBytes(_c, point, isCompressed) {
			const { x, y } = point.toAffine();
			const bx = Fp.toBytes(x);
			(0, utils_ts_1._abool2)(isCompressed, "isCompressed");
			if (isCompressed) {
				assertCompressionIsSupported();
				const hasEvenY = !Fp.isOdd(y);
				return (0, utils_ts_1.concatBytes)(pprefix(hasEvenY), bx);
			} else return (0, utils_ts_1.concatBytes)(Uint8Array.of(4), bx, Fp.toBytes(y));
		}
		function pointFromBytes(bytes) {
			(0, utils_ts_1._abytes2)(bytes, void 0, "Point");
			const { publicKey: comp, publicKeyUncompressed: uncomp } = lengths;
			const length = bytes.length;
			const head = bytes[0];
			const tail = bytes.subarray(1);
			if (length === comp && (head === 2 || head === 3)) {
				const x = Fp.fromBytes(tail);
				if (!Fp.isValid(x)) throw new Error("bad point: is not on curve, wrong x");
				const y2 = weierstrassEquation(x);
				let y;
				try {
					y = Fp.sqrt(y2);
				} catch (sqrtError) {
					const err = sqrtError instanceof Error ? ": " + sqrtError.message : "";
					throw new Error("bad point: is not on curve, sqrt error" + err);
				}
				assertCompressionIsSupported();
				const isYOdd = Fp.isOdd(y);
				if ((head & 1) === 1 !== isYOdd) y = Fp.neg(y);
				return {
					x,
					y
				};
			} else if (length === uncomp && head === 4) {
				const L = Fp.BYTES;
				const x = Fp.fromBytes(tail.subarray(0, L));
				const y = Fp.fromBytes(tail.subarray(L, L * 2));
				if (!isValidXY(x, y)) throw new Error("bad point: is not on curve");
				return {
					x,
					y
				};
			} else throw new Error(`bad point: got length ${length}, expected compressed=${comp} or uncompressed=${uncomp}`);
		}
		const encodePoint = extraOpts.toBytes || pointToBytes;
		const decodePoint = extraOpts.fromBytes || pointFromBytes;
		function weierstrassEquation(x) {
			const x2 = Fp.sqr(x);
			const x3 = Fp.mul(x2, x);
			return Fp.add(Fp.add(x3, Fp.mul(x, CURVE.a)), CURVE.b);
		}
		/** Checks whether equation holds for given x, y: y² == x³ + ax + b */
		function isValidXY(x, y) {
			const left = Fp.sqr(y);
			const right = weierstrassEquation(x);
			return Fp.eql(left, right);
		}
		if (!isValidXY(CURVE.Gx, CURVE.Gy)) throw new Error("bad curve params: generator point");
		const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n), _4n);
		const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
		if (Fp.is0(Fp.add(_4a3, _27b2))) throw new Error("bad curve params: a or b");
		/** Asserts coordinate is valid: 0 <= n < Fp.ORDER. */
		function acoord(title, n, banZero = false) {
			if (!Fp.isValid(n) || banZero && Fp.is0(n)) throw new Error(`bad point coordinate ${title}`);
			return n;
		}
		function aprjpoint(other) {
			if (!(other instanceof Point)) throw new Error("ProjectivePoint expected");
		}
		function splitEndoScalarN(k) {
			if (!endo || !endo.basises) throw new Error("no endo");
			return _splitEndoScalar(k, endo.basises, Fn.ORDER);
		}
		const toAffineMemo = (0, utils_ts_1.memoized)((p, iz) => {
			const { X, Y, Z } = p;
			if (Fp.eql(Z, Fp.ONE)) return {
				x: X,
				y: Y
			};
			const is0 = p.is0();
			if (iz == null) iz = is0 ? Fp.ONE : Fp.inv(Z);
			const x = Fp.mul(X, iz);
			const y = Fp.mul(Y, iz);
			const zz = Fp.mul(Z, iz);
			if (is0) return {
				x: Fp.ZERO,
				y: Fp.ZERO
			};
			if (!Fp.eql(zz, Fp.ONE)) throw new Error("invZ was invalid");
			return {
				x,
				y
			};
		});
		const assertValidMemo = (0, utils_ts_1.memoized)((p) => {
			if (p.is0()) {
				if (extraOpts.allowInfinityPoint && !Fp.is0(p.Y)) return;
				throw new Error("bad point: ZERO");
			}
			const { x, y } = p.toAffine();
			if (!Fp.isValid(x) || !Fp.isValid(y)) throw new Error("bad point: x or y not field elements");
			if (!isValidXY(x, y)) throw new Error("bad point: equation left != right");
			if (!p.isTorsionFree()) throw new Error("bad point: not in prime-order subgroup");
			return true;
		});
		function finishEndo(endoBeta, k1p, k2p, k1neg, k2neg) {
			k2p = new Point(Fp.mul(k2p.X, endoBeta), k2p.Y, k2p.Z);
			k1p = (0, curve_ts_1.negateCt)(k1neg, k1p);
			k2p = (0, curve_ts_1.negateCt)(k2neg, k2p);
			return k1p.add(k2p);
		}
		/**
		* Projective Point works in 3d / projective (homogeneous) coordinates:(X, Y, Z) ∋ (x=X/Z, y=Y/Z).
		* Default Point works in 2d / affine coordinates: (x, y).
		* We're doing calculations in projective, because its operations don't require costly inversion.
		*/
		class Point {
			/** Does NOT validate if the point is valid. Use `.assertValidity()`. */
			constructor(X, Y, Z) {
				this.X = acoord("x", X);
				this.Y = acoord("y", Y, true);
				this.Z = acoord("z", Z);
				Object.freeze(this);
			}
			static CURVE() {
				return CURVE;
			}
			/** Does NOT validate if the point is valid. Use `.assertValidity()`. */
			static fromAffine(p) {
				const { x, y } = p || {};
				if (!p || !Fp.isValid(x) || !Fp.isValid(y)) throw new Error("invalid affine point");
				if (p instanceof Point) throw new Error("projective point not allowed");
				if (Fp.is0(x) && Fp.is0(y)) return Point.ZERO;
				return new Point(x, y, Fp.ONE);
			}
			static fromBytes(bytes) {
				const P = Point.fromAffine(decodePoint((0, utils_ts_1._abytes2)(bytes, void 0, "point")));
				P.assertValidity();
				return P;
			}
			static fromHex(hex) {
				return Point.fromBytes((0, utils_ts_1.ensureBytes)("pointHex", hex));
			}
			get x() {
				return this.toAffine().x;
			}
			get y() {
				return this.toAffine().y;
			}
			/**
			*
			* @param windowSize
			* @param isLazy true will defer table computation until the first multiplication
			* @returns
			*/
			precompute(windowSize = 8, isLazy = true) {
				wnaf.createCache(this, windowSize);
				if (!isLazy) this.multiply(_3n);
				return this;
			}
			/** A point on curve is valid if it conforms to equation. */
			assertValidity() {
				assertValidMemo(this);
			}
			hasEvenY() {
				const { y } = this.toAffine();
				if (!Fp.isOdd) throw new Error("Field doesn't support isOdd");
				return !Fp.isOdd(y);
			}
			/** Compare one point to another. */
			equals(other) {
				aprjpoint(other);
				const { X: X1, Y: Y1, Z: Z1 } = this;
				const { X: X2, Y: Y2, Z: Z2 } = other;
				const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
				const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
				return U1 && U2;
			}
			/** Flips point to one corresponding to (x, -y) in Affine coordinates. */
			negate() {
				return new Point(this.X, Fp.neg(this.Y), this.Z);
			}
			double() {
				const { a, b } = CURVE;
				const b3 = Fp.mul(b, _3n);
				const { X: X1, Y: Y1, Z: Z1 } = this;
				let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
				let t0 = Fp.mul(X1, X1);
				let t1 = Fp.mul(Y1, Y1);
				let t2 = Fp.mul(Z1, Z1);
				let t3 = Fp.mul(X1, Y1);
				t3 = Fp.add(t3, t3);
				Z3 = Fp.mul(X1, Z1);
				Z3 = Fp.add(Z3, Z3);
				X3 = Fp.mul(a, Z3);
				Y3 = Fp.mul(b3, t2);
				Y3 = Fp.add(X3, Y3);
				X3 = Fp.sub(t1, Y3);
				Y3 = Fp.add(t1, Y3);
				Y3 = Fp.mul(X3, Y3);
				X3 = Fp.mul(t3, X3);
				Z3 = Fp.mul(b3, Z3);
				t2 = Fp.mul(a, t2);
				t3 = Fp.sub(t0, t2);
				t3 = Fp.mul(a, t3);
				t3 = Fp.add(t3, Z3);
				Z3 = Fp.add(t0, t0);
				t0 = Fp.add(Z3, t0);
				t0 = Fp.add(t0, t2);
				t0 = Fp.mul(t0, t3);
				Y3 = Fp.add(Y3, t0);
				t2 = Fp.mul(Y1, Z1);
				t2 = Fp.add(t2, t2);
				t0 = Fp.mul(t2, t3);
				X3 = Fp.sub(X3, t0);
				Z3 = Fp.mul(t2, t1);
				Z3 = Fp.add(Z3, Z3);
				Z3 = Fp.add(Z3, Z3);
				return new Point(X3, Y3, Z3);
			}
			add(other) {
				aprjpoint(other);
				const { X: X1, Y: Y1, Z: Z1 } = this;
				const { X: X2, Y: Y2, Z: Z2 } = other;
				let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
				const a = CURVE.a;
				const b3 = Fp.mul(CURVE.b, _3n);
				let t0 = Fp.mul(X1, X2);
				let t1 = Fp.mul(Y1, Y2);
				let t2 = Fp.mul(Z1, Z2);
				let t3 = Fp.add(X1, Y1);
				let t4 = Fp.add(X2, Y2);
				t3 = Fp.mul(t3, t4);
				t4 = Fp.add(t0, t1);
				t3 = Fp.sub(t3, t4);
				t4 = Fp.add(X1, Z1);
				let t5 = Fp.add(X2, Z2);
				t4 = Fp.mul(t4, t5);
				t5 = Fp.add(t0, t2);
				t4 = Fp.sub(t4, t5);
				t5 = Fp.add(Y1, Z1);
				X3 = Fp.add(Y2, Z2);
				t5 = Fp.mul(t5, X3);
				X3 = Fp.add(t1, t2);
				t5 = Fp.sub(t5, X3);
				Z3 = Fp.mul(a, t4);
				X3 = Fp.mul(b3, t2);
				Z3 = Fp.add(X3, Z3);
				X3 = Fp.sub(t1, Z3);
				Z3 = Fp.add(t1, Z3);
				Y3 = Fp.mul(X3, Z3);
				t1 = Fp.add(t0, t0);
				t1 = Fp.add(t1, t0);
				t2 = Fp.mul(a, t2);
				t4 = Fp.mul(b3, t4);
				t1 = Fp.add(t1, t2);
				t2 = Fp.sub(t0, t2);
				t2 = Fp.mul(a, t2);
				t4 = Fp.add(t4, t2);
				t0 = Fp.mul(t1, t4);
				Y3 = Fp.add(Y3, t0);
				t0 = Fp.mul(t5, t4);
				X3 = Fp.mul(t3, X3);
				X3 = Fp.sub(X3, t0);
				t0 = Fp.mul(t3, t1);
				Z3 = Fp.mul(t5, Z3);
				Z3 = Fp.add(Z3, t0);
				return new Point(X3, Y3, Z3);
			}
			subtract(other) {
				return this.add(other.negate());
			}
			is0() {
				return this.equals(Point.ZERO);
			}
			/**
			* Constant time multiplication.
			* Uses wNAF method. Windowed method may be 10% faster,
			* but takes 2x longer to generate and consumes 2x memory.
			* Uses precomputes when available.
			* Uses endomorphism for Koblitz curves.
			* @param scalar by which the point would be multiplied
			* @returns New point
			*/
			multiply(scalar) {
				const { endo } = extraOpts;
				if (!Fn.isValidNot0(scalar)) throw new Error("invalid scalar: out of range");
				let point, fake;
				const mul = (n) => wnaf.cached(this, n, (p) => (0, curve_ts_1.normalizeZ)(Point, p));
				/** See docs for {@link EndomorphismOpts} */
				if (endo) {
					const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(scalar);
					const { p: k1p, f: k1f } = mul(k1);
					const { p: k2p, f: k2f } = mul(k2);
					fake = k1f.add(k2f);
					point = finishEndo(endo.beta, k1p, k2p, k1neg, k2neg);
				} else {
					const { p, f } = mul(scalar);
					point = p;
					fake = f;
				}
				return (0, curve_ts_1.normalizeZ)(Point, [point, fake])[0];
			}
			/**
			* Non-constant-time multiplication. Uses double-and-add algorithm.
			* It's faster, but should only be used when you don't care about
			* an exposed secret key e.g. sig verification, which works over *public* keys.
			*/
			multiplyUnsafe(sc) {
				const { endo } = extraOpts;
				const p = this;
				if (!Fn.isValid(sc)) throw new Error("invalid scalar: out of range");
				if (sc === _0n || p.is0()) return Point.ZERO;
				if (sc === _1n) return p;
				if (wnaf.hasCache(this)) return this.multiply(sc);
				if (endo) {
					const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(sc);
					const { p1, p2 } = (0, curve_ts_1.mulEndoUnsafe)(Point, p, k1, k2);
					return finishEndo(endo.beta, p1, p2, k1neg, k2neg);
				} else return wnaf.unsafe(p, sc);
			}
			multiplyAndAddUnsafe(Q, a, b) {
				const sum = this.multiplyUnsafe(a).add(Q.multiplyUnsafe(b));
				return sum.is0() ? void 0 : sum;
			}
			/**
			* Converts Projective point to affine (x, y) coordinates.
			* @param invertedZ Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
			*/
			toAffine(invertedZ) {
				return toAffineMemo(this, invertedZ);
			}
			/**
			* Checks whether Point is free of torsion elements (is in prime subgroup).
			* Always torsion-free for cofactor=1 curves.
			*/
			isTorsionFree() {
				const { isTorsionFree } = extraOpts;
				if (cofactor === _1n) return true;
				if (isTorsionFree) return isTorsionFree(Point, this);
				return wnaf.unsafe(this, CURVE_ORDER).is0();
			}
			clearCofactor() {
				const { clearCofactor } = extraOpts;
				if (cofactor === _1n) return this;
				if (clearCofactor) return clearCofactor(Point, this);
				return this.multiplyUnsafe(cofactor);
			}
			isSmallOrder() {
				return this.multiplyUnsafe(cofactor).is0();
			}
			toBytes(isCompressed = true) {
				(0, utils_ts_1._abool2)(isCompressed, "isCompressed");
				this.assertValidity();
				return encodePoint(Point, this, isCompressed);
			}
			toHex(isCompressed = true) {
				return (0, utils_ts_1.bytesToHex)(this.toBytes(isCompressed));
			}
			toString() {
				return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
			}
			get px() {
				return this.X;
			}
			get py() {
				return this.X;
			}
			get pz() {
				return this.Z;
			}
			toRawBytes(isCompressed = true) {
				return this.toBytes(isCompressed);
			}
			_setWindowSize(windowSize) {
				this.precompute(windowSize);
			}
			static normalizeZ(points) {
				return (0, curve_ts_1.normalizeZ)(Point, points);
			}
			static msm(points, scalars) {
				return (0, curve_ts_1.pippenger)(Point, Fn, points, scalars);
			}
			static fromPrivateKey(privateKey) {
				return Point.BASE.multiply(_normFnElement(Fn, privateKey));
			}
		}
		Point.BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE);
		Point.ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO);
		Point.Fp = Fp;
		Point.Fn = Fn;
		const bits = Fn.BITS;
		const wnaf = new curve_ts_1.wNAF(Point, extraOpts.endo ? Math.ceil(bits / 2) : bits);
		Point.BASE.precompute(8);
		return Point;
	}
	function pprefix(hasEvenY) {
		return Uint8Array.of(hasEvenY ? 2 : 3);
	}
	/**
	* Implementation of the Shallue and van de Woestijne method for any weierstrass curve.
	* TODO: check if there is a way to merge this with uvRatio in Edwards; move to modular.
	* b = True and y = sqrt(u / v) if (u / v) is square in F, and
	* b = False and y = sqrt(Z * (u / v)) otherwise.
	* @param Fp
	* @param Z
	* @returns
	*/
	function SWUFpSqrtRatio(Fp, Z) {
		const q = Fp.ORDER;
		let l = _0n;
		for (let o = q - _1n; o % _2n === _0n; o /= _2n) l += _1n;
		const c1 = l;
		const _2n_pow_c1_1 = _2n << c1 - _1n - _1n;
		const _2n_pow_c1 = _2n_pow_c1_1 * _2n;
		const c2 = (q - _1n) / _2n_pow_c1;
		const c3 = (c2 - _1n) / _2n;
		const c4 = _2n_pow_c1 - _1n;
		const c5 = _2n_pow_c1_1;
		const c6 = Fp.pow(Z, c2);
		const c7 = Fp.pow(Z, (c2 + _1n) / _2n);
		let sqrtRatio = (u, v) => {
			let tv1 = c6;
			let tv2 = Fp.pow(v, c4);
			let tv3 = Fp.sqr(tv2);
			tv3 = Fp.mul(tv3, v);
			let tv5 = Fp.mul(u, tv3);
			tv5 = Fp.pow(tv5, c3);
			tv5 = Fp.mul(tv5, tv2);
			tv2 = Fp.mul(tv5, v);
			tv3 = Fp.mul(tv5, u);
			let tv4 = Fp.mul(tv3, tv2);
			tv5 = Fp.pow(tv4, c5);
			let isQR = Fp.eql(tv5, Fp.ONE);
			tv2 = Fp.mul(tv3, c7);
			tv5 = Fp.mul(tv4, tv1);
			tv3 = Fp.cmov(tv2, tv3, isQR);
			tv4 = Fp.cmov(tv5, tv4, isQR);
			for (let i = c1; i > _1n; i--) {
				let tv5 = i - _2n;
				tv5 = _2n << tv5 - _1n;
				let tvv5 = Fp.pow(tv4, tv5);
				const e1 = Fp.eql(tvv5, Fp.ONE);
				tv2 = Fp.mul(tv3, tv1);
				tv1 = Fp.mul(tv1, tv1);
				tvv5 = Fp.mul(tv4, tv1);
				tv3 = Fp.cmov(tv2, tv3, e1);
				tv4 = Fp.cmov(tvv5, tv4, e1);
			}
			return {
				isValid: isQR,
				value: tv3
			};
		};
		if (Fp.ORDER % _4n === _3n) {
			const c1 = (Fp.ORDER - _3n) / _4n;
			const c2 = Fp.sqrt(Fp.neg(Z));
			sqrtRatio = (u, v) => {
				let tv1 = Fp.sqr(v);
				const tv2 = Fp.mul(u, v);
				tv1 = Fp.mul(tv1, tv2);
				let y1 = Fp.pow(tv1, c1);
				y1 = Fp.mul(y1, tv2);
				const y2 = Fp.mul(y1, c2);
				const tv3 = Fp.mul(Fp.sqr(y1), v);
				const isQR = Fp.eql(tv3, u);
				return {
					isValid: isQR,
					value: Fp.cmov(y2, y1, isQR)
				};
			};
		}
		return sqrtRatio;
	}
	/**
	* Simplified Shallue-van de Woestijne-Ulas Method
	* https://www.rfc-editor.org/rfc/rfc9380#section-6.6.2
	*/
	function mapToCurveSimpleSWU(Fp, opts) {
		(0, modular_ts_1.validateField)(Fp);
		const { A, B, Z } = opts;
		if (!Fp.isValid(A) || !Fp.isValid(B) || !Fp.isValid(Z)) throw new Error("mapToCurveSimpleSWU: invalid opts");
		const sqrtRatio = SWUFpSqrtRatio(Fp, Z);
		if (!Fp.isOdd) throw new Error("Field does not have .isOdd()");
		return (u) => {
			let tv1, tv2, tv3, tv4, tv5, tv6, x, y;
			tv1 = Fp.sqr(u);
			tv1 = Fp.mul(tv1, Z);
			tv2 = Fp.sqr(tv1);
			tv2 = Fp.add(tv2, tv1);
			tv3 = Fp.add(tv2, Fp.ONE);
			tv3 = Fp.mul(tv3, B);
			tv4 = Fp.cmov(Z, Fp.neg(tv2), !Fp.eql(tv2, Fp.ZERO));
			tv4 = Fp.mul(tv4, A);
			tv2 = Fp.sqr(tv3);
			tv6 = Fp.sqr(tv4);
			tv5 = Fp.mul(tv6, A);
			tv2 = Fp.add(tv2, tv5);
			tv2 = Fp.mul(tv2, tv3);
			tv6 = Fp.mul(tv6, tv4);
			tv5 = Fp.mul(tv6, B);
			tv2 = Fp.add(tv2, tv5);
			x = Fp.mul(tv1, tv3);
			const { isValid, value } = sqrtRatio(tv2, tv6);
			y = Fp.mul(tv1, u);
			y = Fp.mul(y, value);
			x = Fp.cmov(x, tv3, isValid);
			y = Fp.cmov(y, value, isValid);
			const e1 = Fp.isOdd(u) === Fp.isOdd(y);
			y = Fp.cmov(Fp.neg(y), y, e1);
			const tv4_inv = (0, modular_ts_1.FpInvertBatch)(Fp, [tv4], true)[0];
			x = Fp.mul(x, tv4_inv);
			return {
				x,
				y
			};
		};
	}
	function getWLengths(Fp, Fn) {
		return {
			secretKey: Fn.BYTES,
			publicKey: 1 + Fp.BYTES,
			publicKeyUncompressed: 1 + 2 * Fp.BYTES,
			publicKeyHasPrefix: true,
			signature: 2 * Fn.BYTES
		};
	}
	/**
	* Sometimes users only need getPublicKey, getSharedSecret, and secret key handling.
	* This helper ensures no signature functionality is present. Less code, smaller bundle size.
	*/
	function ecdh(Point, ecdhOpts = {}) {
		const { Fn } = Point;
		const randomBytes_ = ecdhOpts.randomBytes || utils_ts_1.randomBytes;
		const lengths = Object.assign(getWLengths(Point.Fp, Fn), { seed: (0, modular_ts_1.getMinHashLength)(Fn.ORDER) });
		function isValidSecretKey(secretKey) {
			try {
				return !!_normFnElement(Fn, secretKey);
			} catch (error) {
				return false;
			}
		}
		function isValidPublicKey(publicKey, isCompressed) {
			const { publicKey: comp, publicKeyUncompressed } = lengths;
			try {
				const l = publicKey.length;
				if (isCompressed === true && l !== comp) return false;
				if (isCompressed === false && l !== publicKeyUncompressed) return false;
				return !!Point.fromBytes(publicKey);
			} catch (error) {
				return false;
			}
		}
		/**
		* Produces cryptographically secure secret key from random of size
		* (groupLen + ceil(groupLen / 2)) with modulo bias being negligible.
		*/
		function randomSecretKey(seed = randomBytes_(lengths.seed)) {
			return (0, modular_ts_1.mapHashToField)((0, utils_ts_1._abytes2)(seed, lengths.seed, "seed"), Fn.ORDER);
		}
		/**
		* Computes public key for a secret key. Checks for validity of the secret key.
		* @param isCompressed whether to return compact (default), or full key
		* @returns Public key, full when isCompressed=false; short when isCompressed=true
		*/
		function getPublicKey(secretKey, isCompressed = true) {
			return Point.BASE.multiply(_normFnElement(Fn, secretKey)).toBytes(isCompressed);
		}
		function keygen(seed) {
			const secretKey = randomSecretKey(seed);
			return {
				secretKey,
				publicKey: getPublicKey(secretKey)
			};
		}
		/**
		* Quick and dirty check for item being public key. Does not validate hex, or being on-curve.
		*/
		function isProbPub(item) {
			if (typeof item === "bigint") return false;
			if (item instanceof Point) return true;
			const { secretKey, publicKey, publicKeyUncompressed } = lengths;
			if (Fn.allowedLengths || secretKey === publicKey) return void 0;
			const l = (0, utils_ts_1.ensureBytes)("key", item).length;
			return l === publicKey || l === publicKeyUncompressed;
		}
		/**
		* ECDH (Elliptic Curve Diffie Hellman).
		* Computes shared public key from secret key A and public key B.
		* Checks: 1) secret key validity 2) shared key is on-curve.
		* Does NOT hash the result.
		* @param isCompressed whether to return compact (default), or full key
		* @returns shared public key
		*/
		function getSharedSecret(secretKeyA, publicKeyB, isCompressed = true) {
			if (isProbPub(secretKeyA) === true) throw new Error("first arg must be private key");
			if (isProbPub(publicKeyB) === false) throw new Error("second arg must be public key");
			const s = _normFnElement(Fn, secretKeyA);
			return Point.fromHex(publicKeyB).multiply(s).toBytes(isCompressed);
		}
		return Object.freeze({
			getPublicKey,
			getSharedSecret,
			keygen,
			Point,
			utils: {
				isValidSecretKey,
				isValidPublicKey,
				randomSecretKey,
				isValidPrivateKey: isValidSecretKey,
				randomPrivateKey: randomSecretKey,
				normPrivateKeyToScalar: (key) => _normFnElement(Fn, key),
				precompute(windowSize = 8, point = Point.BASE) {
					return point.precompute(windowSize, false);
				}
			},
			lengths
		});
	}
	/**
	* Creates ECDSA signing interface for given elliptic curve `Point` and `hash` function.
	* We need `hash` for 2 features:
	* 1. Message prehash-ing. NOT used if `sign` / `verify` are called with `prehash: false`
	* 2. k generation in `sign`, using HMAC-drbg(hash)
	*
	* ECDSAOpts are only rarely needed.
	*
	* @example
	* ```js
	* const p256_Point = weierstrass(...);
	* const p256_sha256 = ecdsa(p256_Point, sha256);
	* const p256_sha224 = ecdsa(p256_Point, sha224);
	* const p256_sha224_r = ecdsa(p256_Point, sha224, { randomBytes: (length) => { ... } });
	* ```
	*/
	function ecdsa(Point, hash, ecdsaOpts = {}) {
		(0, utils_1.ahash)(hash);
		(0, utils_ts_1._validateObject)(ecdsaOpts, {}, {
			hmac: "function",
			lowS: "boolean",
			randomBytes: "function",
			bits2int: "function",
			bits2int_modN: "function"
		});
		const randomBytes = ecdsaOpts.randomBytes || utils_ts_1.randomBytes;
		const hmac = ecdsaOpts.hmac || ((key, ...msgs) => (0, hmac_js_1.hmac)(hash, key, (0, utils_ts_1.concatBytes)(...msgs)));
		const { Fp, Fn } = Point;
		const { ORDER: CURVE_ORDER, BITS: fnBits } = Fn;
		const { keygen, getPublicKey, getSharedSecret, utils, lengths } = ecdh(Point, ecdsaOpts);
		const defaultSigOpts = {
			prehash: false,
			lowS: typeof ecdsaOpts.lowS === "boolean" ? ecdsaOpts.lowS : false,
			format: void 0,
			extraEntropy: false
		};
		const defaultSigOpts_format = "compact";
		function isBiggerThanHalfOrder(number) {
			return number > CURVE_ORDER >> _1n;
		}
		function validateRS(title, num) {
			if (!Fn.isValidNot0(num)) throw new Error(`invalid signature ${title}: out of range 1..Point.Fn.ORDER`);
			return num;
		}
		function validateSigLength(bytes, format) {
			validateSigFormat(format);
			const size = lengths.signature;
			const sizer = format === "compact" ? size : format === "recovered" ? size + 1 : void 0;
			return (0, utils_ts_1._abytes2)(bytes, sizer, `${format} signature`);
		}
		/**
		* ECDSA signature with its (r, s) properties. Supports compact, recovered & DER representations.
		*/
		class Signature {
			constructor(r, s, recovery) {
				this.r = validateRS("r", r);
				this.s = validateRS("s", s);
				if (recovery != null) this.recovery = recovery;
				Object.freeze(this);
			}
			static fromBytes(bytes, format = defaultSigOpts_format) {
				validateSigLength(bytes, format);
				let recid;
				if (format === "der") {
					const { r, s } = exports.DER.toSig((0, utils_ts_1._abytes2)(bytes));
					return new Signature(r, s);
				}
				if (format === "recovered") {
					recid = bytes[0];
					format = "compact";
					bytes = bytes.subarray(1);
				}
				const L = Fn.BYTES;
				const r = bytes.subarray(0, L);
				const s = bytes.subarray(L, L * 2);
				return new Signature(Fn.fromBytes(r), Fn.fromBytes(s), recid);
			}
			static fromHex(hex, format) {
				return this.fromBytes((0, utils_ts_1.hexToBytes)(hex), format);
			}
			addRecoveryBit(recovery) {
				return new Signature(this.r, this.s, recovery);
			}
			recoverPublicKey(messageHash) {
				const FIELD_ORDER = Fp.ORDER;
				const { r, s, recovery: rec } = this;
				if (rec == null || ![
					0,
					1,
					2,
					3
				].includes(rec)) throw new Error("recovery id invalid");
				if (CURVE_ORDER * _2n < FIELD_ORDER && rec > 1) throw new Error("recovery id is ambiguous for h>1 curve");
				const radj = rec === 2 || rec === 3 ? r + CURVE_ORDER : r;
				if (!Fp.isValid(radj)) throw new Error("recovery id 2 or 3 invalid");
				const x = Fp.toBytes(radj);
				const R = Point.fromBytes((0, utils_ts_1.concatBytes)(pprefix((rec & 1) === 0), x));
				const ir = Fn.inv(radj);
				const h = bits2int_modN((0, utils_ts_1.ensureBytes)("msgHash", messageHash));
				const u1 = Fn.create(-h * ir);
				const u2 = Fn.create(s * ir);
				const Q = Point.BASE.multiplyUnsafe(u1).add(R.multiplyUnsafe(u2));
				if (Q.is0()) throw new Error("point at infinify");
				Q.assertValidity();
				return Q;
			}
			hasHighS() {
				return isBiggerThanHalfOrder(this.s);
			}
			toBytes(format = defaultSigOpts_format) {
				validateSigFormat(format);
				if (format === "der") return (0, utils_ts_1.hexToBytes)(exports.DER.hexFromSig(this));
				const r = Fn.toBytes(this.r);
				const s = Fn.toBytes(this.s);
				if (format === "recovered") {
					if (this.recovery == null) throw new Error("recovery bit must be present");
					return (0, utils_ts_1.concatBytes)(Uint8Array.of(this.recovery), r, s);
				}
				return (0, utils_ts_1.concatBytes)(r, s);
			}
			toHex(format) {
				return (0, utils_ts_1.bytesToHex)(this.toBytes(format));
			}
			assertValidity() {}
			static fromCompact(hex) {
				return Signature.fromBytes((0, utils_ts_1.ensureBytes)("sig", hex), "compact");
			}
			static fromDER(hex) {
				return Signature.fromBytes((0, utils_ts_1.ensureBytes)("sig", hex), "der");
			}
			normalizeS() {
				return this.hasHighS() ? new Signature(this.r, Fn.neg(this.s), this.recovery) : this;
			}
			toDERRawBytes() {
				return this.toBytes("der");
			}
			toDERHex() {
				return (0, utils_ts_1.bytesToHex)(this.toBytes("der"));
			}
			toCompactRawBytes() {
				return this.toBytes("compact");
			}
			toCompactHex() {
				return (0, utils_ts_1.bytesToHex)(this.toBytes("compact"));
			}
		}
		const bits2int = ecdsaOpts.bits2int || function bits2int_def(bytes) {
			if (bytes.length > 8192) throw new Error("input is too large");
			const num = (0, utils_ts_1.bytesToNumberBE)(bytes);
			const delta = bytes.length * 8 - fnBits;
			return delta > 0 ? num >> BigInt(delta) : num;
		};
		const bits2int_modN = ecdsaOpts.bits2int_modN || function bits2int_modN_def(bytes) {
			return Fn.create(bits2int(bytes));
		};
		const ORDER_MASK = (0, utils_ts_1.bitMask)(fnBits);
		/** Converts to bytes. Checks if num in `[0..ORDER_MASK-1]` e.g.: `[0..2^256-1]`. */
		function int2octets(num) {
			(0, utils_ts_1.aInRange)("num < 2^" + fnBits, num, _0n, ORDER_MASK);
			return Fn.toBytes(num);
		}
		function validateMsgAndHash(message, prehash) {
			(0, utils_ts_1._abytes2)(message, void 0, "message");
			return prehash ? (0, utils_ts_1._abytes2)(hash(message), void 0, "prehashed message") : message;
		}
		/**
		* Steps A, D of RFC6979 3.2.
		* Creates RFC6979 seed; converts msg/privKey to numbers.
		* Used only in sign, not in verify.
		*
		* Warning: we cannot assume here that message has same amount of bytes as curve order,
		* this will be invalid at least for P521. Also it can be bigger for P224 + SHA256.
		*/
		function prepSig(message, privateKey, opts) {
			if (["recovered", "canonical"].some((k) => k in opts)) throw new Error("sign() legacy options not supported");
			const { lowS, prehash, extraEntropy } = validateSigOpts(opts, defaultSigOpts);
			message = validateMsgAndHash(message, prehash);
			const h1int = bits2int_modN(message);
			const d = _normFnElement(Fn, privateKey);
			const seedArgs = [int2octets(d), int2octets(h1int)];
			if (extraEntropy != null && extraEntropy !== false) {
				const e = extraEntropy === true ? randomBytes(lengths.secretKey) : extraEntropy;
				seedArgs.push((0, utils_ts_1.ensureBytes)("extraEntropy", e));
			}
			const seed = (0, utils_ts_1.concatBytes)(...seedArgs);
			const m = h1int;
			function k2sig(kBytes) {
				const k = bits2int(kBytes);
				if (!Fn.isValidNot0(k)) return;
				const ik = Fn.inv(k);
				const q = Point.BASE.multiply(k).toAffine();
				const r = Fn.create(q.x);
				if (r === _0n) return;
				const s = Fn.create(ik * Fn.create(m + r * d));
				if (s === _0n) return;
				let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n);
				let normS = s;
				if (lowS && isBiggerThanHalfOrder(s)) {
					normS = Fn.neg(s);
					recovery ^= 1;
				}
				return new Signature(r, normS, recovery);
			}
			return {
				seed,
				k2sig
			};
		}
		/**
		* Signs message hash with a secret key.
		*
		* ```
		* sign(m, d) where
		*   k = rfc6979_hmac_drbg(m, d)
		*   (x, y) = G × k
		*   r = x mod n
		*   s = (m + dr) / k mod n
		* ```
		*/
		function sign(message, secretKey, opts = {}) {
			message = (0, utils_ts_1.ensureBytes)("message", message);
			const { seed, k2sig } = prepSig(message, secretKey, opts);
			return (0, utils_ts_1.createHmacDrbg)(hash.outputLen, Fn.BYTES, hmac)(seed, k2sig);
		}
		function tryParsingSig(sg) {
			let sig = void 0;
			const isHex = typeof sg === "string" || (0, utils_ts_1.isBytes)(sg);
			const isObj = !isHex && sg !== null && typeof sg === "object" && typeof sg.r === "bigint" && typeof sg.s === "bigint";
			if (!isHex && !isObj) throw new Error("invalid signature, expected Uint8Array, hex string or Signature instance");
			if (isObj) sig = new Signature(sg.r, sg.s);
			else if (isHex) {
				try {
					sig = Signature.fromBytes((0, utils_ts_1.ensureBytes)("sig", sg), "der");
				} catch (derError) {
					if (!(derError instanceof exports.DER.Err)) throw derError;
				}
				if (!sig) try {
					sig = Signature.fromBytes((0, utils_ts_1.ensureBytes)("sig", sg), "compact");
				} catch (error) {
					return false;
				}
			}
			if (!sig) return false;
			return sig;
		}
		/**
		* Verifies a signature against message and public key.
		* Rejects lowS signatures by default: see {@link ECDSAVerifyOpts}.
		* Implements section 4.1.4 from https://www.secg.org/sec1-v2.pdf:
		*
		* ```
		* verify(r, s, h, P) where
		*   u1 = hs^-1 mod n
		*   u2 = rs^-1 mod n
		*   R = u1⋅G + u2⋅P
		*   mod(R.x, n) == r
		* ```
		*/
		function verify(signature, message, publicKey, opts = {}) {
			const { lowS, prehash, format } = validateSigOpts(opts, defaultSigOpts);
			publicKey = (0, utils_ts_1.ensureBytes)("publicKey", publicKey);
			message = validateMsgAndHash((0, utils_ts_1.ensureBytes)("message", message), prehash);
			if ("strict" in opts) throw new Error("options.strict was renamed to lowS");
			const sig = format === void 0 ? tryParsingSig(signature) : Signature.fromBytes((0, utils_ts_1.ensureBytes)("sig", signature), format);
			if (sig === false) return false;
			try {
				const P = Point.fromBytes(publicKey);
				if (lowS && sig.hasHighS()) return false;
				const { r, s } = sig;
				const h = bits2int_modN(message);
				const is = Fn.inv(s);
				const u1 = Fn.create(h * is);
				const u2 = Fn.create(r * is);
				const R = Point.BASE.multiplyUnsafe(u1).add(P.multiplyUnsafe(u2));
				if (R.is0()) return false;
				return Fn.create(R.x) === r;
			} catch (e) {
				return false;
			}
		}
		function recoverPublicKey(signature, message, opts = {}) {
			const { prehash } = validateSigOpts(opts, defaultSigOpts);
			message = validateMsgAndHash(message, prehash);
			return Signature.fromBytes(signature, "recovered").recoverPublicKey(message).toBytes();
		}
		return Object.freeze({
			keygen,
			getPublicKey,
			getSharedSecret,
			utils,
			lengths,
			Point,
			sign,
			verify,
			recoverPublicKey,
			Signature,
			hash
		});
	}
	/** @deprecated use `weierstrass` in newer releases */
	function weierstrassPoints(c) {
		const { CURVE, curveOpts } = _weierstrass_legacy_opts_to_new(c);
		return _weierstrass_new_output_to_legacy(c, weierstrassN(CURVE, curveOpts));
	}
	function _weierstrass_legacy_opts_to_new(c) {
		const CURVE = {
			a: c.a,
			b: c.b,
			p: c.Fp.ORDER,
			n: c.n,
			h: c.h,
			Gx: c.Gx,
			Gy: c.Gy
		};
		const Fp = c.Fp;
		let allowedLengths = c.allowedPrivateKeyLengths ? Array.from(new Set(c.allowedPrivateKeyLengths.map((l) => Math.ceil(l / 2)))) : void 0;
		return {
			CURVE,
			curveOpts: {
				Fp,
				Fn: (0, modular_ts_1.Field)(CURVE.n, {
					BITS: c.nBitLength,
					allowedLengths,
					modFromBytes: c.wrapPrivateKey
				}),
				allowInfinityPoint: c.allowInfinityPoint,
				endo: c.endo,
				isTorsionFree: c.isTorsionFree,
				clearCofactor: c.clearCofactor,
				fromBytes: c.fromBytes,
				toBytes: c.toBytes
			}
		};
	}
	function _ecdsa_legacy_opts_to_new(c) {
		const { CURVE, curveOpts } = _weierstrass_legacy_opts_to_new(c);
		const ecdsaOpts = {
			hmac: c.hmac,
			randomBytes: c.randomBytes,
			lowS: c.lowS,
			bits2int: c.bits2int,
			bits2int_modN: c.bits2int_modN
		};
		return {
			CURVE,
			curveOpts,
			hash: c.hash,
			ecdsaOpts
		};
	}
	function _legacyHelperEquat(Fp, a, b) {
		/**
		* y² = x³ + ax + b: Short weierstrass curve formula. Takes x, returns y².
		* @returns y²
		*/
		function weierstrassEquation(x) {
			const x2 = Fp.sqr(x);
			const x3 = Fp.mul(x2, x);
			return Fp.add(Fp.add(x3, Fp.mul(x, a)), b);
		}
		return weierstrassEquation;
	}
	function _weierstrass_new_output_to_legacy(c, Point) {
		const { Fp, Fn } = Point;
		function isWithinCurveOrder(num) {
			return (0, utils_ts_1.inRange)(num, _1n, Fn.ORDER);
		}
		const weierstrassEquation = _legacyHelperEquat(Fp, c.a, c.b);
		return Object.assign({}, {
			CURVE: c,
			Point,
			ProjectivePoint: Point,
			normPrivateKeyToScalar: (key) => _normFnElement(Fn, key),
			weierstrassEquation,
			isWithinCurveOrder
		});
	}
	function _ecdsa_new_output_to_legacy(c, _ecdsa) {
		const Point = _ecdsa.Point;
		return Object.assign({}, _ecdsa, {
			ProjectivePoint: Point,
			CURVE: Object.assign({}, c, (0, modular_ts_1.nLength)(Point.Fn.ORDER, Point.Fn.BITS))
		});
	}
	function weierstrass(c) {
		const { CURVE, curveOpts, hash, ecdsaOpts } = _ecdsa_legacy_opts_to_new(c);
		return _ecdsa_new_output_to_legacy(c, ecdsa(weierstrassN(CURVE, curveOpts), hash, ecdsaOpts));
	}
}));
//#endregion
//#region node_modules/@noble/curves/_shortw_utils.js
var require__shortw_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getHash = getHash;
	exports.createCurve = createCurve;
	/**
	* Utilities for short weierstrass curves, combined with noble-hashes.
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var weierstrass_ts_1 = require_weierstrass();
	/** connects noble-curves to noble-hashes */
	function getHash(hash) {
		return { hash };
	}
	/** @deprecated use new `weierstrass()` and `ecdsa()` methods */
	function createCurve(curveDef, defHash) {
		const create = (hash) => (0, weierstrass_ts_1.weierstrass)({
			...curveDef,
			hash
		});
		return {
			...create(defHash),
			create
		};
	}
}));
//#endregion
//#region node_modules/@noble/curves/secp256k1.js
var require_secp256k1$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.encodeToCurve = exports.hashToCurve = exports.secp256k1_hasher = exports.schnorr = exports.secp256k1 = void 0;
	/**
	* SECG secp256k1. See [pdf](https://www.secg.org/sec2-v2.pdf).
	*
	* Belongs to Koblitz curves: it has efficiently-computable GLV endomorphism ψ,
	* check out {@link EndomorphismOpts}. Seems to be rigid (not backdoored).
	* @module
	*/
	/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
	var sha2_js_1 = require_sha2();
	var utils_js_1 = require_utils$3();
	var _shortw_utils_ts_1 = require__shortw_utils();
	var hash_to_curve_ts_1 = require_hash_to_curve();
	var modular_ts_1 = require_modular();
	var weierstrass_ts_1 = require_weierstrass();
	var utils_ts_1 = require_utils$2();
	var secp256k1_CURVE = {
		p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
		n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
		h: BigInt(1),
		a: BigInt(0),
		b: BigInt(7),
		Gx: BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
		Gy: BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
	};
	var secp256k1_ENDO = {
		beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
		basises: [[BigInt("0x3086d221a7d46bcde86c90e49284eb15"), -BigInt("0xe4437ed6010e88286f547fa90abfe4c3")], [BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"), BigInt("0x3086d221a7d46bcde86c90e49284eb15")]]
	};
	var _0n = /* @__PURE__ */ BigInt(0);
	var _1n = /* @__PURE__ */ BigInt(1);
	var _2n = /* @__PURE__ */ BigInt(2);
	/**
	* √n = n^((p+1)/4) for fields p = 3 mod 4. We unwrap the loop and multiply bit-by-bit.
	* (P+1n/4n).toString(2) would produce bits [223x 1, 0, 22x 1, 4x 0, 11, 00]
	*/
	function sqrtMod(y) {
		const P = secp256k1_CURVE.p;
		const _3n = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
		const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
		const b2 = y * y * y % P;
		const b3 = b2 * b2 * y % P;
		const b6 = (0, modular_ts_1.pow2)(b3, _3n, P) * b3 % P;
		const b9 = (0, modular_ts_1.pow2)(b6, _3n, P) * b3 % P;
		const b11 = (0, modular_ts_1.pow2)(b9, _2n, P) * b2 % P;
		const b22 = (0, modular_ts_1.pow2)(b11, _11n, P) * b11 % P;
		const b44 = (0, modular_ts_1.pow2)(b22, _22n, P) * b22 % P;
		const b88 = (0, modular_ts_1.pow2)(b44, _44n, P) * b44 % P;
		const b176 = (0, modular_ts_1.pow2)(b88, _88n, P) * b88 % P;
		const b220 = (0, modular_ts_1.pow2)(b176, _44n, P) * b44 % P;
		const b223 = (0, modular_ts_1.pow2)(b220, _3n, P) * b3 % P;
		const t1 = (0, modular_ts_1.pow2)(b223, _23n, P) * b22 % P;
		const t2 = (0, modular_ts_1.pow2)(t1, _6n, P) * b2 % P;
		const root = (0, modular_ts_1.pow2)(t2, _2n, P);
		if (!Fpk1.eql(Fpk1.sqr(root), y)) throw new Error("Cannot find square root");
		return root;
	}
	var Fpk1 = (0, modular_ts_1.Field)(secp256k1_CURVE.p, { sqrt: sqrtMod });
	/**
	* secp256k1 curve, ECDSA and ECDH methods.
	*
	* Field: `2n**256n - 2n**32n - 2n**9n - 2n**8n - 2n**7n - 2n**6n - 2n**4n - 1n`
	*
	* @example
	* ```js
	* import { secp256k1 } from '@noble/curves/secp256k1';
	* const { secretKey, publicKey } = secp256k1.keygen();
	* const msg = new TextEncoder().encode('hello');
	* const sig = secp256k1.sign(msg, secretKey);
	* const isValid = secp256k1.verify(sig, msg, publicKey) === true;
	* ```
	*/
	exports.secp256k1 = (0, _shortw_utils_ts_1.createCurve)({
		...secp256k1_CURVE,
		Fp: Fpk1,
		lowS: true,
		endo: secp256k1_ENDO
	}, sha2_js_1.sha256);
	/** An object mapping tags to their tagged hash prefix of [SHA256(tag) | SHA256(tag)] */
	var TAGGED_HASH_PREFIXES = {};
	function taggedHash(tag, ...messages) {
		let tagP = TAGGED_HASH_PREFIXES[tag];
		if (tagP === void 0) {
			const tagH = (0, sha2_js_1.sha256)((0, utils_ts_1.utf8ToBytes)(tag));
			tagP = (0, utils_ts_1.concatBytes)(tagH, tagH);
			TAGGED_HASH_PREFIXES[tag] = tagP;
		}
		return (0, sha2_js_1.sha256)((0, utils_ts_1.concatBytes)(tagP, ...messages));
	}
	var pointToBytes = (point) => point.toBytes(true).slice(1);
	var Pointk1 = exports.secp256k1.Point;
	var hasEven = (y) => y % _2n === _0n;
	function schnorrGetExtPubKey(priv) {
		const { Fn, BASE } = Pointk1;
		const d_ = (0, weierstrass_ts_1._normFnElement)(Fn, priv);
		const p = BASE.multiply(d_);
		return {
			scalar: hasEven(p.y) ? d_ : Fn.neg(d_),
			bytes: pointToBytes(p)
		};
	}
	/**
	* lift_x from BIP340. Convert 32-byte x coordinate to elliptic curve point.
	* @returns valid point checked for being on-curve
	*/
	function lift_x(x) {
		const Fp = Fpk1;
		if (!Fp.isValidNot0(x)) throw new Error("invalid x: Fail if x ≥ p");
		const xx = Fp.create(x * x);
		const c = Fp.create(xx * x + BigInt(7));
		let y = Fp.sqrt(c);
		if (!hasEven(y)) y = Fp.neg(y);
		const p = Pointk1.fromAffine({
			x,
			y
		});
		p.assertValidity();
		return p;
	}
	var num = utils_ts_1.bytesToNumberBE;
	/**
	* Create tagged hash, convert it to bigint, reduce modulo-n.
	*/
	function challenge(...args) {
		return Pointk1.Fn.create(num(taggedHash("BIP0340/challenge", ...args)));
	}
	/**
	* Schnorr public key is just `x` coordinate of Point as per BIP340.
	*/
	function schnorrGetPublicKey(secretKey) {
		return schnorrGetExtPubKey(secretKey).bytes;
	}
	/**
	* Creates Schnorr signature as per BIP340. Verifies itself before returning anything.
	* auxRand is optional and is not the sole source of k generation: bad CSPRNG won't be dangerous.
	*/
	function schnorrSign(message, secretKey, auxRand = (0, utils_js_1.randomBytes)(32)) {
		const { Fn } = Pointk1;
		const m = (0, utils_ts_1.ensureBytes)("message", message);
		const { bytes: px, scalar: d } = schnorrGetExtPubKey(secretKey);
		const a = (0, utils_ts_1.ensureBytes)("auxRand", auxRand, 32);
		const { bytes: rx, scalar: k } = schnorrGetExtPubKey(taggedHash("BIP0340/nonce", Fn.toBytes(d ^ num(taggedHash("BIP0340/aux", a))), px, m));
		const e = challenge(rx, px, m);
		const sig = new Uint8Array(64);
		sig.set(rx, 0);
		sig.set(Fn.toBytes(Fn.create(k + e * d)), 32);
		if (!schnorrVerify(sig, m, px)) throw new Error("sign: Invalid signature produced");
		return sig;
	}
	/**
	* Verifies Schnorr signature.
	* Will swallow errors & return false except for initial type validation of arguments.
	*/
	function schnorrVerify(signature, message, publicKey) {
		const { Fn, BASE } = Pointk1;
		const sig = (0, utils_ts_1.ensureBytes)("signature", signature, 64);
		const m = (0, utils_ts_1.ensureBytes)("message", message);
		const pub = (0, utils_ts_1.ensureBytes)("publicKey", publicKey, 32);
		try {
			const P = lift_x(num(pub));
			const r = num(sig.subarray(0, 32));
			if (!(0, utils_ts_1.inRange)(r, _1n, secp256k1_CURVE.p)) return false;
			const s = num(sig.subarray(32, 64));
			if (!(0, utils_ts_1.inRange)(s, _1n, secp256k1_CURVE.n)) return false;
			const e = challenge(Fn.toBytes(r), pointToBytes(P), m);
			const R = BASE.multiplyUnsafe(s).add(P.multiplyUnsafe(Fn.neg(e)));
			const { x, y } = R.toAffine();
			if (R.is0() || !hasEven(y) || x !== r) return false;
			return true;
		} catch (error) {
			return false;
		}
	}
	/**
	* Schnorr signatures over secp256k1.
	* https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki
	* @example
	* ```js
	* import { schnorr } from '@noble/curves/secp256k1';
	* const { secretKey, publicKey } = schnorr.keygen();
	* // const publicKey = schnorr.getPublicKey(secretKey);
	* const msg = new TextEncoder().encode('hello');
	* const sig = schnorr.sign(msg, secretKey);
	* const isValid = schnorr.verify(sig, msg, publicKey);
	* ```
	*/
	exports.schnorr = (() => {
		const size = 32;
		const seedLength = 48;
		const randomSecretKey = (seed = (0, utils_js_1.randomBytes)(seedLength)) => {
			return (0, modular_ts_1.mapHashToField)(seed, secp256k1_CURVE.n);
		};
		exports.secp256k1.utils.randomSecretKey;
		function keygen(seed) {
			const secretKey = randomSecretKey(seed);
			return {
				secretKey,
				publicKey: schnorrGetPublicKey(secretKey)
			};
		}
		return {
			keygen,
			getPublicKey: schnorrGetPublicKey,
			sign: schnorrSign,
			verify: schnorrVerify,
			Point: Pointk1,
			utils: {
				randomSecretKey,
				randomPrivateKey: randomSecretKey,
				taggedHash,
				lift_x,
				pointToBytes,
				numberToBytesBE: utils_ts_1.numberToBytesBE,
				bytesToNumberBE: utils_ts_1.bytesToNumberBE,
				mod: modular_ts_1.mod
			},
			lengths: {
				secretKey: size,
				publicKey: size,
				publicKeyHasPrefix: false,
				signature: size * 2,
				seed: seedLength
			}
		};
	})();
	var isoMap = (0, hash_to_curve_ts_1.isogenyMap)(Fpk1, [
		[
			"0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa8c7",
			"0x7d3d4c80bc321d5b9f315cea7fd44c5d595d2fc0bf63b92dfff1044f17c6581",
			"0x534c328d23f234e6e2a413deca25caece4506144037c40314ecbd0b53d9dd262",
			"0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa88c"
		],
		[
			"0xd35771193d94918a9ca34ccbb7b640dd86cd409542f8487d9fe6b745781eb49b",
			"0xedadc6f64383dc1df7c4b2d51b54225406d36b641f5e41bbc52a56612a8c6d14",
			"0x0000000000000000000000000000000000000000000000000000000000000001"
		],
		[
			"0x4bda12f684bda12f684bda12f684bda12f684bda12f684bda12f684b8e38e23c",
			"0xc75e0c32d5cb7c0fa9d0a54b12a0a6d5647ab046d686da6fdffc90fc201d71a3",
			"0x29a6194691f91a73715209ef6512e576722830a201be2018a765e85a9ecee931",
			"0x2f684bda12f684bda12f684bda12f684bda12f684bda12f684bda12f38e38d84"
		],
		[
			"0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffff93b",
			"0x7a06534bb8bdb49fd5e9e6632722c2989467c1bfc8e8d978dfb425d2685c2573",
			"0x6484aa716545ca2cf3a70c3fa8fe337e0a3d21162f0d6299a7bf8192bfd2a76f",
			"0x0000000000000000000000000000000000000000000000000000000000000001"
		]
	].map((i) => i.map((j) => BigInt(j))));
	var mapSWU = (0, weierstrass_ts_1.mapToCurveSimpleSWU)(Fpk1, {
		A: BigInt("0x3f8731abdd661adca08a5558f0f5d272e953d363cb6f0e5d405447c01a444533"),
		B: BigInt("1771"),
		Z: Fpk1.create(BigInt("-11"))
	});
	/** Hashing / encoding to secp256k1 points / field. RFC 9380 methods. */
	exports.secp256k1_hasher = (0, hash_to_curve_ts_1.createHasher)(exports.secp256k1.Point, (scalars) => {
		const { x, y } = mapSWU(Fpk1.create(scalars[0]));
		return isoMap(x, y);
	}, {
		DST: "secp256k1_XMD:SHA-256_SSWU_RO_",
		encodeDST: "secp256k1_XMD:SHA-256_SSWU_NU_",
		p: Fpk1.ORDER,
		m: 1,
		k: 128,
		expand: "xmd",
		hash: sha2_js_1.sha256
	});
	/** @deprecated use `import { secp256k1_hasher } from '@noble/curves/secp256k1.js';` */
	exports.hashToCurve = exports.secp256k1_hasher.hashToCurve;
	/** @deprecated use `import { secp256k1_hasher } from '@noble/curves/secp256k1.js';` */
	exports.encodeToCurve = exports.secp256k1_hasher.encodeToCurve;
}));
//#endregion
//#region node_modules/@cosmjs/crypto/build/secp256k1signature.js
var require_secp256k1signature = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ExtendedSecp256k1Signature = exports.Secp256k1Signature = void 0;
	var encoding_1 = require_build$4();
	function trimLeadingNullBytes(inData) {
		let numberOfLeadingNullBytes = 0;
		for (const byte of inData) if (byte === 0) numberOfLeadingNullBytes++;
		else break;
		return inData.slice(numberOfLeadingNullBytes);
	}
	var derTagInteger = 2;
	var Secp256k1Signature = class Secp256k1Signature {
		/**
		* Takes the pair of integers (r, s) as 2x32 byte of binary data.
		*
		* Note: This is the format Cosmos SDK uses natively.
		*
		* @param data a 64 byte value containing integers r and s.
		*/
		static fromFixedLength(data) {
			if (data.length !== 64) throw new Error(`Got invalid data length: ${data.length}. Expected 2x 32 bytes for the pair (r, s)`);
			return new Secp256k1Signature(trimLeadingNullBytes(data.slice(0, 32)), trimLeadingNullBytes(data.slice(32, 64)));
		}
		static fromDer(data) {
			let pos = 0;
			if (data[pos++] !== 48) throw new Error("Prefix 0x30 expected");
			const bodyLength = data[pos++];
			if (data.length - pos !== bodyLength) throw new Error("Data length mismatch detected");
			if (data[pos++] !== derTagInteger) throw new Error("INTEGER tag expected");
			const rLength = data[pos++];
			if (rLength >= 128) throw new Error("Decoding length values above 127 not supported");
			const rData = data.slice(pos, pos + rLength);
			pos += rLength;
			if (data[pos++] !== derTagInteger) throw new Error("INTEGER tag expected");
			const sLength = data[pos++];
			if (sLength >= 128) throw new Error("Decoding length values above 127 not supported");
			const sData = data.slice(pos, pos + sLength);
			pos += sLength;
			return new Secp256k1Signature(trimLeadingNullBytes(rData), trimLeadingNullBytes(sData));
		}
		data;
		constructor(r, s) {
			if (r.length > 32 || r.length === 0 || r[0] === 0) throw new Error("Unsigned integer r must be encoded as unpadded big endian.");
			if (s.length > 32 || s.length === 0 || s[0] === 0) throw new Error("Unsigned integer s must be encoded as unpadded big endian.");
			this.data = {
				r: (0, encoding_1.fixUint8Array)(r),
				s: (0, encoding_1.fixUint8Array)(s)
			};
		}
		r(length) {
			if (length === void 0) return this.data.r;
			else {
				const paddingLength = length - this.data.r.length;
				if (paddingLength < 0) throw new Error("Length too small to hold parameter r");
				const padding = new Uint8Array(paddingLength);
				return new Uint8Array([...padding, ...this.data.r]);
			}
		}
		s(length) {
			if (length === void 0) return this.data.s;
			else {
				const paddingLength = length - this.data.s.length;
				if (paddingLength < 0) throw new Error("Length too small to hold parameter s");
				const padding = new Uint8Array(paddingLength);
				return new Uint8Array([...padding, ...this.data.s]);
			}
		}
		toFixedLength() {
			return new Uint8Array([...this.r(32), ...this.s(32)]);
		}
		toDer() {
			const rEncoded = this.data.r[0] >= 128 ? new Uint8Array([0, ...this.data.r]) : this.data.r;
			const sEncoded = this.data.s[0] >= 128 ? new Uint8Array([0, ...this.data.s]) : this.data.s;
			const rLength = rEncoded.length;
			const sLength = sEncoded.length;
			const data = new Uint8Array([
				derTagInteger,
				rLength,
				...rEncoded,
				derTagInteger,
				sLength,
				...sEncoded
			]);
			return new Uint8Array([
				48,
				data.length,
				...data
			]);
		}
	};
	exports.Secp256k1Signature = Secp256k1Signature;
	exports.ExtendedSecp256k1Signature = class ExtendedSecp256k1Signature extends Secp256k1Signature {
		/**
		* Decode extended signature from the simple fixed length encoding
		* described in toFixedLength().
		*/
		static fromFixedLength(data) {
			if (data.length !== 65) throw new Error(`Got invalid data length ${data.length}. Expected 32 + 32 + 1`);
			return new ExtendedSecp256k1Signature(trimLeadingNullBytes(data.slice(0, 32)), trimLeadingNullBytes(data.slice(32, 64)), data[64]);
		}
		recovery;
		constructor(r, s, recovery) {
			super(r, s);
			if (!Number.isInteger(recovery)) throw new Error("The recovery parameter must be an integer.");
			if (recovery < 0 || recovery > 4) throw new Error("The recovery parameter must be one of 0, 1, 2, 3.");
			this.recovery = recovery;
		}
		/**
		* A simple custom encoding that encodes the extended signature as
		* r (32 bytes) | s (32 bytes) | recovery param (1 byte)
		* where | denotes concatenation of bonary data.
		*/
		toFixedLength() {
			return new Uint8Array([
				...this.r(32),
				...this.s(32),
				this.recovery
			]);
		}
	};
}));
//#endregion
//#region node_modules/@cosmjs/crypto/build/secp256k1.js
var require_secp256k1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Secp256k1 = void 0;
	var encoding_1 = require_build$4();
	var utils_1 = require_build$5();
	var secp256k1_1 = require_secp256k1$1();
	var secp256k1signature_1 = require_secp256k1signature();
	function unsignedBigIntToBytes(a) {
		(0, utils_1.assert)(a >= 0n);
		let hex = a.toString(16);
		if (hex.length % 2) hex = "0" + hex;
		return (0, encoding_1.fromHex)(hex);
	}
	function bytesToUnsignedBigInt(a) {
		return BigInt("0x" + (0, encoding_1.toHex)(a));
	}
	var Secp256k1 = class {
		/**
		* Takes a 32 byte private key and returns a privkey/pubkey pair.
		*
		* The resulting pubkey is uncompressed. For the use in Cosmos it should
		* be compressed first using `Secp256k1.compressPubkey`.
		*/
		static makeKeypair(privkey) {
			if (privkey.length !== 32) throw new Error("input data is not a valid secp256k1 private key");
			if (!secp256k1_1.secp256k1.utils.isValidPrivateKey(privkey)) throw new Error("input data is not a valid secp256k1 private key");
			return {
				privkey,
				pubkey: secp256k1_1.secp256k1.getPublicKey(privkey, false)
			};
		}
		/**
		* Creates a signature that is
		* - deterministic (RFC 6979)
		* - lowS signature
		* - DER encoded
		*/
		static createSignature(messageHash, privkey) {
			if (messageHash.length === 0) throw new Error("Message hash must not be empty");
			if (messageHash.length > 32) throw new Error("Message hash length must not exceed 32 bytes");
			const { recovery, r, s } = secp256k1_1.secp256k1.sign(messageHash, privkey, { lowS: true });
			if (typeof recovery !== "number") throw new Error("Recovery param missing");
			return new secp256k1signature_1.ExtendedSecp256k1Signature(unsignedBigIntToBytes(r), unsignedBigIntToBytes(s), recovery);
		}
		static verifySignature(signature, messageHash, pubkey) {
			if (messageHash.length === 0) throw new Error("Message hash must not be empty");
			if (messageHash.length > 32) throw new Error("Message hash length must not exceed 32 bytes");
			const encodedSig = secp256k1_1.secp256k1.Signature.fromDER(signature.toDer());
			return secp256k1_1.secp256k1.verify(encodedSig, messageHash, pubkey, { lowS: false });
		}
		static recoverPubkey(signature, messageHash) {
			const pk = new secp256k1_1.secp256k1.Signature(bytesToUnsignedBigInt(signature.r()), bytesToUnsignedBigInt(signature.s()), signature.recovery).recoverPublicKey(messageHash);
			return (0, encoding_1.fixUint8Array)(pk.toBytes(false));
		}
		/**
		* Takes a compressed or uncompressed pubkey and return a compressed one.
		*
		* This function is idempotent.
		*/
		static compressPubkey(pubkey) {
			switch (pubkey.length) {
				case 33: return (0, encoding_1.fixUint8Array)(pubkey);
				case 65: return (0, encoding_1.fixUint8Array)(secp256k1_1.secp256k1.Point.fromBytes(pubkey).toBytes(true));
				default: throw new Error("Invalid pubkey length");
			}
		}
		/**
		* Takes a compressed or uncompressed pubkey and returns an uncompressed one.
		*
		* This function is idempotent.
		*/
		static uncompressPubkey(pubkey) {
			switch (pubkey.length) {
				case 33: return (0, encoding_1.fixUint8Array)(secp256k1_1.secp256k1.Point.fromBytes(pubkey).toBytes(false));
				case 65: return (0, encoding_1.fixUint8Array)(pubkey);
				default: throw new Error("Invalid pubkey length");
			}
		}
		static trimRecoveryByte(signature) {
			switch (signature.length) {
				case 64: return (0, encoding_1.fixUint8Array)(signature);
				case 65: return signature.slice(0, 64);
				default: throw new Error("Invalid signature length");
			}
		}
	};
	exports.Secp256k1 = Secp256k1;
}));
//#endregion
//#region node_modules/@cosmjs/crypto/build/sha.js
var require_sha = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Sha512 = exports.Sha256 = void 0;
	exports.sha256 = sha256;
	exports.sha512 = sha512;
	var encoding_1 = require_build$4();
	var sha2_js_1 = require_sha2();
	var utils_1 = require_utils$1();
	var Sha256 = class {
		blockSize = 512 / 8;
		impl = sha2_js_1.sha256.create();
		constructor(firstData) {
			if (firstData) this.update(firstData);
		}
		update(data) {
			this.impl.update((0, utils_1.toRealUint8Array)(data));
			return this;
		}
		digest() {
			return (0, encoding_1.fixUint8Array)(this.impl.digest());
		}
	};
	exports.Sha256 = Sha256;
	/** Convenience function equivalent to `new Sha256(data).digest()` */
	function sha256(data) {
		return new Sha256(data).digest();
	}
	var Sha512 = class {
		blockSize = 1024 / 8;
		impl = sha2_js_1.sha512.create();
		constructor(firstData) {
			if (firstData) this.update(firstData);
		}
		update(data) {
			this.impl.update((0, utils_1.toRealUint8Array)(data));
			return this;
		}
		digest() {
			return (0, encoding_1.fixUint8Array)(this.impl.digest());
		}
	};
	exports.Sha512 = Sha512;
	/** Convenience function equivalent to `new Sha512(data).digest()` */
	function sha512(data) {
		return new Sha512(data).digest();
	}
}));
//#endregion
//#region node_modules/@cosmjs/math/build/decimal.js
var require_decimal = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Decimal = void 0;
	var maxFractionalDigits = 100;
	exports.Decimal = class Decimal {
		static fromUserInput(input, fractionalDigits) {
			Decimal.verifyFractionalDigits(fractionalDigits);
			if (input === "") return Decimal.zero(fractionalDigits);
			let testString;
			let characterOffset;
			if (input.startsWith("-")) {
				testString = input.substring(1);
				characterOffset = 2;
			} else {
				testString = input;
				characterOffset = 1;
			}
			const badCharacter = testString.match(/[^0-9.]/);
			if (badCharacter) throw new Error(`Invalid character at position ${badCharacter.index + characterOffset}`);
			let whole;
			let fractional;
			if (input.search(/\./) === -1) {
				whole = input;
				fractional = "";
			} else {
				const parts = input.split(".");
				switch (parts.length) {
					case 0:
					case 1: throw new Error("Fewer than two elements in split result. This must not happen here.");
					case 2:
						if (!parts[1]) throw new Error("Fractional part missing");
						whole = parts[0];
						fractional = parts[1].replace(/0+$/, "");
						break;
					default: throw new Error("More than one separator found");
				}
			}
			if (fractional.length > fractionalDigits) throw new Error("Got more fractional digits than supported");
			return new Decimal(BigInt(`${whole}${fractional.padEnd(fractionalDigits, "0")}`), fractionalDigits);
		}
		/**
		* Constructs a decimal given the atomic units and the fractional digits.
		*
		* Atomics units are the smallest unit you operate with.
		* E.g. for EUR this could be Euro cents and for BTC this would be Satishi.
		*
		* To create the decimal value 12.60 (EUR) you would use atomics=1260, fractionalDigits=2.
		* To create the decimal value 3.4 (BTC) you would use atomics=340000000, fractionalDigits=8.
		*
		* In order to perform arithmetic operations on Decimal, all values must have the same `fractionalDigits` value.
		* So this should be fixed once per currency, not different per value.
		*/
		static fromAtomics(atomics, fractionalDigits) {
			if (typeof atomics === "string") {
				if (!atomics.match(/^-?[0-9]+$/)) throw new Error("Invalid string format. Only integers in decimal representation supported.");
				return Decimal.fromAtomics(BigInt(atomics), fractionalDigits);
			}
			Decimal.verifyFractionalDigits(fractionalDigits);
			return new Decimal(atomics, fractionalDigits);
		}
		/**
		* Creates a Decimal with value 0.0 and the given number of fractional digits.
		*
		* Fractional digits are not relevant for the value but needed to be able
		* to perform arithmetic operations with other decimals.
		*/
		static zero(fractionalDigits) {
			Decimal.verifyFractionalDigits(fractionalDigits);
			return new Decimal(0n, fractionalDigits);
		}
		/**
		* Creates a Decimal with value 1.0 and the given number of fractional digits.
		*
		* Fractional digits are not relevant for the value but needed to be able
		* to perform arithmetic operations with other decimals.
		*/
		static one(fractionalDigits) {
			Decimal.verifyFractionalDigits(fractionalDigits);
			return new Decimal(10n ** BigInt(fractionalDigits), fractionalDigits);
		}
		static verifyFractionalDigits(fractionalDigits) {
			if (!Number.isInteger(fractionalDigits)) throw new Error("Fractional digits is not an integer");
			if (fractionalDigits < 0) throw new Error("Fractional digits must not be negative");
			if (fractionalDigits > maxFractionalDigits) throw new Error(`Fractional digits must not exceed ${maxFractionalDigits}`);
		}
		static compare(a, b) {
			if (a.fractionalDigits !== b.fractionalDigits) throw new Error("Fractional digits do not match");
			const difference = a.data.atomics - b.data.atomics;
			if (difference < 0n) return -1;
			if (difference > 0n) return 1;
			return 0;
		}
		get atomics() {
			return this.data.atomics.toString();
		}
		get fractionalDigits() {
			return this.data.fractionalDigits;
		}
		data;
		constructor(atomics, fractionalDigits) {
			this.data = {
				atomics,
				fractionalDigits
			};
		}
		/** Creates a new instance with the same value */
		clone() {
			return new Decimal(this.data.atomics, this.data.fractionalDigits);
		}
		/** Returns the greatest decimal <= this which has no fractional part (rounding down) */
		floor() {
			if (this.isNegative()) return this.neg().ceil().neg();
			const factor = 10n ** BigInt(this.data.fractionalDigits);
			const whole = this.data.atomics / factor;
			if (this.data.atomics % factor === 0n) return this.clone();
			else return new Decimal(whole * factor, this.fractionalDigits);
		}
		/** Returns the smallest decimal >= this which has no fractional part (rounding up) */
		ceil() {
			if (this.isNegative()) return this.neg().floor().neg();
			const factor = 10n ** BigInt(this.data.fractionalDigits);
			const whole = this.data.atomics / factor;
			if (this.data.atomics % factor === 0n) return this.clone();
			else return new Decimal((whole + 1n) * factor, this.fractionalDigits);
		}
		/**
		* Creates a new Decimal with the same value using the new fractional digits.
		* Roughly speaking this can expand an 3.24 to 3.24000 or shrink a 5.4321 to 5.4.
		*
		* This allows you to perform arithmetic operations given two decimals
		* with different fractional digits by normalizing them.
		*
		* When new fractional digits is smaller than the original value, the amount
		* is truncated (not rounded!).
		*/
		adjustFractionalDigits(newFractionalDigits) {
			Decimal.verifyFractionalDigits(newFractionalDigits);
			const diff = newFractionalDigits - this.fractionalDigits;
			if (diff > 0) return new Decimal(this.data.atomics * 10n ** BigInt(diff), newFractionalDigits);
			else if (diff === 0) return this.clone();
			else return new Decimal(this.data.atomics / 10n ** BigInt(-diff), newFractionalDigits);
		}
		toString() {
			if (this.isNegative()) return "-" + this.neg().toString();
			const factor = 10n ** BigInt(this.data.fractionalDigits);
			const whole = this.data.atomics / factor;
			const fractional = this.data.atomics % factor;
			if (fractional === 0n) return whole.toString();
			else {
				const trimmedFractionalPart = fractional.toString().padStart(this.data.fractionalDigits, "0").replace(/0+$/, "");
				return `${whole.toString()}.${trimmedFractionalPart}`;
			}
		}
		/**
		* Returns an approximation as a float type. Only use this if no
		* exact calculation is required.
		*/
		toFloatApproximation() {
			const out = Number(this.toString());
			if (Number.isNaN(out)) throw new Error("Conversion to number failed");
			return out;
		}
		/**
		* a.plus(b) returns a+b.
		*
		* Both values need to have the same fractional digits.
		*/
		plus(b) {
			if (this.fractionalDigits !== b.fractionalDigits) throw new Error("Fractional digits do not match");
			return new Decimal(this.data.atomics + b.data.atomics, this.fractionalDigits);
		}
		/**
		* a.minus(b) returns a-b.
		*
		* Both values need to have the same fractional digits.
		* The resulting difference needs to be non-negative.
		*/
		minus(b) {
			if (this.fractionalDigits !== b.fractionalDigits) throw new Error("Fractional digits do not match");
			return new Decimal(this.data.atomics - b.data.atomics, this.fractionalDigits);
		}
		/**
		* a.multiply(b) returns a*b.
		*
		* We only allow multiplication by unsigned integers to avoid rounding errors.
		*/
		multiply(b) {
			return new Decimal(this.data.atomics * b.toBigInt(), this.fractionalDigits);
		}
		/** Negates the value */
		neg() {
			return new Decimal(-this.data.atomics, this.data.fractionalDigits);
		}
		/** Returns the absolute value */
		abs() {
			return this.isNegative() ? this.neg() : this.clone();
		}
		equals(b) {
			return Decimal.compare(this, b) === 0;
		}
		/**
		* Returns true if and only if value is < 0.
		*
		* Please note that in contrast to numbers, -0 cannot be represented. I.e.
		* an input of "-0" is always normalized to "0" and is non-negative.
		*/
		isNegative() {
			return this.data.atomics < 0n;
		}
		isLessThan(b) {
			return Decimal.compare(this, b) < 0;
		}
		isLessThanOrEqual(b) {
			return Decimal.compare(this, b) <= 0;
		}
		isGreaterThan(b) {
			return Decimal.compare(this, b) > 0;
		}
		isGreaterThanOrEqual(b) {
			return Decimal.compare(this, b) >= 0;
		}
	};
}));
//#endregion
//#region node_modules/@cosmjs/math/build/integers.js
var require_integers = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Uint64 = exports.Uint53 = exports.Int53 = exports.Uint32 = void 0;
	var uint64MaxValue = 18446744073709551615n;
	exports.Uint32 = class Uint32 {
		/** @deprecated use Uint32.fromBytes */
		static fromBigEndianBytes(bytes) {
			return Uint32.fromBytes(bytes);
		}
		/**
		* Creates a Uint32 from a fixed length byte array.
		*
		* @param bytes a list of exactly 4 bytes
		* @param endianness defaults to big endian
		*/
		static fromBytes(bytes, endianness = "be") {
			if (bytes.length !== 4) throw new Error("Invalid input length. Expected 4 bytes.");
			for (let i = 0; i < bytes.length; ++i) if (!Number.isInteger(bytes[i]) || bytes[i] > 255 || bytes[i] < 0) throw new Error(`Invalid value in byte. Found: ${bytes[i]}`);
			const beBytes = endianness === "be" ? bytes : Array.from(bytes).reverse();
			return new Uint32(beBytes[0] * 2 ** 24 + beBytes[1] * 2 ** 16 + beBytes[2] * 2 ** 8 + beBytes[3]);
		}
		static fromString(str) {
			if (!str.match(/^[0-9]+$/)) throw new Error("Invalid string format");
			return new Uint32(Number.parseInt(str, 10));
		}
		data;
		constructor(input) {
			if (Number.isNaN(input)) throw new Error("Input is not a number");
			if (!Number.isInteger(input)) throw new Error("Input is not an integer");
			if (input < 0 || input > 4294967295) throw new Error("Input not in uint32 range: " + input.toString());
			this.data = input;
		}
		toBytesBigEndian() {
			return new Uint8Array([
				Math.floor(this.data / 2 ** 24) & 255,
				Math.floor(this.data / 2 ** 16) & 255,
				Math.floor(this.data / 2 ** 8) & 255,
				Math.floor(this.data / 1) & 255
			]);
		}
		toBytesLittleEndian() {
			return new Uint8Array([
				Math.floor(this.data / 1) & 255,
				Math.floor(this.data / 2 ** 8) & 255,
				Math.floor(this.data / 2 ** 16) & 255,
				Math.floor(this.data / 2 ** 24) & 255
			]);
		}
		toNumber() {
			return this.data;
		}
		toBigInt() {
			return BigInt(this.toNumber());
		}
		toString() {
			return this.data.toString();
		}
	};
	var Int53 = class Int53 {
		static fromString(str) {
			if (!str.match(/^-?[0-9]+$/)) throw new Error("Invalid string format");
			return new Int53(Number.parseInt(str, 10));
		}
		data;
		constructor(input) {
			if (Number.isNaN(input)) throw new Error("Input is not a number");
			if (!Number.isInteger(input)) throw new Error("Input is not an integer");
			if (input < Number.MIN_SAFE_INTEGER || input > Number.MAX_SAFE_INTEGER) throw new Error("Input not in int53 range: " + input.toString());
			this.data = input;
		}
		toNumber() {
			return this.data;
		}
		toBigInt() {
			return BigInt(this.toNumber());
		}
		toString() {
			return this.data.toString();
		}
	};
	exports.Int53 = Int53;
	exports.Uint53 = class Uint53 {
		static fromString(str) {
			return new Uint53(Int53.fromString(str).toNumber());
		}
		data;
		constructor(input) {
			const signed = new Int53(input);
			if (signed.toNumber() < 0) throw new Error("Input is negative");
			this.data = signed;
		}
		toNumber() {
			return this.data.toNumber();
		}
		toBigInt() {
			return BigInt(this.toNumber());
		}
		toString() {
			return this.data.toString();
		}
	};
	exports.Uint64 = class Uint64 {
		/** @deprecated use Uint64.fromBytes */
		static fromBytesBigEndian(bytes) {
			return Uint64.fromBytes(bytes);
		}
		/**
		* Creates a Uint64 from a fixed length byte array.
		*
		* @param bytes a list of exactly 8 bytes
		* @param endianness defaults to big endian
		*/
		static fromBytes(bytes, endianness = "be") {
			if (bytes.length !== 8) throw new Error("Invalid input length. Expected 8 bytes.");
			const beBytes = endianness === "be" ? Array.from(bytes) : Array.from(bytes).reverse();
			let value = 0n;
			for (const byte of beBytes) {
				value *= 256n;
				if (!Number.isInteger(byte) || byte > 255 || byte < 0) throw new Error(`Invalid value in byte. Found: ${byte}`);
				value += BigInt(byte);
			}
			return new Uint64(value);
		}
		static fromString(str) {
			if (!str.match(/^[0-9]+$/)) throw new Error("Invalid string format");
			return new Uint64(BigInt(str));
		}
		static fromNumber(input) {
			if (Number.isNaN(input)) throw new Error("Input is not a number");
			if (!Number.isInteger(input)) throw new Error("Input is not an integer");
			if (!Number.isSafeInteger(input)) throw new Error("Input is not a safe integer");
			return new Uint64(BigInt(input));
		}
		data;
		constructor(data) {
			if (data < 0n) throw new Error("Input is negative");
			if (data > uint64MaxValue) throw new Error("Input exceeds uint64 range");
			this.data = data;
		}
		toBytesBigEndian() {
			return this.toBytesLittleEndian().reverse();
		}
		toBytesLittleEndian() {
			const bytes = new Uint8Array(8);
			let value = this.data;
			for (let i = 0; i < bytes.length; i++) {
				bytes[i] = Number(value % 256n);
				value /= 256n;
			}
			return bytes;
		}
		toString() {
			return this.data.toString(10);
		}
		toBigInt() {
			return this.data;
		}
		toNumber() {
			if (this.data > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("number can only safely store up to 53 bits");
			return Number(this.data);
		}
	};
}));
//#endregion
//#region node_modules/@cosmjs/math/build/index.js
var require_build$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Uint64 = exports.Uint53 = exports.Uint32 = exports.Int53 = exports.Decimal = void 0;
	var decimal_1 = require_decimal();
	Object.defineProperty(exports, "Decimal", {
		enumerable: true,
		get: function() {
			return decimal_1.Decimal;
		}
	});
	var integers_1 = require_integers();
	Object.defineProperty(exports, "Int53", {
		enumerable: true,
		get: function() {
			return integers_1.Int53;
		}
	});
	Object.defineProperty(exports, "Uint32", {
		enumerable: true,
		get: function() {
			return integers_1.Uint32;
		}
	});
	Object.defineProperty(exports, "Uint53", {
		enumerable: true,
		get: function() {
			return integers_1.Uint53;
		}
	});
	Object.defineProperty(exports, "Uint64", {
		enumerable: true,
		get: function() {
			return integers_1.Uint64;
		}
	});
}));
//#endregion
//#region node_modules/@cosmjs/crypto/build/slip10.js
var require_slip10 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Slip10 = exports.Slip10RawIndex = exports.Slip10Curve = void 0;
	exports.slip10CurveFromString = slip10CurveFromString;
	exports.pathToString = pathToString;
	exports.stringToPath = stringToPath;
	var encoding_1 = require_build$4();
	var math_1 = require_build$3();
	var utils_1 = require_build$5();
	var secp256k1_1 = require_secp256k1$1();
	var hmac_1 = require_hmac();
	var sha_1 = require_sha();
	/**
	* Raw values must match the curve string in SLIP-0010 master key generation
	*
	* @see https://github.com/satoshilabs/slips/blob/master/slip-0010.md#master-key-generation
	*/
	var Slip10Curve;
	(function(Slip10Curve) {
		Slip10Curve["Secp256k1"] = "Bitcoin seed";
		Slip10Curve["Ed25519"] = "ed25519 seed";
	})(Slip10Curve || (exports.Slip10Curve = Slip10Curve = {}));
	function bytesToUnsignedBigInt(a) {
		return BigInt("0x" + (0, encoding_1.toHex)(a));
	}
	function intTo32be(n) {
		(0, utils_1.assert)(n >= 0n);
		(0, utils_1.assert)(n < 2n ** (32n * 8n));
		const hex = n.toString(16).padStart(64, "0");
		return (0, encoding_1.fromHex)(hex);
	}
	/**
	* Reverse mapping of Slip10Curve
	*/
	function slip10CurveFromString(curveString) {
		switch (curveString) {
			case Slip10Curve.Ed25519: return Slip10Curve.Ed25519;
			case Slip10Curve.Secp256k1: return Slip10Curve.Secp256k1;
			default: throw new Error(`Unknown curve string: '${curveString}'`);
		}
	}
	var Slip10RawIndex = class Slip10RawIndex extends math_1.Uint32 {
		static hardened(hardenedIndex) {
			return new Slip10RawIndex(hardenedIndex + 2 ** 31);
		}
		static normal(normalIndex) {
			return new Slip10RawIndex(normalIndex);
		}
		isHardened() {
			return this.data >= 2 ** 31;
		}
	};
	exports.Slip10RawIndex = Slip10RawIndex;
	exports.Slip10 = class Slip10 {
		static derivePath(curve, seed, path) {
			let result = this.master(curve, seed);
			for (const rawIndex of path) result = this.child(curve, result.privkey, result.chainCode, rawIndex);
			return result;
		}
		static master(curve, seed) {
			const i = new hmac_1.Hmac(sha_1.Sha512, (0, encoding_1.toAscii)(curve)).update(seed).digest();
			const il = i.slice(0, 32);
			const ir = i.slice(32, 64);
			if (curve !== Slip10Curve.Ed25519 && (this.isZero(il) || this.isGteN(curve, il))) return this.master(curve, i);
			return {
				chainCode: ir,
				privkey: il
			};
		}
		static child(curve, parentPrivkey, parentChainCode, rawIndex) {
			let i;
			if (rawIndex.isHardened()) {
				const payload = new Uint8Array([
					0,
					...parentPrivkey,
					...rawIndex.toBytesBigEndian()
				]);
				i = new hmac_1.Hmac(sha_1.Sha512, parentChainCode).update(payload).digest();
			} else if (curve === Slip10Curve.Ed25519) throw new Error("Normal keys are not allowed with ed25519");
			else {
				const data = new Uint8Array([...Slip10.serializedPoint(curve, bytesToUnsignedBigInt(parentPrivkey)), ...rawIndex.toBytesBigEndian()]);
				i = new hmac_1.Hmac(sha_1.Sha512, parentChainCode).update(data).digest();
			}
			return this.childImpl(curve, parentPrivkey, parentChainCode, rawIndex, i);
		}
		/**
		* Implementation of ser_P(point(k_par)) from BIP-0032
		*
		* @see https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
		*/
		static serializedPoint(curve, p) {
			switch (curve) {
				case Slip10Curve.Secp256k1: return (0, encoding_1.fixUint8Array)(secp256k1_1.secp256k1.Point.BASE.multiply(p).toBytes(true));
				default: throw new Error("curve not supported");
			}
		}
		static childImpl(curve, parentPrivkey, parentChainCode, rawIndex, i) {
			const il = i.slice(0, 32);
			const ir = i.slice(32, 64);
			const returnChainCode = ir;
			if (curve === Slip10Curve.Ed25519) return {
				chainCode: returnChainCode,
				privkey: il
			};
			const n = this.n(curve);
			const returnChildKey = intTo32be((bytesToUnsignedBigInt(il) + bytesToUnsignedBigInt(parentPrivkey)) % n);
			if (this.isGteN(curve, il) || this.isZero(returnChildKey)) {
				const newI = new hmac_1.Hmac(sha_1.Sha512, parentChainCode).update(new Uint8Array([
					1,
					...ir,
					...rawIndex.toBytesBigEndian()
				])).digest();
				return this.childImpl(curve, parentPrivkey, parentChainCode, rawIndex, newI);
			}
			return {
				chainCode: returnChainCode,
				privkey: returnChildKey
			};
		}
		static isZero(privkey) {
			return privkey.every((byte) => byte === 0);
		}
		static isGteN(curve, privkey) {
			return bytesToUnsignedBigInt(privkey) >= this.n(curve);
		}
		static n(curve) {
			switch (curve) {
				case Slip10Curve.Secp256k1: return 115792089237316195423570985008687907852837564279074904382605163141518161494337n;
				default: throw new Error("curve not supported");
			}
		}
	};
	function pathToString(path) {
		return path.reduce((current, component) => {
			const componentString = component.isHardened() ? `${component.toNumber() - 2 ** 31}'` : component.toString();
			return current + "/" + componentString;
		}, "m");
	}
	function stringToPath(input) {
		if (!input.startsWith("m")) throw new Error("Path string must start with 'm'");
		let rest = input.slice(1);
		const out = new Array();
		while (rest) {
			const match = rest.match(/^\/([0-9]+)('?)/);
			if (!match) throw new Error("Syntax error while reading path component");
			const [fullMatch, numberString, apostrophe] = match;
			const value = math_1.Uint53.fromString(numberString).toNumber();
			if (value >= 2 ** 31) throw new Error("Component value too high. Must not exceed 2**31-1.");
			if (apostrophe) out.push(Slip10RawIndex.hardened(value));
			else out.push(Slip10RawIndex.normal(value));
			rest = rest.slice(fullMatch.length);
		}
		return out;
	}
}));
//#endregion
//#region node_modules/@noble/ciphers/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Utilities for hex, bytes, CSPRNG.
	* @module
	*/
	/*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.wrapCipher = exports.Hash = exports.nextTick = exports.isLE = void 0;
	exports.isBytes = isBytes;
	exports.abool = abool;
	exports.anumber = anumber;
	exports.abytes = abytes;
	exports.ahash = ahash;
	exports.aexists = aexists;
	exports.aoutput = aoutput;
	exports.u8 = u8;
	exports.u32 = u32;
	exports.clean = clean;
	exports.createView = createView;
	exports.bytesToHex = bytesToHex;
	exports.hexToBytes = hexToBytes;
	exports.hexToNumber = hexToNumber;
	exports.bytesToNumberBE = bytesToNumberBE;
	exports.numberToBytesBE = numberToBytesBE;
	exports.utf8ToBytes = utf8ToBytes;
	exports.bytesToUtf8 = bytesToUtf8;
	exports.toBytes = toBytes;
	exports.overlapBytes = overlapBytes;
	exports.complexOverlapBytes = complexOverlapBytes;
	exports.concatBytes = concatBytes;
	exports.checkOpts = checkOpts;
	exports.equalBytes = equalBytes;
	exports.getOutput = getOutput;
	exports.setBigUint64 = setBigUint64;
	exports.u64Lengths = u64Lengths;
	exports.isAligned32 = isAligned32;
	exports.copyBytes = copyBytes;
	/** Checks if something is Uint8Array. Be careful: nodejs Buffer will return true. */
	function isBytes(a) {
		return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
	}
	/** Asserts something is boolean. */
	function abool(b) {
		if (typeof b !== "boolean") throw new Error(`boolean expected, not ${b}`);
	}
	/** Asserts something is positive integer. */
	function anumber(n) {
		if (!Number.isSafeInteger(n) || n < 0) throw new Error("positive integer expected, got " + n);
	}
	/** Asserts something is Uint8Array. */
	function abytes(b, ...lengths) {
		if (!isBytes(b)) throw new Error("Uint8Array expected");
		if (lengths.length > 0 && !lengths.includes(b.length)) throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
	}
	/**
	* Asserts something is hash
	* TODO: remove
	* @deprecated
	*/
	function ahash(h) {
		if (typeof h !== "function" || typeof h.create !== "function") throw new Error("Hash should be wrapped by utils.createHasher");
		anumber(h.outputLen);
		anumber(h.blockLen);
	}
	/** Asserts a hash instance has not been destroyed / finished */
	function aexists(instance, checkFinished = true) {
		if (instance.destroyed) throw new Error("Hash instance has been destroyed");
		if (checkFinished && instance.finished) throw new Error("Hash#digest() has already been called");
	}
	/** Asserts output is properly-sized byte array */
	function aoutput(out, instance) {
		abytes(out);
		const min = instance.outputLen;
		if (out.length < min) throw new Error("digestInto() expects output buffer of length at least " + min);
	}
	/** Cast u8 / u16 / u32 to u8. */
	function u8(arr) {
		return new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
	}
	/** Cast u8 / u16 / u32 to u32. */
	function u32(arr) {
		return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
	}
	/** Zeroize a byte array. Warning: JS provides no guarantees. */
	function clean(...arrays) {
		for (let i = 0; i < arrays.length; i++) arrays[i].fill(0);
	}
	/** Create DataView of an array for easy byte-level manipulation. */
	function createView(arr) {
		return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
	}
	/** Is current platform little-endian? Most are. Big-Endian platform: IBM */
	exports.isLE = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
	var hasHexBuiltin = typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function";
	var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
	/**
	* Convert byte array to hex string. Uses built-in function, when available.
	* @example bytesToHex(Uint8Array.from([0xca, 0xfe, 0x01, 0x23])) // 'cafe0123'
	*/
	function bytesToHex(bytes) {
		abytes(bytes);
		if (hasHexBuiltin) return bytes.toHex();
		let hex = "";
		for (let i = 0; i < bytes.length; i++) hex += hexes[bytes[i]];
		return hex;
	}
	var asciis = {
		_0: 48,
		_9: 57,
		A: 65,
		F: 70,
		a: 97,
		f: 102
	};
	function asciiToBase16(ch) {
		if (ch >= asciis._0 && ch <= asciis._9) return ch - asciis._0;
		if (ch >= asciis.A && ch <= asciis.F) return ch - (asciis.A - 10);
		if (ch >= asciis.a && ch <= asciis.f) return ch - (asciis.a - 10);
	}
	/**
	* Convert hex string to byte array. Uses built-in function, when available.
	* @example hexToBytes('cafe0123') // Uint8Array.from([0xca, 0xfe, 0x01, 0x23])
	*/
	function hexToBytes(hex) {
		if (typeof hex !== "string") throw new Error("hex string expected, got " + typeof hex);
		if (hasHexBuiltin) return Uint8Array.fromHex(hex);
		const hl = hex.length;
		const al = hl / 2;
		if (hl % 2) throw new Error("hex string expected, got unpadded hex of length " + hl);
		const array = new Uint8Array(al);
		for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
			const n1 = asciiToBase16(hex.charCodeAt(hi));
			const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
			if (n1 === void 0 || n2 === void 0) {
				const char = hex[hi] + hex[hi + 1];
				throw new Error("hex string expected, got non-hex character \"" + char + "\" at index " + hi);
			}
			array[ai] = n1 * 16 + n2;
		}
		return array;
	}
	function hexToNumber(hex) {
		if (typeof hex !== "string") throw new Error("hex string expected, got " + typeof hex);
		return BigInt(hex === "" ? "0" : "0x" + hex);
	}
	function bytesToNumberBE(bytes) {
		return hexToNumber(bytesToHex(bytes));
	}
	function numberToBytesBE(n, len) {
		return hexToBytes(n.toString(16).padStart(len * 2, "0"));
	}
	var nextTick = async () => {};
	exports.nextTick = nextTick;
	/**
	* Converts string to bytes using UTF8 encoding.
	* @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
	*/
	function utf8ToBytes(str) {
		if (typeof str !== "string") throw new Error("string expected");
		return new Uint8Array(new TextEncoder().encode(str));
	}
	/**
	* Converts bytes to string using UTF8 encoding.
	* @example bytesToUtf8(new Uint8Array([97, 98, 99])) // 'abc'
	*/
	function bytesToUtf8(bytes) {
		return new TextDecoder().decode(bytes);
	}
	/**
	* Normalizes (non-hex) string or Uint8Array to Uint8Array.
	* Warning: when Uint8Array is passed, it would NOT get copied.
	* Keep in mind for future mutable operations.
	*/
	function toBytes(data) {
		if (typeof data === "string") data = utf8ToBytes(data);
		else if (isBytes(data)) data = copyBytes(data);
		else throw new Error("Uint8Array expected, got " + typeof data);
		return data;
	}
	/**
	* Checks if two U8A use same underlying buffer and overlaps.
	* This is invalid and can corrupt data.
	*/
	function overlapBytes(a, b) {
		return a.buffer === b.buffer && a.byteOffset < b.byteOffset + b.byteLength && b.byteOffset < a.byteOffset + a.byteLength;
	}
	/**
	* If input and output overlap and input starts before output, we will overwrite end of input before
	* we start processing it, so this is not supported for most ciphers (except chacha/salse, which designed with this)
	*/
	function complexOverlapBytes(input, output) {
		if (overlapBytes(input, output) && input.byteOffset < output.byteOffset) throw new Error("complex overlap of input and output is not supported");
	}
	/**
	* Copies several Uint8Arrays into one.
	*/
	function concatBytes(...arrays) {
		let sum = 0;
		for (let i = 0; i < arrays.length; i++) {
			const a = arrays[i];
			abytes(a);
			sum += a.length;
		}
		const res = new Uint8Array(sum);
		for (let i = 0, pad = 0; i < arrays.length; i++) {
			const a = arrays[i];
			res.set(a, pad);
			pad += a.length;
		}
		return res;
	}
	function checkOpts(defaults, opts) {
		if (opts == null || typeof opts !== "object") throw new Error("options must be defined");
		return Object.assign(defaults, opts);
	}
	/** Compares 2 uint8array-s in kinda constant time. */
	function equalBytes(a, b) {
		if (a.length !== b.length) return false;
		let diff = 0;
		for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
		return diff === 0;
	}
	/** For runtime check if class implements interface. */
	var Hash = class {};
	exports.Hash = Hash;
	/**
	* Wraps a cipher: validates args, ensures encrypt() can only be called once.
	* @__NO_SIDE_EFFECTS__
	*/
	var wrapCipher = (params, constructor) => {
		function wrappedCipher(key, ...args) {
			abytes(key);
			if (!exports.isLE) throw new Error("Non little-endian hardware is not yet supported");
			if (params.nonceLength !== void 0) {
				const nonce = args[0];
				if (!nonce) throw new Error("nonce / iv required");
				if (params.varSizeNonce) abytes(nonce);
				else abytes(nonce, params.nonceLength);
			}
			const tagl = params.tagLength;
			if (tagl && args[1] !== void 0) abytes(args[1]);
			const cipher = constructor(key, ...args);
			const checkOutput = (fnLength, output) => {
				if (output !== void 0) {
					if (fnLength !== 2) throw new Error("cipher output not supported");
					abytes(output);
				}
			};
			let called = false;
			return {
				encrypt(data, output) {
					if (called) throw new Error("cannot encrypt() twice with same key + nonce");
					called = true;
					abytes(data);
					checkOutput(cipher.encrypt.length, output);
					return cipher.encrypt(data, output);
				},
				decrypt(data, output) {
					abytes(data);
					if (tagl && data.length < tagl) throw new Error("invalid ciphertext length: smaller than tagLength=" + tagl);
					checkOutput(cipher.decrypt.length, output);
					return cipher.decrypt(data, output);
				}
			};
		}
		Object.assign(wrappedCipher, params);
		return wrappedCipher;
	};
	exports.wrapCipher = wrapCipher;
	/**
	* By default, returns u8a of length.
	* When out is available, it checks it for validity and uses it.
	*/
	function getOutput(expectedLength, out, onlyAligned = true) {
		if (out === void 0) return new Uint8Array(expectedLength);
		if (out.length !== expectedLength) throw new Error("invalid output length, expected " + expectedLength + ", got: " + out.length);
		if (onlyAligned && !isAligned32(out)) throw new Error("invalid output, must be aligned");
		return out;
	}
	/** Polyfill for Safari 14. */
	function setBigUint64(view, byteOffset, value, isLE) {
		if (typeof view.setBigUint64 === "function") return view.setBigUint64(byteOffset, value, isLE);
		const _32n = BigInt(32);
		const _u32_max = BigInt(4294967295);
		const wh = Number(value >> _32n & _u32_max);
		const wl = Number(value & _u32_max);
		const h = isLE ? 4 : 0;
		const l = isLE ? 0 : 4;
		view.setUint32(byteOffset + h, wh, isLE);
		view.setUint32(byteOffset + l, wl, isLE);
	}
	function u64Lengths(dataLength, aadLength, isLE) {
		abool(isLE);
		const num = new Uint8Array(16);
		const view = createView(num);
		setBigUint64(view, 0, BigInt(aadLength), isLE);
		setBigUint64(view, 8, BigInt(dataLength), isLE);
		return num;
	}
	function isAligned32(bytes) {
		return bytes.byteOffset % 4 === 0;
	}
	function copyBytes(bytes) {
		return Uint8Array.from(bytes);
	}
}));
//#endregion
//#region node_modules/@noble/ciphers/_arx.js
var require__arx = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.rotl = rotl;
	exports.createCipher = createCipher;
	/**
	* Basic utils for ARX (add-rotate-xor) salsa and chacha ciphers.
	
	RFC8439 requires multi-step cipher stream, where
	authKey starts with counter: 0, actual msg with counter: 1.
	
	For this, we need a way to re-use nonce / counter:
	
	const counter = new Uint8Array(4);
	chacha(..., counter, ...); // counter is now 1
	chacha(..., counter, ...); // counter is now 2
	
	This is complicated:
	
	- 32-bit counters are enough, no need for 64-bit: max ArrayBuffer size in JS is 4GB
	- Original papers don't allow mutating counters
	- Counter overflow is undefined [^1]
	- Idea A: allow providing (nonce | counter) instead of just nonce, re-use it
	- Caveat: Cannot be re-used through all cases:
	- * chacha has (counter | nonce)
	- * xchacha has (nonce16 | counter | nonce16)
	- Idea B: separate nonce / counter and provide separate API for counter re-use
	- Caveat: there are different counter sizes depending on an algorithm.
	- salsa & chacha also differ in structures of key & sigma:
	salsa20:      s[0] | k(4) | s[1] | nonce(2) | ctr(2) | s[2] | k(4) | s[3]
	chacha:       s(4) | k(8) | ctr(1) | nonce(3)
	chacha20orig: s(4) | k(8) | ctr(2) | nonce(2)
	- Idea C: helper method such as `setSalsaState(key, nonce, sigma, data)`
	- Caveat: we can't re-use counter array
	
	xchacha [^2] uses the subkey and remaining 8 byte nonce with ChaCha20 as normal
	(prefixed by 4 NUL bytes, since [RFC8439] specifies a 12-byte nonce).
	
	[^1]: https://mailarchive.ietf.org/arch/msg/cfrg/gsOnTJzcbgG6OqD8Sc0GO5aR_tU/
	[^2]: https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-xchacha#appendix-A.2
	
	* @module
	*/
	var utils_ts_1 = require_utils();
	var _utf8ToBytes = (str) => Uint8Array.from(str.split("").map((c) => c.charCodeAt(0)));
	var sigma16 = _utf8ToBytes("expand 16-byte k");
	var sigma32 = _utf8ToBytes("expand 32-byte k");
	var sigma16_32 = (0, utils_ts_1.u32)(sigma16);
	var sigma32_32 = (0, utils_ts_1.u32)(sigma32);
	function rotl(a, b) {
		return a << b | a >>> 32 - b;
	}
	function isAligned32(b) {
		return b.byteOffset % 4 === 0;
	}
	var BLOCK_LEN = 64;
	var BLOCK_LEN32 = 16;
	var MAX_COUNTER = 2 ** 32 - 1;
	var U32_EMPTY = new Uint32Array();
	function runCipher(core, sigma, key, nonce, data, output, counter, rounds) {
		const len = data.length;
		const block = new Uint8Array(BLOCK_LEN);
		const b32 = (0, utils_ts_1.u32)(block);
		const isAligned = isAligned32(data) && isAligned32(output);
		const d32 = isAligned ? (0, utils_ts_1.u32)(data) : U32_EMPTY;
		const o32 = isAligned ? (0, utils_ts_1.u32)(output) : U32_EMPTY;
		for (let pos = 0; pos < len; counter++) {
			core(sigma, key, nonce, b32, counter, rounds);
			if (counter >= MAX_COUNTER) throw new Error("arx: counter overflow");
			const take = Math.min(BLOCK_LEN, len - pos);
			if (isAligned && take === BLOCK_LEN) {
				const pos32 = pos / 4;
				if (pos % 4 !== 0) throw new Error("arx: invalid block position");
				for (let j = 0, posj; j < BLOCK_LEN32; j++) {
					posj = pos32 + j;
					o32[posj] = d32[posj] ^ b32[j];
				}
				pos += BLOCK_LEN;
				continue;
			}
			for (let j = 0, posj; j < take; j++) {
				posj = pos + j;
				output[posj] = data[posj] ^ block[j];
			}
			pos += take;
		}
	}
	/** Creates ARX-like (ChaCha, Salsa) cipher stream from core function. */
	function createCipher(core, opts) {
		const { allowShortKeys, extendNonceFn, counterLength, counterRight, rounds } = (0, utils_ts_1.checkOpts)({
			allowShortKeys: false,
			counterLength: 8,
			counterRight: false,
			rounds: 20
		}, opts);
		if (typeof core !== "function") throw new Error("core must be a function");
		(0, utils_ts_1.anumber)(counterLength);
		(0, utils_ts_1.anumber)(rounds);
		(0, utils_ts_1.abool)(counterRight);
		(0, utils_ts_1.abool)(allowShortKeys);
		return (key, nonce, data, output, counter = 0) => {
			(0, utils_ts_1.abytes)(key);
			(0, utils_ts_1.abytes)(nonce);
			(0, utils_ts_1.abytes)(data);
			const len = data.length;
			if (output === void 0) output = new Uint8Array(len);
			(0, utils_ts_1.abytes)(output);
			(0, utils_ts_1.anumber)(counter);
			if (counter < 0 || counter >= MAX_COUNTER) throw new Error("arx: counter overflow");
			if (output.length < len) throw new Error(`arx: output (${output.length}) is shorter than data (${len})`);
			const toClean = [];
			let l = key.length;
			let k;
			let sigma;
			if (l === 32) {
				toClean.push(k = (0, utils_ts_1.copyBytes)(key));
				sigma = sigma32_32;
			} else if (l === 16 && allowShortKeys) {
				k = new Uint8Array(32);
				k.set(key);
				k.set(key, 16);
				sigma = sigma16_32;
				toClean.push(k);
			} else throw new Error(`arx: invalid 32-byte key, got length=${l}`);
			if (!isAligned32(nonce)) toClean.push(nonce = (0, utils_ts_1.copyBytes)(nonce));
			const k32 = (0, utils_ts_1.u32)(k);
			if (extendNonceFn) {
				if (nonce.length !== 24) throw new Error(`arx: extended nonce must be 24 bytes`);
				extendNonceFn(sigma, k32, (0, utils_ts_1.u32)(nonce.subarray(0, 16)), k32);
				nonce = nonce.subarray(16);
			}
			const nonceNcLen = 16 - counterLength;
			if (nonceNcLen !== nonce.length) throw new Error(`arx: nonce must be ${nonceNcLen} or 16 bytes`);
			if (nonceNcLen !== 12) {
				const nc = new Uint8Array(12);
				nc.set(nonce, counterRight ? 0 : 12 - nonce.length);
				nonce = nc;
				toClean.push(nonce);
			}
			const n32 = (0, utils_ts_1.u32)(nonce);
			runCipher(core, sigma, k32, n32, data, output, counter, rounds);
			(0, utils_ts_1.clean)(...toClean);
			return output;
		};
	}
}));
//#endregion
//#region node_modules/@noble/ciphers/_poly1305.js
var require__poly1305 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.poly1305 = void 0;
	exports.wrapConstructorWithKey = wrapConstructorWithKey;
	/**
	* Poly1305 ([PDF](https://cr.yp.to/mac/poly1305-20050329.pdf),
	* [wiki](https://en.wikipedia.org/wiki/Poly1305))
	* is a fast and parallel secret-key message-authentication code suitable for
	* a wide variety of applications. It was standardized in
	* [RFC 8439](https://datatracker.ietf.org/doc/html/rfc8439) and is now used in TLS 1.3.
	*
	* Polynomial MACs are not perfect for every situation:
	* they lack Random Key Robustness: the MAC can be forged, and can't be used in PAKE schemes.
	* See [invisible salamanders attack](https://keymaterial.net/2020/09/07/invisible-salamanders-in-aes-gcm-siv/).
	* To combat invisible salamanders, `hash(key)` can be included in ciphertext,
	* however, this would violate ciphertext indistinguishability:
	* an attacker would know which key was used - so `HKDF(key, i)`
	* could be used instead.
	*
	* Check out [original website](https://cr.yp.to/mac.html).
	* @module
	*/
	var utils_ts_1 = require_utils();
	var u8to16 = (a, i) => a[i++] & 255 | (a[i++] & 255) << 8;
	var Poly1305 = class {
		constructor(key) {
			this.blockLen = 16;
			this.outputLen = 16;
			this.buffer = new Uint8Array(16);
			this.r = new Uint16Array(10);
			this.h = new Uint16Array(10);
			this.pad = new Uint16Array(8);
			this.pos = 0;
			this.finished = false;
			key = (0, utils_ts_1.toBytes)(key);
			(0, utils_ts_1.abytes)(key, 32);
			const t0 = u8to16(key, 0);
			const t1 = u8to16(key, 2);
			const t2 = u8to16(key, 4);
			const t3 = u8to16(key, 6);
			const t4 = u8to16(key, 8);
			const t5 = u8to16(key, 10);
			const t6 = u8to16(key, 12);
			const t7 = u8to16(key, 14);
			this.r[0] = t0 & 8191;
			this.r[1] = (t0 >>> 13 | t1 << 3) & 8191;
			this.r[2] = (t1 >>> 10 | t2 << 6) & 7939;
			this.r[3] = (t2 >>> 7 | t3 << 9) & 8191;
			this.r[4] = (t3 >>> 4 | t4 << 12) & 255;
			this.r[5] = t4 >>> 1 & 8190;
			this.r[6] = (t4 >>> 14 | t5 << 2) & 8191;
			this.r[7] = (t5 >>> 11 | t6 << 5) & 8065;
			this.r[8] = (t6 >>> 8 | t7 << 8) & 8191;
			this.r[9] = t7 >>> 5 & 127;
			for (let i = 0; i < 8; i++) this.pad[i] = u8to16(key, 16 + 2 * i);
		}
		process(data, offset, isLast = false) {
			const hibit = isLast ? 0 : 2048;
			const { h, r } = this;
			const r0 = r[0];
			const r1 = r[1];
			const r2 = r[2];
			const r3 = r[3];
			const r4 = r[4];
			const r5 = r[5];
			const r6 = r[6];
			const r7 = r[7];
			const r8 = r[8];
			const r9 = r[9];
			const t0 = u8to16(data, offset + 0);
			const t1 = u8to16(data, offset + 2);
			const t2 = u8to16(data, offset + 4);
			const t3 = u8to16(data, offset + 6);
			const t4 = u8to16(data, offset + 8);
			const t5 = u8to16(data, offset + 10);
			const t6 = u8to16(data, offset + 12);
			const t7 = u8to16(data, offset + 14);
			let h0 = h[0] + (t0 & 8191);
			let h1 = h[1] + ((t0 >>> 13 | t1 << 3) & 8191);
			let h2 = h[2] + ((t1 >>> 10 | t2 << 6) & 8191);
			let h3 = h[3] + ((t2 >>> 7 | t3 << 9) & 8191);
			let h4 = h[4] + ((t3 >>> 4 | t4 << 12) & 8191);
			let h5 = h[5] + (t4 >>> 1 & 8191);
			let h6 = h[6] + ((t4 >>> 14 | t5 << 2) & 8191);
			let h7 = h[7] + ((t5 >>> 11 | t6 << 5) & 8191);
			let h8 = h[8] + ((t6 >>> 8 | t7 << 8) & 8191);
			let h9 = h[9] + (t7 >>> 5 | hibit);
			let c = 0;
			let d0 = c + h0 * r0 + h1 * (5 * r9) + h2 * (5 * r8) + h3 * (5 * r7) + h4 * (5 * r6);
			c = d0 >>> 13;
			d0 &= 8191;
			d0 += h5 * (5 * r5) + h6 * (5 * r4) + h7 * (5 * r3) + h8 * (5 * r2) + h9 * (5 * r1);
			c += d0 >>> 13;
			d0 &= 8191;
			let d1 = c + h0 * r1 + h1 * r0 + h2 * (5 * r9) + h3 * (5 * r8) + h4 * (5 * r7);
			c = d1 >>> 13;
			d1 &= 8191;
			d1 += h5 * (5 * r6) + h6 * (5 * r5) + h7 * (5 * r4) + h8 * (5 * r3) + h9 * (5 * r2);
			c += d1 >>> 13;
			d1 &= 8191;
			let d2 = c + h0 * r2 + h1 * r1 + h2 * r0 + h3 * (5 * r9) + h4 * (5 * r8);
			c = d2 >>> 13;
			d2 &= 8191;
			d2 += h5 * (5 * r7) + h6 * (5 * r6) + h7 * (5 * r5) + h8 * (5 * r4) + h9 * (5 * r3);
			c += d2 >>> 13;
			d2 &= 8191;
			let d3 = c + h0 * r3 + h1 * r2 + h2 * r1 + h3 * r0 + h4 * (5 * r9);
			c = d3 >>> 13;
			d3 &= 8191;
			d3 += h5 * (5 * r8) + h6 * (5 * r7) + h7 * (5 * r6) + h8 * (5 * r5) + h9 * (5 * r4);
			c += d3 >>> 13;
			d3 &= 8191;
			let d4 = c + h0 * r4 + h1 * r3 + h2 * r2 + h3 * r1 + h4 * r0;
			c = d4 >>> 13;
			d4 &= 8191;
			d4 += h5 * (5 * r9) + h6 * (5 * r8) + h7 * (5 * r7) + h8 * (5 * r6) + h9 * (5 * r5);
			c += d4 >>> 13;
			d4 &= 8191;
			let d5 = c + h0 * r5 + h1 * r4 + h2 * r3 + h3 * r2 + h4 * r1;
			c = d5 >>> 13;
			d5 &= 8191;
			d5 += h5 * r0 + h6 * (5 * r9) + h7 * (5 * r8) + h8 * (5 * r7) + h9 * (5 * r6);
			c += d5 >>> 13;
			d5 &= 8191;
			let d6 = c + h0 * r6 + h1 * r5 + h2 * r4 + h3 * r3 + h4 * r2;
			c = d6 >>> 13;
			d6 &= 8191;
			d6 += h5 * r1 + h6 * r0 + h7 * (5 * r9) + h8 * (5 * r8) + h9 * (5 * r7);
			c += d6 >>> 13;
			d6 &= 8191;
			let d7 = c + h0 * r7 + h1 * r6 + h2 * r5 + h3 * r4 + h4 * r3;
			c = d7 >>> 13;
			d7 &= 8191;
			d7 += h5 * r2 + h6 * r1 + h7 * r0 + h8 * (5 * r9) + h9 * (5 * r8);
			c += d7 >>> 13;
			d7 &= 8191;
			let d8 = c + h0 * r8 + h1 * r7 + h2 * r6 + h3 * r5 + h4 * r4;
			c = d8 >>> 13;
			d8 &= 8191;
			d8 += h5 * r3 + h6 * r2 + h7 * r1 + h8 * r0 + h9 * (5 * r9);
			c += d8 >>> 13;
			d8 &= 8191;
			let d9 = c + h0 * r9 + h1 * r8 + h2 * r7 + h3 * r6 + h4 * r5;
			c = d9 >>> 13;
			d9 &= 8191;
			d9 += h5 * r4 + h6 * r3 + h7 * r2 + h8 * r1 + h9 * r0;
			c += d9 >>> 13;
			d9 &= 8191;
			c = (c << 2) + c | 0;
			c = c + d0 | 0;
			d0 = c & 8191;
			c = c >>> 13;
			d1 += c;
			h[0] = d0;
			h[1] = d1;
			h[2] = d2;
			h[3] = d3;
			h[4] = d4;
			h[5] = d5;
			h[6] = d6;
			h[7] = d7;
			h[8] = d8;
			h[9] = d9;
		}
		finalize() {
			const { h, pad } = this;
			const g = new Uint16Array(10);
			let c = h[1] >>> 13;
			h[1] &= 8191;
			for (let i = 2; i < 10; i++) {
				h[i] += c;
				c = h[i] >>> 13;
				h[i] &= 8191;
			}
			h[0] += c * 5;
			c = h[0] >>> 13;
			h[0] &= 8191;
			h[1] += c;
			c = h[1] >>> 13;
			h[1] &= 8191;
			h[2] += c;
			g[0] = h[0] + 5;
			c = g[0] >>> 13;
			g[0] &= 8191;
			for (let i = 1; i < 10; i++) {
				g[i] = h[i] + c;
				c = g[i] >>> 13;
				g[i] &= 8191;
			}
			g[9] -= 8192;
			let mask = (c ^ 1) - 1;
			for (let i = 0; i < 10; i++) g[i] &= mask;
			mask = ~mask;
			for (let i = 0; i < 10; i++) h[i] = h[i] & mask | g[i];
			h[0] = (h[0] | h[1] << 13) & 65535;
			h[1] = (h[1] >>> 3 | h[2] << 10) & 65535;
			h[2] = (h[2] >>> 6 | h[3] << 7) & 65535;
			h[3] = (h[3] >>> 9 | h[4] << 4) & 65535;
			h[4] = (h[4] >>> 12 | h[5] << 1 | h[6] << 14) & 65535;
			h[5] = (h[6] >>> 2 | h[7] << 11) & 65535;
			h[6] = (h[7] >>> 5 | h[8] << 8) & 65535;
			h[7] = (h[8] >>> 8 | h[9] << 5) & 65535;
			let f = h[0] + pad[0];
			h[0] = f & 65535;
			for (let i = 1; i < 8; i++) {
				f = (h[i] + pad[i] | 0) + (f >>> 16) | 0;
				h[i] = f & 65535;
			}
			(0, utils_ts_1.clean)(g);
		}
		update(data) {
			(0, utils_ts_1.aexists)(this);
			data = (0, utils_ts_1.toBytes)(data);
			(0, utils_ts_1.abytes)(data);
			const { buffer, blockLen } = this;
			const len = data.length;
			for (let pos = 0; pos < len;) {
				const take = Math.min(blockLen - this.pos, len - pos);
				if (take === blockLen) {
					for (; blockLen <= len - pos; pos += blockLen) this.process(data, pos);
					continue;
				}
				buffer.set(data.subarray(pos, pos + take), this.pos);
				this.pos += take;
				pos += take;
				if (this.pos === blockLen) {
					this.process(buffer, 0, false);
					this.pos = 0;
				}
			}
			return this;
		}
		destroy() {
			(0, utils_ts_1.clean)(this.h, this.r, this.buffer, this.pad);
		}
		digestInto(out) {
			(0, utils_ts_1.aexists)(this);
			(0, utils_ts_1.aoutput)(out, this);
			this.finished = true;
			const { buffer, h } = this;
			let { pos } = this;
			if (pos) {
				buffer[pos++] = 1;
				for (; pos < 16; pos++) buffer[pos] = 0;
				this.process(buffer, 0, true);
			}
			this.finalize();
			let opos = 0;
			for (let i = 0; i < 8; i++) {
				out[opos++] = h[i] >>> 0;
				out[opos++] = h[i] >>> 8;
			}
			return out;
		}
		digest() {
			const { buffer, outputLen } = this;
			this.digestInto(buffer);
			const res = buffer.slice(0, outputLen);
			this.destroy();
			return res;
		}
	};
	function wrapConstructorWithKey(hashCons) {
		const hashC = (msg, key) => hashCons(key).update((0, utils_ts_1.toBytes)(msg)).digest();
		const tmp = hashCons(new Uint8Array(32));
		hashC.outputLen = tmp.outputLen;
		hashC.blockLen = tmp.blockLen;
		hashC.create = (key) => hashCons(key);
		return hashC;
	}
	/** Poly1305 MAC from RFC 8439. */
	exports.poly1305 = wrapConstructorWithKey((key) => new Poly1305(key));
}));
//#endregion
//#region node_modules/@noble/ciphers/chacha.js
var require_chacha = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.xchacha20poly1305 = exports.chacha20poly1305 = exports._poly1305_aead = exports.chacha12 = exports.chacha8 = exports.xchacha20 = exports.chacha20 = exports.chacha20orig = void 0;
	exports.hchacha = hchacha;
	/**
	* [ChaCha20](https://cr.yp.to/chacha.html) stream cipher, released
	* in 2008. Developed after Salsa20, ChaCha aims to increase diffusion per round.
	* It was standardized in [RFC 8439](https://datatracker.ietf.org/doc/html/rfc8439) and
	* is now used in TLS 1.3.
	*
	* [XChaCha20](https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-xchacha)
	* extended-nonce variant is also provided. Similar to XSalsa, it's safe to use with
	* randomly-generated nonces.
	*
	* Check out [PDF](http://cr.yp.to/chacha/chacha-20080128.pdf) and
	* [wiki](https://en.wikipedia.org/wiki/Salsa20).
	* @module
	*/
	var _arx_ts_1 = require__arx();
	var _poly1305_ts_1 = require__poly1305();
	var utils_ts_1 = require_utils();
	/**
	* ChaCha core function.
	*/
	function chachaCore(s, k, n, out, cnt, rounds = 20) {
		let y00 = s[0], y01 = s[1], y02 = s[2], y03 = s[3], y04 = k[0], y05 = k[1], y06 = k[2], y07 = k[3], y08 = k[4], y09 = k[5], y10 = k[6], y11 = k[7], y12 = cnt, y13 = n[0], y14 = n[1], y15 = n[2];
		let x00 = y00, x01 = y01, x02 = y02, x03 = y03, x04 = y04, x05 = y05, x06 = y06, x07 = y07, x08 = y08, x09 = y09, x10 = y10, x11 = y11, x12 = y12, x13 = y13, x14 = y14, x15 = y15;
		for (let r = 0; r < rounds; r += 2) {
			x00 = x00 + x04 | 0;
			x12 = (0, _arx_ts_1.rotl)(x12 ^ x00, 16);
			x08 = x08 + x12 | 0;
			x04 = (0, _arx_ts_1.rotl)(x04 ^ x08, 12);
			x00 = x00 + x04 | 0;
			x12 = (0, _arx_ts_1.rotl)(x12 ^ x00, 8);
			x08 = x08 + x12 | 0;
			x04 = (0, _arx_ts_1.rotl)(x04 ^ x08, 7);
			x01 = x01 + x05 | 0;
			x13 = (0, _arx_ts_1.rotl)(x13 ^ x01, 16);
			x09 = x09 + x13 | 0;
			x05 = (0, _arx_ts_1.rotl)(x05 ^ x09, 12);
			x01 = x01 + x05 | 0;
			x13 = (0, _arx_ts_1.rotl)(x13 ^ x01, 8);
			x09 = x09 + x13 | 0;
			x05 = (0, _arx_ts_1.rotl)(x05 ^ x09, 7);
			x02 = x02 + x06 | 0;
			x14 = (0, _arx_ts_1.rotl)(x14 ^ x02, 16);
			x10 = x10 + x14 | 0;
			x06 = (0, _arx_ts_1.rotl)(x06 ^ x10, 12);
			x02 = x02 + x06 | 0;
			x14 = (0, _arx_ts_1.rotl)(x14 ^ x02, 8);
			x10 = x10 + x14 | 0;
			x06 = (0, _arx_ts_1.rotl)(x06 ^ x10, 7);
			x03 = x03 + x07 | 0;
			x15 = (0, _arx_ts_1.rotl)(x15 ^ x03, 16);
			x11 = x11 + x15 | 0;
			x07 = (0, _arx_ts_1.rotl)(x07 ^ x11, 12);
			x03 = x03 + x07 | 0;
			x15 = (0, _arx_ts_1.rotl)(x15 ^ x03, 8);
			x11 = x11 + x15 | 0;
			x07 = (0, _arx_ts_1.rotl)(x07 ^ x11, 7);
			x00 = x00 + x05 | 0;
			x15 = (0, _arx_ts_1.rotl)(x15 ^ x00, 16);
			x10 = x10 + x15 | 0;
			x05 = (0, _arx_ts_1.rotl)(x05 ^ x10, 12);
			x00 = x00 + x05 | 0;
			x15 = (0, _arx_ts_1.rotl)(x15 ^ x00, 8);
			x10 = x10 + x15 | 0;
			x05 = (0, _arx_ts_1.rotl)(x05 ^ x10, 7);
			x01 = x01 + x06 | 0;
			x12 = (0, _arx_ts_1.rotl)(x12 ^ x01, 16);
			x11 = x11 + x12 | 0;
			x06 = (0, _arx_ts_1.rotl)(x06 ^ x11, 12);
			x01 = x01 + x06 | 0;
			x12 = (0, _arx_ts_1.rotl)(x12 ^ x01, 8);
			x11 = x11 + x12 | 0;
			x06 = (0, _arx_ts_1.rotl)(x06 ^ x11, 7);
			x02 = x02 + x07 | 0;
			x13 = (0, _arx_ts_1.rotl)(x13 ^ x02, 16);
			x08 = x08 + x13 | 0;
			x07 = (0, _arx_ts_1.rotl)(x07 ^ x08, 12);
			x02 = x02 + x07 | 0;
			x13 = (0, _arx_ts_1.rotl)(x13 ^ x02, 8);
			x08 = x08 + x13 | 0;
			x07 = (0, _arx_ts_1.rotl)(x07 ^ x08, 7);
			x03 = x03 + x04 | 0;
			x14 = (0, _arx_ts_1.rotl)(x14 ^ x03, 16);
			x09 = x09 + x14 | 0;
			x04 = (0, _arx_ts_1.rotl)(x04 ^ x09, 12);
			x03 = x03 + x04 | 0;
			x14 = (0, _arx_ts_1.rotl)(x14 ^ x03, 8);
			x09 = x09 + x14 | 0;
			x04 = (0, _arx_ts_1.rotl)(x04 ^ x09, 7);
		}
		let oi = 0;
		out[oi++] = y00 + x00 | 0;
		out[oi++] = y01 + x01 | 0;
		out[oi++] = y02 + x02 | 0;
		out[oi++] = y03 + x03 | 0;
		out[oi++] = y04 + x04 | 0;
		out[oi++] = y05 + x05 | 0;
		out[oi++] = y06 + x06 | 0;
		out[oi++] = y07 + x07 | 0;
		out[oi++] = y08 + x08 | 0;
		out[oi++] = y09 + x09 | 0;
		out[oi++] = y10 + x10 | 0;
		out[oi++] = y11 + x11 | 0;
		out[oi++] = y12 + x12 | 0;
		out[oi++] = y13 + x13 | 0;
		out[oi++] = y14 + x14 | 0;
		out[oi++] = y15 + x15 | 0;
	}
	/**
	* hchacha helper method, used primarily in xchacha, to hash
	* key and nonce into key' and nonce'.
	* Same as chachaCore, but there doesn't seem to be a way to move the block
	* out without 25% performance hit.
	*/
	function hchacha(s, k, i, o32) {
		let x00 = s[0], x01 = s[1], x02 = s[2], x03 = s[3], x04 = k[0], x05 = k[1], x06 = k[2], x07 = k[3], x08 = k[4], x09 = k[5], x10 = k[6], x11 = k[7], x12 = i[0], x13 = i[1], x14 = i[2], x15 = i[3];
		for (let r = 0; r < 20; r += 2) {
			x00 = x00 + x04 | 0;
			x12 = (0, _arx_ts_1.rotl)(x12 ^ x00, 16);
			x08 = x08 + x12 | 0;
			x04 = (0, _arx_ts_1.rotl)(x04 ^ x08, 12);
			x00 = x00 + x04 | 0;
			x12 = (0, _arx_ts_1.rotl)(x12 ^ x00, 8);
			x08 = x08 + x12 | 0;
			x04 = (0, _arx_ts_1.rotl)(x04 ^ x08, 7);
			x01 = x01 + x05 | 0;
			x13 = (0, _arx_ts_1.rotl)(x13 ^ x01, 16);
			x09 = x09 + x13 | 0;
			x05 = (0, _arx_ts_1.rotl)(x05 ^ x09, 12);
			x01 = x01 + x05 | 0;
			x13 = (0, _arx_ts_1.rotl)(x13 ^ x01, 8);
			x09 = x09 + x13 | 0;
			x05 = (0, _arx_ts_1.rotl)(x05 ^ x09, 7);
			x02 = x02 + x06 | 0;
			x14 = (0, _arx_ts_1.rotl)(x14 ^ x02, 16);
			x10 = x10 + x14 | 0;
			x06 = (0, _arx_ts_1.rotl)(x06 ^ x10, 12);
			x02 = x02 + x06 | 0;
			x14 = (0, _arx_ts_1.rotl)(x14 ^ x02, 8);
			x10 = x10 + x14 | 0;
			x06 = (0, _arx_ts_1.rotl)(x06 ^ x10, 7);
			x03 = x03 + x07 | 0;
			x15 = (0, _arx_ts_1.rotl)(x15 ^ x03, 16);
			x11 = x11 + x15 | 0;
			x07 = (0, _arx_ts_1.rotl)(x07 ^ x11, 12);
			x03 = x03 + x07 | 0;
			x15 = (0, _arx_ts_1.rotl)(x15 ^ x03, 8);
			x11 = x11 + x15 | 0;
			x07 = (0, _arx_ts_1.rotl)(x07 ^ x11, 7);
			x00 = x00 + x05 | 0;
			x15 = (0, _arx_ts_1.rotl)(x15 ^ x00, 16);
			x10 = x10 + x15 | 0;
			x05 = (0, _arx_ts_1.rotl)(x05 ^ x10, 12);
			x00 = x00 + x05 | 0;
			x15 = (0, _arx_ts_1.rotl)(x15 ^ x00, 8);
			x10 = x10 + x15 | 0;
			x05 = (0, _arx_ts_1.rotl)(x05 ^ x10, 7);
			x01 = x01 + x06 | 0;
			x12 = (0, _arx_ts_1.rotl)(x12 ^ x01, 16);
			x11 = x11 + x12 | 0;
			x06 = (0, _arx_ts_1.rotl)(x06 ^ x11, 12);
			x01 = x01 + x06 | 0;
			x12 = (0, _arx_ts_1.rotl)(x12 ^ x01, 8);
			x11 = x11 + x12 | 0;
			x06 = (0, _arx_ts_1.rotl)(x06 ^ x11, 7);
			x02 = x02 + x07 | 0;
			x13 = (0, _arx_ts_1.rotl)(x13 ^ x02, 16);
			x08 = x08 + x13 | 0;
			x07 = (0, _arx_ts_1.rotl)(x07 ^ x08, 12);
			x02 = x02 + x07 | 0;
			x13 = (0, _arx_ts_1.rotl)(x13 ^ x02, 8);
			x08 = x08 + x13 | 0;
			x07 = (0, _arx_ts_1.rotl)(x07 ^ x08, 7);
			x03 = x03 + x04 | 0;
			x14 = (0, _arx_ts_1.rotl)(x14 ^ x03, 16);
			x09 = x09 + x14 | 0;
			x04 = (0, _arx_ts_1.rotl)(x04 ^ x09, 12);
			x03 = x03 + x04 | 0;
			x14 = (0, _arx_ts_1.rotl)(x14 ^ x03, 8);
			x09 = x09 + x14 | 0;
			x04 = (0, _arx_ts_1.rotl)(x04 ^ x09, 7);
		}
		let oi = 0;
		o32[oi++] = x00;
		o32[oi++] = x01;
		o32[oi++] = x02;
		o32[oi++] = x03;
		o32[oi++] = x12;
		o32[oi++] = x13;
		o32[oi++] = x14;
		o32[oi++] = x15;
	}
	/**
	* Original, non-RFC chacha20 from DJB. 8-byte nonce, 8-byte counter.
	*/
	exports.chacha20orig = (0, _arx_ts_1.createCipher)(chachaCore, {
		counterRight: false,
		counterLength: 8,
		allowShortKeys: true
	});
	/**
	* ChaCha stream cipher. Conforms to RFC 8439 (IETF, TLS). 12-byte nonce, 4-byte counter.
	* With 12-byte nonce, it's not safe to use fill it with random (CSPRNG), due to collision chance.
	*/
	exports.chacha20 = (0, _arx_ts_1.createCipher)(chachaCore, {
		counterRight: false,
		counterLength: 4,
		allowShortKeys: false
	});
	/**
	* XChaCha eXtended-nonce ChaCha. 24-byte nonce.
	* With 24-byte nonce, it's safe to use fill it with random (CSPRNG).
	* https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-xchacha
	*/
	exports.xchacha20 = (0, _arx_ts_1.createCipher)(chachaCore, {
		counterRight: false,
		counterLength: 8,
		extendNonceFn: hchacha,
		allowShortKeys: false
	});
	/**
	* Reduced 8-round chacha, described in original paper.
	*/
	exports.chacha8 = (0, _arx_ts_1.createCipher)(chachaCore, {
		counterRight: false,
		counterLength: 4,
		rounds: 8
	});
	/**
	* Reduced 12-round chacha, described in original paper.
	*/
	exports.chacha12 = (0, _arx_ts_1.createCipher)(chachaCore, {
		counterRight: false,
		counterLength: 4,
		rounds: 12
	});
	var ZEROS16 = /* @__PURE__ */ new Uint8Array(16);
	var updatePadded = (h, msg) => {
		h.update(msg);
		const left = msg.length % 16;
		if (left) h.update(ZEROS16.subarray(left));
	};
	var ZEROS32 = /* @__PURE__ */ new Uint8Array(32);
	function computeTag(fn, key, nonce, data, AAD) {
		const authKey = fn(key, nonce, ZEROS32);
		const h = _poly1305_ts_1.poly1305.create(authKey);
		if (AAD) updatePadded(h, AAD);
		updatePadded(h, data);
		const num = (0, utils_ts_1.u64Lengths)(data.length, AAD ? AAD.length : 0, true);
		h.update(num);
		const res = h.digest();
		(0, utils_ts_1.clean)(authKey, num);
		return res;
	}
	/**
	* AEAD algorithm from RFC 8439.
	* Salsa20 and chacha (RFC 8439) use poly1305 differently.
	* We could have composed them similar to:
	* https://github.com/paulmillr/scure-base/blob/b266c73dde977b1dd7ef40ef7a23cc15aab526b3/index.ts#L250
	* But it's hard because of authKey:
	* In salsa20, authKey changes position in salsa stream.
	* In chacha, authKey can't be computed inside computeTag, it modifies the counter.
	*/
	var _poly1305_aead = (xorStream) => (key, nonce, AAD) => {
		const tagLength = 16;
		return {
			encrypt(plaintext, output) {
				const plength = plaintext.length;
				output = (0, utils_ts_1.getOutput)(plength + tagLength, output, false);
				output.set(plaintext);
				const oPlain = output.subarray(0, -tagLength);
				xorStream(key, nonce, oPlain, oPlain, 1);
				const tag = computeTag(xorStream, key, nonce, oPlain, AAD);
				output.set(tag, plength);
				(0, utils_ts_1.clean)(tag);
				return output;
			},
			decrypt(ciphertext, output) {
				output = (0, utils_ts_1.getOutput)(ciphertext.length - tagLength, output, false);
				const data = ciphertext.subarray(0, -tagLength);
				const passedTag = ciphertext.subarray(-tagLength);
				const tag = computeTag(xorStream, key, nonce, data, AAD);
				if (!(0, utils_ts_1.equalBytes)(passedTag, tag)) throw new Error("invalid tag");
				output.set(ciphertext.subarray(0, -tagLength));
				xorStream(key, nonce, output, output, 1);
				(0, utils_ts_1.clean)(tag);
				return output;
			}
		};
	};
	exports._poly1305_aead = _poly1305_aead;
	/**
	* ChaCha20-Poly1305 from RFC 8439.
	*
	* Unsafe to use random nonces under the same key, due to collision chance.
	* Prefer XChaCha instead.
	*/
	exports.chacha20poly1305 = (0, utils_ts_1.wrapCipher)({
		blockSize: 64,
		nonceLength: 12,
		tagLength: 16
	}, (0, exports._poly1305_aead)(exports.chacha20));
	/**
	* XChaCha20-Poly1305 extended-nonce chacha.
	*
	* Can be safely used with random nonces (CSPRNG).
	* See [IRTF draft](https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-xchacha).
	*/
	exports.xchacha20poly1305 = (0, utils_ts_1.wrapCipher)({
		blockSize: 64,
		nonceLength: 24,
		tagLength: 16
	}, (0, exports._poly1305_aead)(exports.xchacha20));
}));
//#endregion
//#region node_modules/@cosmjs/crypto/build/xchacha20poly1305.js
var require_xchacha20poly1305 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Xchacha20poly1305Ietf = exports.xchacha20NonceLength = void 0;
	var chacha_js_1 = require_chacha();
	/**
	* Nonce length in bytes for all flavours of XChaCha20.
	*
	* @see https://libsodium.gitbook.io/doc/advanced/stream_ciphers/xchacha20#notes
	*/
	exports.xchacha20NonceLength = 24;
	var Xchacha20poly1305Ietf = class {
		static async encrypt(message, key, nonce) {
			return (0, chacha_js_1.xchacha20poly1305)(key, nonce, void 0).encrypt(message);
		}
		static async decrypt(ciphertext, key, nonce) {
			return (0, chacha_js_1.xchacha20poly1305)(key, nonce, void 0).decrypt(ciphertext);
		}
	};
	exports.Xchacha20poly1305Ietf = Xchacha20poly1305Ietf;
}));
//#endregion
//#region node_modules/@cosmjs/crypto/build/index.js
var require_build$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Xchacha20poly1305Ietf = exports.xchacha20NonceLength = exports.stringToPath = exports.Slip10RawIndex = exports.slip10CurveFromString = exports.Slip10Curve = exports.Slip10 = exports.pathToString = exports.sha512 = exports.Sha512 = exports.sha256 = exports.Sha256 = exports.Secp256k1Signature = exports.ExtendedSecp256k1Signature = exports.Secp256k1 = exports.ripemd160 = exports.Ripemd160 = exports.Random = exports.keccak256 = exports.Keccak256 = exports.Hmac = exports.Ed25519Keypair = exports.Ed25519 = exports.EnglishMnemonic = exports.Bip39 = exports.isArgon2idOptions = exports.Argon2id = void 0;
	var argon2_1 = require_argon2();
	Object.defineProperty(exports, "Argon2id", {
		enumerable: true,
		get: function() {
			return argon2_1.Argon2id;
		}
	});
	Object.defineProperty(exports, "isArgon2idOptions", {
		enumerable: true,
		get: function() {
			return argon2_1.isArgon2idOptions;
		}
	});
	var bip39_1 = require_bip39();
	Object.defineProperty(exports, "Bip39", {
		enumerable: true,
		get: function() {
			return bip39_1.Bip39;
		}
	});
	Object.defineProperty(exports, "EnglishMnemonic", {
		enumerable: true,
		get: function() {
			return bip39_1.EnglishMnemonic;
		}
	});
	var ed25519_1 = require_ed25519();
	Object.defineProperty(exports, "Ed25519", {
		enumerable: true,
		get: function() {
			return ed25519_1.Ed25519;
		}
	});
	Object.defineProperty(exports, "Ed25519Keypair", {
		enumerable: true,
		get: function() {
			return ed25519_1.Ed25519Keypair;
		}
	});
	var hmac_1 = require_hmac();
	Object.defineProperty(exports, "Hmac", {
		enumerable: true,
		get: function() {
			return hmac_1.Hmac;
		}
	});
	var keccak_1 = require_keccak();
	Object.defineProperty(exports, "Keccak256", {
		enumerable: true,
		get: function() {
			return keccak_1.Keccak256;
		}
	});
	Object.defineProperty(exports, "keccak256", {
		enumerable: true,
		get: function() {
			return keccak_1.keccak256;
		}
	});
	var random_1 = require_random();
	Object.defineProperty(exports, "Random", {
		enumerable: true,
		get: function() {
			return random_1.Random;
		}
	});
	var ripemd_1 = require_ripemd();
	Object.defineProperty(exports, "Ripemd160", {
		enumerable: true,
		get: function() {
			return ripemd_1.Ripemd160;
		}
	});
	Object.defineProperty(exports, "ripemd160", {
		enumerable: true,
		get: function() {
			return ripemd_1.ripemd160;
		}
	});
	var secp256k1_1 = require_secp256k1();
	Object.defineProperty(exports, "Secp256k1", {
		enumerable: true,
		get: function() {
			return secp256k1_1.Secp256k1;
		}
	});
	var secp256k1signature_1 = require_secp256k1signature();
	Object.defineProperty(exports, "ExtendedSecp256k1Signature", {
		enumerable: true,
		get: function() {
			return secp256k1signature_1.ExtendedSecp256k1Signature;
		}
	});
	Object.defineProperty(exports, "Secp256k1Signature", {
		enumerable: true,
		get: function() {
			return secp256k1signature_1.Secp256k1Signature;
		}
	});
	var sha_1 = require_sha();
	Object.defineProperty(exports, "Sha256", {
		enumerable: true,
		get: function() {
			return sha_1.Sha256;
		}
	});
	Object.defineProperty(exports, "sha256", {
		enumerable: true,
		get: function() {
			return sha_1.sha256;
		}
	});
	Object.defineProperty(exports, "Sha512", {
		enumerable: true,
		get: function() {
			return sha_1.Sha512;
		}
	});
	Object.defineProperty(exports, "sha512", {
		enumerable: true,
		get: function() {
			return sha_1.sha512;
		}
	});
	var slip10_1 = require_slip10();
	Object.defineProperty(exports, "pathToString", {
		enumerable: true,
		get: function() {
			return slip10_1.pathToString;
		}
	});
	Object.defineProperty(exports, "Slip10", {
		enumerable: true,
		get: function() {
			return slip10_1.Slip10;
		}
	});
	Object.defineProperty(exports, "Slip10Curve", {
		enumerable: true,
		get: function() {
			return slip10_1.Slip10Curve;
		}
	});
	Object.defineProperty(exports, "slip10CurveFromString", {
		enumerable: true,
		get: function() {
			return slip10_1.slip10CurveFromString;
		}
	});
	Object.defineProperty(exports, "Slip10RawIndex", {
		enumerable: true,
		get: function() {
			return slip10_1.Slip10RawIndex;
		}
	});
	Object.defineProperty(exports, "stringToPath", {
		enumerable: true,
		get: function() {
			return slip10_1.stringToPath;
		}
	});
	var xchacha20poly1305_1 = require_xchacha20poly1305();
	Object.defineProperty(exports, "xchacha20NonceLength", {
		enumerable: true,
		get: function() {
			return xchacha20poly1305_1.xchacha20NonceLength;
		}
	});
	Object.defineProperty(exports, "Xchacha20poly1305Ietf", {
		enumerable: true,
		get: function() {
			return xchacha20poly1305_1.Xchacha20poly1305Ietf;
		}
	});
}));
//#endregion
//#region node_modules/@cosmjs/amino/build/pubkeys.js
var require_pubkeys = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.pubkeyType = void 0;
	exports.isEd25519Pubkey = isEd25519Pubkey;
	exports.isSecp256k1Pubkey = isSecp256k1Pubkey;
	exports.isEthSecp256k1Pubkey = isEthSecp256k1Pubkey;
	exports.isSinglePubkey = isSinglePubkey;
	exports.isMultisigThresholdPubkey = isMultisigThresholdPubkey;
	function isEd25519Pubkey(pubkey) {
		return pubkey.type === "tendermint/PubKeyEd25519";
	}
	function isSecp256k1Pubkey(pubkey) {
		return pubkey.type === "tendermint/PubKeySecp256k1";
	}
	function isEthSecp256k1Pubkey(pubkey) {
		return pubkey.type === "os/PubKeyEthSecp256k1";
	}
	exports.pubkeyType = {
		/** @see https://github.com/tendermint/tendermint/blob/v0.33.0/crypto/secp256k1/secp256k1.go#L23 */
		secp256k1: "tendermint/PubKeySecp256k1",
		/** @see https://github.com/cosmos/evm/blob/v1.0.0-rc2/crypto/ethsecp256k1/ethsecp256k1.go#L35-L36 */
		ethsecp256k1: "os/PubKeyEthSecp256k1",
		/** @see https://github.com/tendermint/tendermint/blob/v0.33.0/crypto/ed25519/ed25519.go#L22 */
		ed25519: "tendermint/PubKeyEd25519",
		/** @see https://github.com/tendermint/tendermint/blob/v0.33.0/crypto/sr25519/codec.go#L12 */
		sr25519: "tendermint/PubKeySr25519",
		multisigThreshold: "tendermint/PubKeyMultisigThreshold"
	};
	function isSinglePubkey(pubkey) {
		return [
			exports.pubkeyType.ed25519,
			exports.pubkeyType.secp256k1,
			exports.pubkeyType.ethsecp256k1,
			exports.pubkeyType.sr25519
		].includes(pubkey.type);
	}
	function isMultisigThresholdPubkey(pubkey) {
		return pubkey.type === "tendermint/PubKeyMultisigThreshold";
	}
}));
//#endregion
//#region node_modules/@cosmjs/amino/build/encoding.js
var require_encoding = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.encodeSecp256k1Pubkey = encodeSecp256k1Pubkey;
	exports.encodeEd25519Pubkey = encodeEd25519Pubkey;
	exports.encodeEthSecp256k1Pubkey = encodeEthSecp256k1Pubkey;
	exports.decodeAminoPubkey = decodeAminoPubkey;
	exports.decodeBech32Pubkey = decodeBech32Pubkey;
	exports.encodeAminoPubkey = encodeAminoPubkey;
	exports.encodeBech32Pubkey = encodeBech32Pubkey;
	var encoding_1 = require_build$4();
	var math_1 = require_build$3();
	var utils_1 = require_build$5();
	var pubkeys_1 = require_pubkeys();
	/**
	* Takes a Secp256k1 public key as raw bytes and returns the Amino JSON
	* representation of it (the type/value wrapper object).
	*/
	function encodeSecp256k1Pubkey(pubkey) {
		if (pubkey.length !== 33 || pubkey[0] !== 2 && pubkey[0] !== 3) throw new Error("Public key must be compressed secp256k1, i.e. 33 bytes starting with 0x02 or 0x03");
		return {
			type: pubkeys_1.pubkeyType.secp256k1,
			value: (0, encoding_1.toBase64)(pubkey)
		};
	}
	/**
	* Takes an Ed25519 public key as raw bytes and returns the Amino JSON
	* representation of it (the type/value wrapper object).
	*/
	function encodeEd25519Pubkey(pubkey) {
		if (pubkey.length !== 32) throw new Error("Ed25519 public key must be 32 bytes long");
		return {
			type: pubkeys_1.pubkeyType.ed25519,
			value: (0, encoding_1.toBase64)(pubkey)
		};
	}
	/**
	* Takes a EthSecp256k1 public key as raw bytes and returns the Amino JSON
	* representation of it (the type/value wrapper object).
	*/
	function encodeEthSecp256k1Pubkey(pubkey) {
		if (pubkey.length !== 33 || pubkey[0] !== 2 && pubkey[0] !== 3) throw new Error("Public key must be compressed secp256k1, i.e. 33 bytes starting with 0x02 or 0x03");
		return {
			type: pubkeys_1.pubkeyType.ethsecp256k1,
			value: (0, encoding_1.toBase64)(pubkey)
		};
	}
	var pubkeyAminoPrefixSecp256k1 = (0, encoding_1.fromHex)("eb5ae98721");
	var pubkeyAminoPrefixEthSecp256k1 = (0, encoding_1.fromHex)("5D7423DF21");
	var pubkeyAminoPrefixEd25519 = (0, encoding_1.fromHex)("1624de6420");
	var pubkeyAminoPrefixSr25519 = (0, encoding_1.fromHex)("0dfb100520");
	/** See https://github.com/tendermint/tendermint/commit/38b401657e4ad7a7eeb3c30a3cbf512037df3740 */
	var pubkeyAminoPrefixMultisigThreshold = (0, encoding_1.fromHex)("22c1f7e2");
	/**
	* Decodes a pubkey in the Amino binary format to a type/value object.
	*/
	function decodeAminoPubkey(data) {
		if ((0, utils_1.arrayContentStartsWith)(data, pubkeyAminoPrefixSecp256k1)) {
			const rest = data.slice(pubkeyAminoPrefixSecp256k1.length);
			if (rest.length !== 33) throw new Error("Invalid rest data length. Expected 33 bytes (compressed secp256k1 pubkey).");
			return {
				type: pubkeys_1.pubkeyType.secp256k1,
				value: (0, encoding_1.toBase64)(rest)
			};
		} else if ((0, utils_1.arrayContentStartsWith)(data, pubkeyAminoPrefixEd25519)) {
			const rest = data.slice(pubkeyAminoPrefixEd25519.length);
			if (rest.length !== 32) throw new Error("Invalid rest data length. Expected 32 bytes (Ed25519 pubkey).");
			return {
				type: pubkeys_1.pubkeyType.ed25519,
				value: (0, encoding_1.toBase64)(rest)
			};
		} else if ((0, utils_1.arrayContentStartsWith)(data, pubkeyAminoPrefixSr25519)) {
			const rest = data.slice(pubkeyAminoPrefixSr25519.length);
			if (rest.length !== 32) throw new Error("Invalid rest data length. Expected 32 bytes (Sr25519 pubkey).");
			return {
				type: pubkeys_1.pubkeyType.sr25519,
				value: (0, encoding_1.toBase64)(rest)
			};
		} else if ((0, utils_1.arrayContentStartsWith)(data, pubkeyAminoPrefixMultisigThreshold)) return decodeMultisigPubkey(data);
		else throw new Error("Unsupported public key type. Amino data starts with: " + (0, encoding_1.toHex)(data.slice(0, 5)));
	}
	/**
	* Decodes a bech32 pubkey to Amino binary, which is then decoded to a type/value object.
	* The bech32 prefix is ignored and discarded.
	*
	* @param bechEncoded the bech32 encoded pubkey
	*/
	function decodeBech32Pubkey(bechEncoded) {
		const { data } = (0, encoding_1.fromBech32)(bechEncoded);
		return decodeAminoPubkey(data);
	}
	/**
	* Uvarint decoder for Amino.
	* @see https://github.com/tendermint/go-amino/blob/8e779b71f40d175/decoder.go#L64-76
	* @returns varint as number, and bytes count occupied by varint
	*/
	function decodeUvarint(reader) {
		if (reader.length < 1) throw new Error("Can't decode varint. EOF");
		if (reader[0] > 127) throw new Error("Decoding numbers > 127 is not supported here. Please tell those lazy CosmJS maintainers to port the binary.Varint implementation from the Go standard library and write some tests.");
		return [reader[0], 1];
	}
	/**
	* Decodes a multisig pubkey to type object.
	* Pubkey structure [ prefix + const + threshold + loop:(const + pubkeyLength + pubkey            ) ]
	*                  [   4b   + 1b    +  varint   + loop:(1b    +    varint    + pubkeyLength bytes) ]
	* @param data encoded pubkey
	*/
	function decodeMultisigPubkey(data) {
		const reader = Array.from(data);
		const prefixFromReader = reader.splice(0, pubkeyAminoPrefixMultisigThreshold.length);
		if (!(0, utils_1.arrayContentStartsWith)(prefixFromReader, pubkeyAminoPrefixMultisigThreshold)) throw new Error("Invalid multisig prefix.");
		if (reader.shift() != 8) throw new Error("Invalid multisig data. Expecting 0x08 prefix before threshold.");
		const [threshold, thresholdBytesLength] = decodeUvarint(reader);
		reader.splice(0, thresholdBytesLength);
		const pubkeys = [];
		while (reader.length > 0) {
			if (reader.shift() != 18) throw new Error("Invalid multisig data. Expecting 0x12 prefix before participant pubkey length.");
			const [pubkeyLength, pubkeyLengthBytesSize] = decodeUvarint(reader);
			reader.splice(0, pubkeyLengthBytesSize);
			if (reader.length < pubkeyLength) throw new Error("Invalid multisig data length.");
			const encodedPubkey = reader.splice(0, pubkeyLength);
			const pubkey = decodeAminoPubkey(Uint8Array.from(encodedPubkey));
			pubkeys.push(pubkey);
		}
		return {
			type: pubkeys_1.pubkeyType.multisigThreshold,
			value: {
				threshold: threshold.toString(),
				pubkeys
			}
		};
	}
	/**
	* Uvarint encoder for Amino. This is the same encoding as `binary.PutUvarint` from the Go
	* standard library.
	*
	* @see https://github.com/tendermint/go-amino/blob/8e779b71f40d175/encoder.go#L77-L85
	*/
	function encodeUvarint(value) {
		const checked = math_1.Uint53.fromString(value.toString()).toNumber();
		if (checked > 127) throw new Error("Encoding numbers > 127 is not supported here. Please tell those lazy CosmJS maintainers to port the binary.PutUvarint implementation from the Go standard library and write some tests.");
		return [checked];
	}
	/**
	* Encodes a public key to binary Amino.
	*/
	function encodeAminoPubkey(pubkey) {
		if ((0, pubkeys_1.isMultisigThresholdPubkey)(pubkey)) {
			const out = Array.from(pubkeyAminoPrefixMultisigThreshold);
			out.push(8);
			out.push(...encodeUvarint(pubkey.value.threshold));
			for (const pubkeyData of pubkey.value.pubkeys.map((p) => encodeAminoPubkey(p))) {
				out.push(18);
				out.push(...encodeUvarint(pubkeyData.length));
				out.push(...pubkeyData);
			}
			return new Uint8Array(out);
		} else if ((0, pubkeys_1.isEd25519Pubkey)(pubkey)) return new Uint8Array([...pubkeyAminoPrefixEd25519, ...(0, encoding_1.fromBase64)(pubkey.value)]);
		else if ((0, pubkeys_1.isSecp256k1Pubkey)(pubkey)) return new Uint8Array([...pubkeyAminoPrefixSecp256k1, ...(0, encoding_1.fromBase64)(pubkey.value)]);
		else if ((0, pubkeys_1.isEthSecp256k1Pubkey)(pubkey)) return new Uint8Array([...pubkeyAminoPrefixEthSecp256k1, ...(0, encoding_1.fromBase64)(pubkey.value)]);
		else throw new Error("Unsupported pubkey type");
	}
	/**
	* Encodes a public key to binary Amino and then to bech32.
	*
	* @param pubkey the public key to encode
	* @param prefix the bech32 prefix (human readable part)
	*/
	function encodeBech32Pubkey(pubkey, prefix) {
		return (0, encoding_1.toBech32)(prefix, encodeAminoPubkey(pubkey));
	}
}));
//#endregion
//#region node_modules/@cosmjs/amino/build/addresses.js
var require_addresses = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.rawEd25519PubkeyToRawAddress = rawEd25519PubkeyToRawAddress;
	exports.rawSecp256k1PubkeyToRawAddress = rawSecp256k1PubkeyToRawAddress;
	exports.rawEthSecp256k1PubkeyToRawAddress = rawEthSecp256k1PubkeyToRawAddress;
	exports.pubkeyToRawAddress = pubkeyToRawAddress;
	exports.pubkeyToAddress = pubkeyToAddress;
	var crypto_1 = require_build$2();
	var encoding_1 = require_build$4();
	var encoding_2 = require_encoding();
	var pubkeys_1 = require_pubkeys();
	function rawEd25519PubkeyToRawAddress(pubkeyData) {
		if (pubkeyData.length !== 32) throw new Error(`Invalid Ed25519 pubkey length: ${pubkeyData.length}`);
		return (0, crypto_1.sha256)(pubkeyData).slice(0, 20);
	}
	function rawSecp256k1PubkeyToRawAddress(pubkeyData) {
		if (pubkeyData.length !== 33) throw new Error(`Invalid Secp256k1 pubkey length (compressed): ${pubkeyData.length}`);
		return (0, crypto_1.ripemd160)((0, crypto_1.sha256)(pubkeyData));
	}
	function rawEthSecp256k1PubkeyToRawAddress(pubkeyData) {
		if (pubkeyData.length !== 33) throw new Error(`Invalid Secp256k1 pubkey length (compressed): ${pubkeyData.length}`);
		const pubkeyWithoutPrefix = crypto_1.Secp256k1.uncompressPubkey(pubkeyData).slice(1);
		return (0, crypto_1.keccak256)(pubkeyWithoutPrefix).slice(-20);
	}
	function pubkeyToRawAddress(pubkey) {
		if ((0, pubkeys_1.isSecp256k1Pubkey)(pubkey)) return rawSecp256k1PubkeyToRawAddress((0, encoding_1.fromBase64)(pubkey.value));
		else if ((0, pubkeys_1.isEthSecp256k1Pubkey)(pubkey)) return rawEthSecp256k1PubkeyToRawAddress((0, encoding_1.fromBase64)(pubkey.value));
		else if ((0, pubkeys_1.isEd25519Pubkey)(pubkey)) return rawEd25519PubkeyToRawAddress((0, encoding_1.fromBase64)(pubkey.value));
		else if ((0, pubkeys_1.isMultisigThresholdPubkey)(pubkey)) {
			const pubkeyData = (0, encoding_2.encodeAminoPubkey)(pubkey);
			return (0, crypto_1.sha256)(pubkeyData).slice(0, 20);
		} else throw new Error("Unsupported public key type");
	}
	function pubkeyToAddress(pubkey, prefix) {
		return (0, encoding_1.toBech32)(prefix, pubkeyToRawAddress(pubkey));
	}
}));
//#endregion
//#region node_modules/@cosmjs/amino/build/coins.js
var require_coins = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.coin = coin;
	exports.coins = coins;
	exports.parseCoins = parseCoins;
	exports.addCoins = addCoins;
	var math_1 = require_build$3();
	/**
	* Creates a coin.
	*
	* If your values do not exceed the safe integer range of JS numbers (53 bit),
	* you can use the number type here. This is the case for all typical Cosmos SDK
	* chains that use the default 6 decimals.
	*
	* In case you need to support larger values, use unsigned integer strings instead.
	*/
	function coin(amount, denom) {
		let outAmount;
		if (typeof amount === "number") try {
			outAmount = new math_1.Uint53(amount).toString();
		} catch (_err) {
			throw new Error("Given amount is not a safe integer. Consider using a string instead to overcome the limitations of JS numbers.");
		}
		else {
			if (!amount.match(/^[0-9]+$/)) throw new Error("Invalid unsigned integer string format");
			outAmount = amount.replace(/^0*/, "") || "0";
		}
		return {
			amount: outAmount,
			denom
		};
	}
	/**
	* Creates a list of coins with one element.
	*/
	function coins(amount, denom) {
		return [coin(amount, denom)];
	}
	/**
	* Takes a coins list like "819966000ucosm,700000000ustake" and parses it.
	*
	* Starting with CosmJS 0.32.3, the following imports are all synonym and support
	* a variety of denom types such as IBC denoms or tokenfactory. If you need to
	* restrict the denom to something very minimal, this needs to be implemented
	* separately in the caller.
	*
	* ```
	* import { parseCoins } from "@cosmjs/proto-signing";
	* // equals
	* import { parseCoins } from "@cosmjs/stargate";
	* // equals
	* import { parseCoins } from "@cosmjs/amino";
	* ```
	*
	* This function is not made for supporting decimal amounts and does not support
	* parsing gas prices.
	*/
	function parseCoins(input) {
		return input.replace(/\s/g, "").split(",").filter(Boolean).map((part) => {
			const match = part.match(/^([0-9]+)([a-zA-Z][a-zA-Z0-9/:._-]{2,127})$/);
			if (!match) throw new Error("Got an invalid coin string");
			return {
				amount: match[1].replace(/^0+/, "") || "0",
				denom: match[2]
			};
		});
	}
	/**
	* Function to sum up coins with type Coin
	*/
	function addCoins(lhs, rhs) {
		if (lhs.denom !== rhs.denom) throw new Error("Trying to add two coins with different denoms");
		return {
			amount: math_1.Decimal.fromAtomics(lhs.amount, 0).plus(math_1.Decimal.fromAtomics(rhs.amount, 0)).atomics,
			denom: lhs.denom
		};
	}
}));
//#endregion
//#region node_modules/@cosmjs/amino/build/multisig.js
var require_multisig = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.compareArrays = compareArrays;
	exports.createMultisigThresholdPubkey = createMultisigThresholdPubkey;
	var encoding_1 = require_build$4();
	var math_1 = require_build$3();
	var addresses_1 = require_addresses();
	/**
	* Compare arrays lexicographically.
	*
	* Returns value < 0 if `a < b`.
	* Returns value > 0 if `a > b`.
	* Returns 0 if `a === b`.
	*/
	function compareArrays(a, b) {
		const aHex = (0, encoding_1.toHex)(a);
		const bHex = (0, encoding_1.toHex)(b);
		return aHex === bHex ? 0 : aHex < bHex ? -1 : 1;
	}
	function createMultisigThresholdPubkey(pubkeys, threshold, nosort = false) {
		const uintThreshold = new math_1.Uint53(threshold);
		if (uintThreshold.toNumber() > pubkeys.length) throw new Error(`Threshold k = ${uintThreshold.toNumber()} exceeds number of keys n = ${pubkeys.length}`);
		const outPubkeys = nosort ? pubkeys : Array.from(pubkeys).sort((lhs, rhs) => {
			return compareArrays((0, addresses_1.pubkeyToRawAddress)(lhs), (0, addresses_1.pubkeyToRawAddress)(rhs));
		});
		return {
			type: "tendermint/PubKeyMultisigThreshold",
			value: {
				threshold: uintThreshold.toString(),
				pubkeys: outPubkeys
			}
		};
	}
}));
//#endregion
//#region node_modules/@cosmjs/amino/build/omitdefault.js
var require_omitdefault = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.omitDefault = omitDefault;
	/**
	* Returns the given input. If the input is the default value
	* of protobuf, undefined is returned. Use this when creating Amino JSON converters.
	*/
	function omitDefault(input) {
		switch (typeof input) {
			case "string": return input === "" ? void 0 : input;
			case "number": return input === 0 ? void 0 : input;
			case "bigint": return input === BigInt(0) ? void 0 : input;
			case "boolean": return !input ? void 0 : input;
			default: throw new Error(`Got unsupported type '${typeof input}'`);
		}
	}
}));
//#endregion
//#region node_modules/@cosmjs/amino/build/paths.js
var require_paths$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.makeCosmoshubPath = makeCosmoshubPath;
	var crypto_1 = require_build$2();
	/**
	* The Cosmos Hub derivation path in the form `m/44'/118'/0'/0/a`
	* with 0-based account index `a`.
	*/
	function makeCosmoshubPath(a) {
		return [
			crypto_1.Slip10RawIndex.hardened(44),
			crypto_1.Slip10RawIndex.hardened(118),
			crypto_1.Slip10RawIndex.hardened(0),
			crypto_1.Slip10RawIndex.normal(0),
			crypto_1.Slip10RawIndex.normal(a)
		];
	}
}));
//#endregion
//#region node_modules/@cosmjs/amino/build/signature.js
var require_signature = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.encodeSecp256k1Signature = encodeSecp256k1Signature;
	exports.encodeEthSecp256k1Signature = encodeEthSecp256k1Signature;
	exports.decodeSignature = decodeSignature;
	var encoding_1 = require_build$4();
	var encoding_2 = require_encoding();
	var pubkeys_1 = require_pubkeys();
	/**
	* Takes a binary pubkey and signature to create a signature object
	*
	* @param pubkey a compressed secp256k1 public key
	* @param signature a 64 byte fixed length representation of secp256k1 signature components r and s
	*/
	function encodeSecp256k1Signature(pubkey, signature) {
		if (signature.length !== 64) throw new Error("Signature must be 64 bytes long. Cosmos SDK uses a 2x32 byte fixed length encoding for the secp256k1 signature integers r and s.");
		return {
			pub_key: (0, encoding_2.encodeSecp256k1Pubkey)(pubkey),
			signature: (0, encoding_1.toBase64)(signature)
		};
	}
	/**
	* Takes a binary pubkey and signature to create a signature object
	*
	* @param pubkey a compressed secp256k1 public key
	* @param signature a 64 byte fixed length representation of secp256k1 signature components r and s
	*/
	function encodeEthSecp256k1Signature(pubkey, signature) {
		if (signature.length !== 64) throw new Error("Signature must be 64 bytes long. Cosmos SDK uses a 2x32 byte fixed length encoding for the secp256k1 signature integers r and s.");
		return {
			pub_key: (0, encoding_2.encodeEthSecp256k1Pubkey)(pubkey),
			signature: (0, encoding_1.toBase64)(signature)
		};
	}
	function decodeSignature(signature) {
		switch (signature.pub_key.type) {
			case pubkeys_1.pubkeyType.secp256k1: return {
				pubkey: (0, encoding_1.fromBase64)(signature.pub_key.value),
				signature: (0, encoding_1.fromBase64)(signature.signature)
			};
			case pubkeys_1.pubkeyType.ethsecp256k1: return {
				pubkey: (0, encoding_1.fromBase64)(signature.pub_key.value),
				signature: (0, encoding_1.fromBase64)(signature.signature)
			};
			default: throw new Error("Unsupported pubkey type");
		}
	}
}));
//#endregion
//#region node_modules/@cosmjs/amino/build/signdoc.js
var require_signdoc = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.sortedJsonStringify = sortedJsonStringify;
	exports.makeSignDoc = makeSignDoc;
	exports.escapeCharacters = escapeCharacters;
	exports.serializeSignDoc = serializeSignDoc;
	var encoding_1 = require_build$4();
	var math_1 = require_build$3();
	function sortedObject(obj) {
		if (typeof obj !== "object" || obj === null) return obj;
		if (Array.isArray(obj)) return obj.map(sortedObject);
		const sortedKeys = Object.keys(obj).sort();
		const result = {};
		sortedKeys.forEach((key) => {
			result[key] = sortedObject(obj[key]);
		});
		return result;
	}
	/** Returns a JSON string with objects sorted by key */
	function sortedJsonStringify(obj) {
		return JSON.stringify(sortedObject(obj));
	}
	function makeSignDoc(msgs, fee, chainId, memo, accountNumber, sequence, timeout_height) {
		return {
			chain_id: chainId,
			account_number: math_1.Uint53.fromString(accountNumber.toString()).toString(),
			sequence: math_1.Uint53.fromString(sequence.toString()).toString(),
			fee,
			msgs,
			memo: memo || "",
			...timeout_height && { timeout_height: timeout_height.toString() }
		};
	}
	/**
	* Takes a valid JSON document and performs the following escapings in string values:
	*
	* `&` -> `\u0026`
	* `<` -> `\u003c`
	* `>` -> `\u003e`
	*
	* Since those characters do not occur in other places of the JSON document, only
	* string values are affected.
	*
	* If the input is invalid JSON, the behaviour is undefined.
	*/
	function escapeCharacters(input) {
		return input.replace(/&/g, "\\u0026").replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
	}
	function serializeSignDoc(signDoc) {
		const serialized = escapeCharacters(sortedJsonStringify(signDoc));
		return (0, encoding_1.toUtf8)(serialized);
	}
}));
//#endregion
//#region node_modules/@cosmjs/amino/build/wallet.js
var require_wallet$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.supportedAlgorithms = exports.cosmjsSalt = void 0;
	exports.executeKdf = executeKdf;
	exports.encrypt = encrypt;
	exports.decrypt = decrypt;
	var crypto_1 = require_build$2();
	var encoding_1 = require_build$4();
	var utils_1 = require_build$5();
	/**
	* A fixed salt is chosen to archive a deterministic password to key derivation.
	* This reduces the scope of a potential rainbow attack to all CosmJS users.
	* Must be 16 bytes due to implementation limitations.
	*/
	exports.cosmjsSalt = (0, encoding_1.toAscii)("The CosmJS salt.");
	/**
	* @deprecated Wallet encryption support will be removed from CosmJS in a future version.
	*             If you actually use this, please comment at https://github.com/cosmos/cosmjs/issues/1796.
	*/
	async function executeKdf(password, configuration) {
		switch (configuration.algorithm) {
			case "argon2id": {
				const options = configuration.params;
				if (!(0, crypto_1.isArgon2idOptions)(options)) throw new Error("Invalid format of argon2id params");
				const screamTest = (0, utils_1.sleep)(options.opsLimit * 250);
				const result = await crypto_1.Argon2id.execute(password, exports.cosmjsSalt, options);
				await screamTest;
				return result;
			}
			default: throw new Error("Unsupported KDF algorithm");
		}
	}
	exports.supportedAlgorithms = { xchacha20poly1305Ietf: "xchacha20poly1305-ietf" };
	/**
	* @deprecated Wallet encryption support will be removed from CosmJS in a future version.
	*             If you actually use this, please comment at https://github.com/cosmos/cosmjs/issues/1796.
	*/
	async function encrypt(plaintext, encryptionKey, config) {
		switch (config.algorithm) {
			case exports.supportedAlgorithms.xchacha20poly1305Ietf: {
				const nonce = crypto_1.Random.getBytes(crypto_1.xchacha20NonceLength);
				return new Uint8Array([...nonce, ...await crypto_1.Xchacha20poly1305Ietf.encrypt(plaintext, encryptionKey, nonce)]);
			}
			default: throw new Error(`Unsupported encryption algorithm: '${config.algorithm}'`);
		}
	}
	/**
	* @deprecated Wallet encryption support will be removed from CosmJS in a future version.
	*             If you actually use this, please comment at https://github.com/cosmos/cosmjs/issues/1796.
	*/
	async function decrypt(ciphertext, encryptionKey, config) {
		switch (config.algorithm) {
			case exports.supportedAlgorithms.xchacha20poly1305Ietf: {
				const nonce = ciphertext.slice(0, crypto_1.xchacha20NonceLength);
				return crypto_1.Xchacha20poly1305Ietf.decrypt(ciphertext.slice(crypto_1.xchacha20NonceLength), encryptionKey, nonce);
			}
			default: throw new Error(`Unsupported encryption algorithm: '${config.algorithm}'`);
		}
	}
}));
//#endregion
//#region node_modules/@cosmjs/amino/build/secp256k1hdwallet.js
var require_secp256k1hdwallet = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Secp256k1HdWallet = void 0;
	exports.extractKdfConfiguration = extractKdfConfiguration;
	var crypto_1 = require_build$2();
	var encoding_1 = require_build$4();
	var utils_1 = require_build$5();
	var addresses_1 = require_addresses();
	var paths_1 = require_paths$1();
	var signature_1 = require_signature();
	var signdoc_1 = require_signdoc();
	var wallet_1 = require_wallet$1();
	var serializationTypeV1 = "secp256k1wallet-v1";
	/**
	* A KDF configuration that is not very strong but can be used on the main thread.
	* It takes about 1 second in Node.js 16.0.0 and should have similar runtimes in other modern Wasm hosts.
	*/
	var basicPasswordHashingOptions = {
		algorithm: "argon2id",
		params: {
			outputLength: 32,
			opsLimit: 24,
			memLimitKib: 12 * 1024
		}
	};
	function isDerivationJson(thing) {
		if (!(0, utils_1.isNonNullObject)(thing)) return false;
		if (typeof thing.hdPath !== "string") return false;
		if (typeof thing.prefix !== "string") return false;
		return true;
	}
	function extractKdfConfigurationV1(doc) {
		return doc.kdf;
	}
	function extractKdfConfiguration(serialization) {
		const root = JSON.parse(serialization);
		if (!(0, utils_1.isNonNullObject)(root)) throw new Error("Root document is not an object.");
		switch (root.type) {
			case serializationTypeV1: return extractKdfConfigurationV1(root);
			default: throw new Error("Unsupported serialization type");
		}
	}
	var defaultOptions = {
		bip39Password: "",
		hdPaths: [(0, paths_1.makeCosmoshubPath)(0)],
		prefix: "cosmos"
	};
	exports.Secp256k1HdWallet = class Secp256k1HdWallet {
		/**
		* Restores a wallet from the given BIP39 mnemonic.
		*
		* @param mnemonic Any valid English mnemonic.
		* @param options An optional `Secp256k1HdWalletOptions` object optionally containing a bip39Password, hdPaths, and prefix.
		*/
		static async fromMnemonic(mnemonic, options = {}) {
			const mnemonicChecked = new crypto_1.EnglishMnemonic(mnemonic);
			const seed = await crypto_1.Bip39.mnemonicToSeed(mnemonicChecked, options.bip39Password);
			return new Secp256k1HdWallet(mnemonicChecked, {
				...options,
				seed
			});
		}
		/**
		* Generates a new wallet with a BIP39 mnemonic of the given length.
		*
		* @param length The number of words in the mnemonic (12, 15, 18, 21 or 24).
		* @param options An optional `Secp256k1HdWalletOptions` object optionally containing a bip39Password, hdPaths, and prefix.
		*/
		static async generate(length = 12, options = {}) {
			const entropyLength = 4 * Math.floor(11 * length / 33);
			const entropy = crypto_1.Random.getBytes(entropyLength);
			const mnemonic = crypto_1.Bip39.encode(entropy);
			return Secp256k1HdWallet.fromMnemonic(mnemonic.toString(), options);
		}
		/**
		* Restores a wallet from an encrypted serialization.
		*
		* @param password The user provided password used to generate an encryption key via a KDF.
		*                 This is not normalized internally (see "Unicode normalization" to learn more).
		*
		* @deprecated Wallet encryption support will be removed from CosmJS in a future version.
		*             If you actually use this, please comment at https://github.com/cosmos/cosmjs/issues/1796.
		*/
		static async deserialize(serialization, password) {
			const root = JSON.parse(serialization);
			if (!(0, utils_1.isNonNullObject)(root)) throw new Error("Root document is not an object.");
			switch (root.type) {
				case serializationTypeV1: return Secp256k1HdWallet.deserializeTypeV1(serialization, password);
				default: throw new Error("Unsupported serialization type");
			}
		}
		/**
		* Restores a wallet from an encrypted serialization.
		*
		* This is an advanced alternative to calling `deserialize(serialization, password)` directly, which allows
		* you to offload the KDF execution to a non-UI thread (e.g. in a WebWorker).
		*
		* The caller is responsible for ensuring the key was derived with the given KDF configuration. This can be
		* done using `extractKdfConfiguration(serialization)` and `executeKdf(password, kdfConfiguration)` from this package.
		*
		* @deprecated Wallet encryption support will be removed from CosmJS in a future version.
		*             If you actually use this, please comment at https://github.com/cosmos/cosmjs/issues/1796.
		*/
		static async deserializeWithEncryptionKey(serialization, encryptionKey) {
			const root = JSON.parse(serialization);
			if (!(0, utils_1.isNonNullObject)(root)) throw new Error("Root document is not an object.");
			const untypedRoot = root;
			switch (untypedRoot.type) {
				case serializationTypeV1: {
					const decryptedBytes = await (0, wallet_1.decrypt)((0, encoding_1.fromBase64)(untypedRoot.data), encryptionKey, untypedRoot.encryption);
					const { mnemonic, accounts } = JSON.parse((0, encoding_1.fromUtf8)(decryptedBytes));
					(0, utils_1.assert)(typeof mnemonic === "string");
					if (!Array.isArray(accounts)) throw new Error("Property 'accounts' is not an array");
					if (!accounts.every((account) => isDerivationJson(account))) throw new Error("Account is not in the correct format.");
					const firstPrefix = accounts[0].prefix;
					if (!accounts.every(({ prefix }) => prefix === firstPrefix)) throw new Error("Accounts do not all have the same prefix");
					const hdPaths = accounts.map(({ hdPath }) => (0, crypto_1.stringToPath)(hdPath));
					return Secp256k1HdWallet.fromMnemonic(mnemonic, {
						hdPaths,
						prefix: firstPrefix
					});
				}
				default: throw new Error("Unsupported serialization type");
			}
		}
		static async deserializeTypeV1(serialization, password) {
			const root = JSON.parse(serialization);
			if (!(0, utils_1.isNonNullObject)(root)) throw new Error("Root document is not an object.");
			const encryptionKey = await (0, wallet_1.executeKdf)(password, root.kdf);
			return Secp256k1HdWallet.deserializeWithEncryptionKey(serialization, encryptionKey);
		}
		/** Base secret */
		secret;
		/** BIP39 seed */
		seed;
		/** Derivation instructions */
		accounts;
		constructor(mnemonic, options) {
			const hdPaths = options.hdPaths ?? defaultOptions.hdPaths;
			const prefix = options.prefix ?? defaultOptions.prefix;
			this.secret = mnemonic;
			this.seed = options.seed;
			this.accounts = hdPaths.map((hdPath) => ({
				hdPath,
				prefix
			}));
		}
		get mnemonic() {
			return this.secret.toString();
		}
		async getAccounts() {
			return this.getAccountsWithPrivkeys().map(({ algo, pubkey, address }) => ({
				algo,
				pubkey,
				address
			}));
		}
		async signAmino(signerAddress, signDoc) {
			const account = this.getAccountsWithPrivkeys().find(({ address }) => address === signerAddress);
			if (account === void 0) throw new Error(`Address ${signerAddress} not found in wallet`);
			const { privkey, pubkey } = account;
			const message = (0, crypto_1.sha256)((0, signdoc_1.serializeSignDoc)(signDoc));
			const signature = crypto_1.Secp256k1.createSignature(message, privkey);
			const signatureBytes = new Uint8Array([...signature.r(32), ...signature.s(32)]);
			return {
				signed: signDoc,
				signature: (0, signature_1.encodeSecp256k1Signature)(pubkey, signatureBytes)
			};
		}
		/**
		* Generates an encrypted serialization of this wallet.
		*
		* @param password The user provided password used to generate an encryption key via a KDF.
		*                 This is not normalized internally (see "Unicode normalization" to learn more).
		*
		* @deprecated Wallet encryption support will be removed from CosmJS in a future version.
		*             If you actually use this, please comment at https://github.com/cosmos/cosmjs/issues/1796.
		*/
		async serialize(password) {
			const kdfConfiguration = basicPasswordHashingOptions;
			const encryptionKey = await (0, wallet_1.executeKdf)(password, kdfConfiguration);
			return this.serializeWithEncryptionKey(encryptionKey, kdfConfiguration);
		}
		/**
		* Generates an encrypted serialization of this wallet.
		*
		* This is an advanced alternative to calling `serialize(password)` directly, which allows you to
		* offload the KDF execution to a non-UI thread (e.g. in a WebWorker).
		*
		* The caller is responsible for ensuring the key was derived with the given KDF options. If this
		* is not the case, the wallet cannot be restored with the original password.
		*
		* @deprecated Wallet encryption support will be removed from CosmJS in a future version.
		*             If you actually use this, please comment at https://github.com/cosmos/cosmjs/issues/1796.
		*/
		async serializeWithEncryptionKey(encryptionKey, kdfConfiguration) {
			const dataToEncrypt = {
				mnemonic: this.mnemonic,
				accounts: this.accounts.map(({ hdPath, prefix }) => ({
					hdPath: (0, crypto_1.pathToString)(hdPath),
					prefix
				}))
			};
			const dataToEncryptRaw = (0, encoding_1.toUtf8)(JSON.stringify(dataToEncrypt));
			const encryptionConfiguration = { algorithm: wallet_1.supportedAlgorithms.xchacha20poly1305Ietf };
			const encryptedData = await (0, wallet_1.encrypt)(dataToEncryptRaw, encryptionKey, encryptionConfiguration);
			const out = {
				type: serializationTypeV1,
				kdf: kdfConfiguration,
				encryption: encryptionConfiguration,
				data: (0, encoding_1.toBase64)(encryptedData)
			};
			return JSON.stringify(out);
		}
		getKeyPair(hdPath) {
			const { privkey } = crypto_1.Slip10.derivePath(crypto_1.Slip10Curve.Secp256k1, this.seed, hdPath);
			const { pubkey } = crypto_1.Secp256k1.makeKeypair(privkey);
			return {
				privkey,
				pubkey: crypto_1.Secp256k1.compressPubkey(pubkey)
			};
		}
		getAccountsWithPrivkeys() {
			return this.accounts.map(({ hdPath, prefix }) => {
				const { privkey, pubkey } = this.getKeyPair(hdPath);
				return {
					algo: "secp256k1",
					privkey,
					pubkey,
					address: (0, encoding_1.toBech32)(prefix, (0, addresses_1.rawSecp256k1PubkeyToRawAddress)(pubkey))
				};
			});
		}
	};
}));
//#endregion
//#region node_modules/@cosmjs/amino/build/secp256k1wallet.js
var require_secp256k1wallet = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Secp256k1Wallet = void 0;
	var crypto_1 = require_build$2();
	var encoding_1 = require_build$4();
	var addresses_1 = require_addresses();
	var signature_1 = require_signature();
	var signdoc_1 = require_signdoc();
	exports.Secp256k1Wallet = class Secp256k1Wallet {
		/**
		* Creates a Secp256k1Wallet from the given private key
		*
		* @param privkey The private key.
		* @param prefix The bech32 address prefix (human readable part). Defaults to "cosmos".
		*/
		static async fromKey(privkey, prefix = "cosmos") {
			const uncompressed = crypto_1.Secp256k1.makeKeypair(privkey).pubkey;
			return new Secp256k1Wallet(privkey, crypto_1.Secp256k1.compressPubkey(uncompressed), prefix);
		}
		pubkey;
		privkey;
		prefix;
		constructor(privkey, pubkey, prefix) {
			this.privkey = privkey;
			this.pubkey = pubkey;
			this.prefix = prefix;
		}
		get address() {
			return (0, encoding_1.toBech32)(this.prefix, (0, addresses_1.rawSecp256k1PubkeyToRawAddress)(this.pubkey));
		}
		async getAccounts() {
			return [{
				algo: "secp256k1",
				address: this.address,
				pubkey: this.pubkey
			}];
		}
		async signAmino(signerAddress, signDoc) {
			if (signerAddress !== this.address) throw new Error(`Address ${signerAddress} not found in wallet`);
			const message = new crypto_1.Sha256((0, signdoc_1.serializeSignDoc)(signDoc)).digest();
			const signature = crypto_1.Secp256k1.createSignature(message, this.privkey);
			const signatureBytes = new Uint8Array([...signature.r(32), ...signature.s(32)]);
			return {
				signed: signDoc,
				signature: (0, signature_1.encodeSecp256k1Signature)(this.pubkey, signatureBytes)
			};
		}
	};
}));
//#endregion
//#region node_modules/@cosmjs/amino/build/signerutils.js
var require_signerutils = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Utility functions for working with signer accounts and algorithm detection.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isEthereumSecp256k1Account = isEthereumSecp256k1Account;
	exports.getAminoPubkey = getAminoPubkey;
	var encoding_1 = require_encoding();
	/**
	* Checks if an account uses Ethereum secp256k1 keys by examining the algorithm name.
	*
	* Handle Ethereum secp256k1 keys with dual naming convention support:
	* Different wallets and chains report Ethereum key algorithms inconsistently:
	* - "eth_secp256k1" (with underscore) - de facto standard used by Keplr wallet, CosmJS, some Cosmos SDK chains
	* - "ethsecp256k1" (without underscore) - used by Evmos, Cronos, and other EVM-compatible chains
	* Both represent the same Ethereum-compatible secp256k1 keys that require keccak256 address derivation
	*
	* @param account The account data from a signer
	* @returns true if the account uses Ethereum secp256k1 keys, false otherwise
	*/
	function isEthereumSecp256k1Account(account) {
		return account.algo === "eth_secp256k1" || account.algo === "ethsecp256k1";
	}
	/**
	* Gets the correctly encoded amino pubkey for an account based on its algorithm.
	*
	* This utility automatically selects the appropriate encoding function based on whether
	* the account uses Ethereum secp256k1 keys or standard secp256k1 keys.
	*
	* @param account The account data from a signer
	* @returns The amino-encoded pubkey (EthSecp256k1Pubkey or Secp256k1Pubkey)
	*/
	function getAminoPubkey(account) {
		if (isEthereumSecp256k1Account(account)) return (0, encoding_1.encodeEthSecp256k1Pubkey)(account.pubkey);
		else return (0, encoding_1.encodeSecp256k1Pubkey)(account.pubkey);
	}
}));
//#endregion
//#region node_modules/@cosmjs/amino/build/stdtx.js
var require_stdtx = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isStdTx = isStdTx;
	exports.makeStdTx = makeStdTx;
	function isStdTx(txValue) {
		const { memo, msg, fee, signatures } = txValue;
		return typeof memo === "string" && Array.isArray(msg) && typeof fee === "object" && Array.isArray(signatures);
	}
	function makeStdTx(content, signatures) {
		return {
			msg: content.msgs,
			fee: content.fee,
			memo: content.memo,
			signatures: Array.isArray(signatures) ? signatures : [signatures]
		};
	}
}));
//#endregion
//#region node_modules/@cosmjs/amino/build/index.js
var require_build$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.executeKdf = exports.makeStdTx = exports.isStdTx = exports.isEthereumSecp256k1Account = exports.getAminoPubkey = exports.serializeSignDoc = exports.makeSignDoc = exports.encodeSecp256k1Signature = exports.encodeEthSecp256k1Signature = exports.decodeSignature = exports.Secp256k1Wallet = exports.Secp256k1HdWallet = exports.extractKdfConfiguration = exports.pubkeyType = exports.isSinglePubkey = exports.isSecp256k1Pubkey = exports.isMultisigThresholdPubkey = exports.isEthSecp256k1Pubkey = exports.isEd25519Pubkey = exports.makeCosmoshubPath = exports.omitDefault = exports.createMultisigThresholdPubkey = exports.encodeSecp256k1Pubkey = exports.encodeEthSecp256k1Pubkey = exports.encodeEd25519Pubkey = exports.encodeBech32Pubkey = exports.encodeAminoPubkey = exports.decodeBech32Pubkey = exports.decodeAminoPubkey = exports.parseCoins = exports.coins = exports.coin = exports.addCoins = exports.rawSecp256k1PubkeyToRawAddress = exports.rawEthSecp256k1PubkeyToRawAddress = exports.rawEd25519PubkeyToRawAddress = exports.pubkeyToRawAddress = exports.pubkeyToAddress = void 0;
	var addresses_1 = require_addresses();
	Object.defineProperty(exports, "pubkeyToAddress", {
		enumerable: true,
		get: function() {
			return addresses_1.pubkeyToAddress;
		}
	});
	Object.defineProperty(exports, "pubkeyToRawAddress", {
		enumerable: true,
		get: function() {
			return addresses_1.pubkeyToRawAddress;
		}
	});
	Object.defineProperty(exports, "rawEd25519PubkeyToRawAddress", {
		enumerable: true,
		get: function() {
			return addresses_1.rawEd25519PubkeyToRawAddress;
		}
	});
	Object.defineProperty(exports, "rawEthSecp256k1PubkeyToRawAddress", {
		enumerable: true,
		get: function() {
			return addresses_1.rawEthSecp256k1PubkeyToRawAddress;
		}
	});
	Object.defineProperty(exports, "rawSecp256k1PubkeyToRawAddress", {
		enumerable: true,
		get: function() {
			return addresses_1.rawSecp256k1PubkeyToRawAddress;
		}
	});
	var coins_1 = require_coins();
	Object.defineProperty(exports, "addCoins", {
		enumerable: true,
		get: function() {
			return coins_1.addCoins;
		}
	});
	Object.defineProperty(exports, "coin", {
		enumerable: true,
		get: function() {
			return coins_1.coin;
		}
	});
	Object.defineProperty(exports, "coins", {
		enumerable: true,
		get: function() {
			return coins_1.coins;
		}
	});
	Object.defineProperty(exports, "parseCoins", {
		enumerable: true,
		get: function() {
			return coins_1.parseCoins;
		}
	});
	var encoding_1 = require_encoding();
	Object.defineProperty(exports, "decodeAminoPubkey", {
		enumerable: true,
		get: function() {
			return encoding_1.decodeAminoPubkey;
		}
	});
	Object.defineProperty(exports, "decodeBech32Pubkey", {
		enumerable: true,
		get: function() {
			return encoding_1.decodeBech32Pubkey;
		}
	});
	Object.defineProperty(exports, "encodeAminoPubkey", {
		enumerable: true,
		get: function() {
			return encoding_1.encodeAminoPubkey;
		}
	});
	Object.defineProperty(exports, "encodeBech32Pubkey", {
		enumerable: true,
		get: function() {
			return encoding_1.encodeBech32Pubkey;
		}
	});
	Object.defineProperty(exports, "encodeEd25519Pubkey", {
		enumerable: true,
		get: function() {
			return encoding_1.encodeEd25519Pubkey;
		}
	});
	Object.defineProperty(exports, "encodeEthSecp256k1Pubkey", {
		enumerable: true,
		get: function() {
			return encoding_1.encodeEthSecp256k1Pubkey;
		}
	});
	Object.defineProperty(exports, "encodeSecp256k1Pubkey", {
		enumerable: true,
		get: function() {
			return encoding_1.encodeSecp256k1Pubkey;
		}
	});
	var multisig_1 = require_multisig();
	Object.defineProperty(exports, "createMultisigThresholdPubkey", {
		enumerable: true,
		get: function() {
			return multisig_1.createMultisigThresholdPubkey;
		}
	});
	var omitdefault_1 = require_omitdefault();
	Object.defineProperty(exports, "omitDefault", {
		enumerable: true,
		get: function() {
			return omitdefault_1.omitDefault;
		}
	});
	var paths_1 = require_paths$1();
	Object.defineProperty(exports, "makeCosmoshubPath", {
		enumerable: true,
		get: function() {
			return paths_1.makeCosmoshubPath;
		}
	});
	var pubkeys_1 = require_pubkeys();
	Object.defineProperty(exports, "isEd25519Pubkey", {
		enumerable: true,
		get: function() {
			return pubkeys_1.isEd25519Pubkey;
		}
	});
	Object.defineProperty(exports, "isEthSecp256k1Pubkey", {
		enumerable: true,
		get: function() {
			return pubkeys_1.isEthSecp256k1Pubkey;
		}
	});
	Object.defineProperty(exports, "isMultisigThresholdPubkey", {
		enumerable: true,
		get: function() {
			return pubkeys_1.isMultisigThresholdPubkey;
		}
	});
	Object.defineProperty(exports, "isSecp256k1Pubkey", {
		enumerable: true,
		get: function() {
			return pubkeys_1.isSecp256k1Pubkey;
		}
	});
	Object.defineProperty(exports, "isSinglePubkey", {
		enumerable: true,
		get: function() {
			return pubkeys_1.isSinglePubkey;
		}
	});
	Object.defineProperty(exports, "pubkeyType", {
		enumerable: true,
		get: function() {
			return pubkeys_1.pubkeyType;
		}
	});
	var secp256k1hdwallet_1 = require_secp256k1hdwallet();
	Object.defineProperty(exports, "extractKdfConfiguration", {
		enumerable: true,
		get: function() {
			return secp256k1hdwallet_1.extractKdfConfiguration;
		}
	});
	Object.defineProperty(exports, "Secp256k1HdWallet", {
		enumerable: true,
		get: function() {
			return secp256k1hdwallet_1.Secp256k1HdWallet;
		}
	});
	var secp256k1wallet_1 = require_secp256k1wallet();
	Object.defineProperty(exports, "Secp256k1Wallet", {
		enumerable: true,
		get: function() {
			return secp256k1wallet_1.Secp256k1Wallet;
		}
	});
	var signature_1 = require_signature();
	Object.defineProperty(exports, "decodeSignature", {
		enumerable: true,
		get: function() {
			return signature_1.decodeSignature;
		}
	});
	Object.defineProperty(exports, "encodeEthSecp256k1Signature", {
		enumerable: true,
		get: function() {
			return signature_1.encodeEthSecp256k1Signature;
		}
	});
	Object.defineProperty(exports, "encodeSecp256k1Signature", {
		enumerable: true,
		get: function() {
			return signature_1.encodeSecp256k1Signature;
		}
	});
	var signdoc_1 = require_signdoc();
	Object.defineProperty(exports, "makeSignDoc", {
		enumerable: true,
		get: function() {
			return signdoc_1.makeSignDoc;
		}
	});
	Object.defineProperty(exports, "serializeSignDoc", {
		enumerable: true,
		get: function() {
			return signdoc_1.serializeSignDoc;
		}
	});
	var signerutils_1 = require_signerutils();
	Object.defineProperty(exports, "getAminoPubkey", {
		enumerable: true,
		get: function() {
			return signerutils_1.getAminoPubkey;
		}
	});
	Object.defineProperty(exports, "isEthereumSecp256k1Account", {
		enumerable: true,
		get: function() {
			return signerutils_1.isEthereumSecp256k1Account;
		}
	});
	var stdtx_1 = require_stdtx();
	Object.defineProperty(exports, "isStdTx", {
		enumerable: true,
		get: function() {
			return stdtx_1.isStdTx;
		}
	});
	Object.defineProperty(exports, "makeStdTx", {
		enumerable: true,
		get: function() {
			return stdtx_1.makeStdTx;
		}
	});
	var wallet_1 = require_wallet$1();
	Object.defineProperty(exports, "executeKdf", {
		enumerable: true,
		get: function() {
			return wallet_1.executeKdf;
		}
	});
}));
//#endregion
//#region node_modules/@cosmjs/proto-signing/build/signing.js
var require_signing = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.makeAuthInfoBytes = makeAuthInfoBytes;
	exports.makeSignDoc = makeSignDoc;
	exports.makeSignBytes = makeSignBytes;
	var encoding_1 = require_build$4();
	var utils_1 = require_build$5();
	var signing_1 = require_signing$1();
	var tx_1 = require_tx$2();
	/**
	* Create signer infos from the provided signers.
	*
	* This implementation does not support different signing modes for the different signers.
	*/
	function makeSignerInfos(signers, signMode) {
		return signers.map(({ pubkey, sequence }) => ({
			publicKey: pubkey,
			modeInfo: { single: { mode: signMode } },
			sequence: BigInt(sequence)
		}));
	}
	/**
	* Creates and serializes an AuthInfo document.
	*
	* This implementation does not support different signing modes for the different signers.
	*/
	function makeAuthInfoBytes(signers, feeAmount, gasLimit, feeGranter, feePayer, signMode = signing_1.SignMode.SIGN_MODE_DIRECT) {
		(0, utils_1.assert)(feeGranter === void 0 || typeof feeGranter === "string", "feeGranter must be undefined or string");
		(0, utils_1.assert)(feePayer === void 0 || typeof feePayer === "string", "feePayer must be undefined or string");
		const authInfo = tx_1.AuthInfo.fromPartial({
			signerInfos: makeSignerInfos(signers, signMode),
			fee: {
				amount: [...feeAmount],
				gasLimit: BigInt(gasLimit),
				granter: feeGranter,
				payer: feePayer
			}
		});
		return (0, encoding_1.fixUint8Array)(tx_1.AuthInfo.encode(authInfo).finish());
	}
	function makeSignDoc(bodyBytes, authInfoBytes, chainId, accountNumber) {
		return {
			bodyBytes,
			authInfoBytes,
			chainId,
			accountNumber: BigInt(accountNumber)
		};
	}
	function makeSignBytes({ accountNumber, authInfoBytes, bodyBytes, chainId }) {
		const signDoc = tx_1.SignDoc.fromPartial({
			accountNumber,
			authInfoBytes,
			bodyBytes,
			chainId
		});
		return (0, encoding_1.fixUint8Array)(tx_1.SignDoc.encode(signDoc).finish());
	}
}));
//#endregion
//#region node_modules/@cosmjs/proto-signing/build/directethsecp256k1hdwallet.js
var require_directethsecp256k1hdwallet = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DirectEthSecp256k1HdWallet = void 0;
	var amino_1 = require_build$1();
	var crypto_1 = require_build$2();
	var encoding_1 = require_build$4();
	var signing_1 = require_signing();
	var defaultOptions = {
		bip39Password: "",
		hdPaths: [[
			crypto_1.Slip10RawIndex.hardened(44),
			crypto_1.Slip10RawIndex.hardened(60),
			crypto_1.Slip10RawIndex.hardened(0),
			crypto_1.Slip10RawIndex.normal(0),
			crypto_1.Slip10RawIndex.normal(0)
		]],
		prefix: "cosmos"
	};
	exports.DirectEthSecp256k1HdWallet = class DirectEthSecp256k1HdWallet {
		/**
		* Restores a wallet from the given BIP39 mnemonic.
		*
		* @param mnemonic Any valid English mnemonic.
		* @param options An optional `DirectEthSecp256k1HdWalletOptions` object optionally containing a bip39Password, hdPaths, and prefix.
		*/
		static async fromMnemonic(mnemonic, options = {}) {
			const mnemonicChecked = new crypto_1.EnglishMnemonic(mnemonic);
			const seed = await crypto_1.Bip39.mnemonicToSeed(mnemonicChecked, options.bip39Password);
			return new DirectEthSecp256k1HdWallet(mnemonicChecked, {
				...options,
				seed
			});
		}
		/**
		* Generates a new wallet with a BIP39 mnemonic of the given length.
		*
		* @param length The number of words in the mnemonic (12, 15, 18, 21 or 24).
		* @param options An optional `DirectSecp256k1HdWalletOptions` object optionally containing a bip39Password, hdPaths, and prefix.
		*/
		static async generate(length = 12, options = {}) {
			const entropyLength = 4 * Math.floor(11 * length / 33);
			const entropy = crypto_1.Random.getBytes(entropyLength);
			const mnemonic = crypto_1.Bip39.encode(entropy);
			return DirectEthSecp256k1HdWallet.fromMnemonic(mnemonic.toString(), options);
		}
		/** Base secret */
		secret;
		/** BIP39 seed */
		seed;
		/** Derivation instructions */
		accounts;
		constructor(mnemonic, options) {
			const prefix = options.prefix ?? defaultOptions.prefix;
			const hdPaths = options.hdPaths ?? defaultOptions.hdPaths;
			this.secret = mnemonic;
			this.seed = options.seed;
			this.accounts = hdPaths.map((hdPath) => ({
				hdPath,
				prefix
			}));
		}
		get mnemonic() {
			return this.secret.toString();
		}
		async getAccounts() {
			return (await this.getAccountsWithPrivkeys()).map(({ algo, pubkey, address }) => ({
				algo,
				pubkey,
				address
			}));
		}
		async signDirect(signerAddress, signDoc) {
			const account = (await this.getAccountsWithPrivkeys()).find(({ address }) => address === signerAddress);
			if (account === void 0) throw new Error(`Address ${signerAddress} not found in wallet`);
			const { privkey, pubkey } = account;
			const signBytes = (0, signing_1.makeSignBytes)(signDoc);
			const hashedMessage = (0, crypto_1.keccak256)(signBytes);
			const signature = crypto_1.Secp256k1.createSignature(hashedMessage, privkey);
			const signatureBytes = new Uint8Array([...signature.r(32), ...signature.s(32)]);
			return {
				signed: signDoc,
				signature: (0, amino_1.encodeEthSecp256k1Signature)(pubkey, signatureBytes)
			};
		}
		async getKeyPair(hdPath) {
			const { privkey } = crypto_1.Slip10.derivePath(crypto_1.Slip10Curve.Secp256k1, this.seed, hdPath);
			const { pubkey } = crypto_1.Secp256k1.makeKeypair(privkey);
			return {
				privkey,
				pubkey: crypto_1.Secp256k1.compressPubkey(pubkey)
			};
		}
		async getAccountsWithPrivkeys() {
			return Promise.all(this.accounts.map(async ({ hdPath, prefix }) => {
				const { privkey, pubkey } = await this.getKeyPair(hdPath);
				return {
					algo: "eth_secp256k1",
					privkey,
					pubkey,
					address: (0, encoding_1.toBech32)(prefix, (0, amino_1.rawEthSecp256k1PubkeyToRawAddress)(pubkey))
				};
			}));
		}
	};
}));
//#endregion
//#region node_modules/@cosmjs/proto-signing/build/directethsecp256k1wallet.js
var require_directethsecp256k1wallet = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DirectEthSecp256k1Wallet = void 0;
	var amino_1 = require_build$1();
	var crypto_1 = require_build$2();
	var encoding_1 = require_build$4();
	var signing_1 = require_signing();
	exports.DirectEthSecp256k1Wallet = class DirectEthSecp256k1Wallet {
		/**
		* Creates a DirectSecp256k1Wallet from the given private key
		*
		* @param privkey The private key.
		* @param prefix The bech32 address prefix (human readable part). Defaults to "cosmos".
		*/
		static async fromKey(privkey, prefix = "cosmos") {
			const uncompressed = crypto_1.Secp256k1.makeKeypair(privkey).pubkey;
			return new DirectEthSecp256k1Wallet(privkey, crypto_1.Secp256k1.compressPubkey(uncompressed), prefix);
		}
		pubkey;
		privkey;
		prefix;
		constructor(privkey, pubkey, prefix) {
			this.privkey = privkey;
			this.pubkey = pubkey;
			this.prefix = prefix;
		}
		get address() {
			return (0, encoding_1.toBech32)(this.prefix, (0, amino_1.rawEthSecp256k1PubkeyToRawAddress)(this.pubkey));
		}
		async getAccounts() {
			return [{
				algo: "eth_secp256k1",
				address: this.address,
				pubkey: this.pubkey
			}];
		}
		async signDirect(address, signDoc) {
			const signBytes = (0, signing_1.makeSignBytes)(signDoc);
			if (address !== this.address) throw new Error(`Address ${address} not found in wallet`);
			const hashedMessage = (0, crypto_1.keccak256)(signBytes);
			const signature = crypto_1.Secp256k1.createSignature(hashedMessage, this.privkey);
			const signatureBytes = new Uint8Array([...signature.r(32), ...signature.s(32)]);
			return {
				signed: signDoc,
				signature: (0, amino_1.encodeEthSecp256k1Signature)(this.pubkey, signatureBytes)
			};
		}
	};
}));
//#endregion
//#region node_modules/@cosmjs/proto-signing/build/wallet.js
var require_wallet = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.supportedAlgorithms = exports.cosmjsSalt = void 0;
	exports.executeKdf = executeKdf;
	exports.encrypt = encrypt;
	exports.decrypt = decrypt;
	var crypto_1 = require_build$2();
	var encoding_1 = require_build$4();
	var utils_1 = require_build$5();
	/**
	* A fixed salt is chosen to archive a deterministic password to key derivation.
	* This reduces the scope of a potential rainbow attack to all CosmJS users.
	* Must be 16 bytes due to implementation limitations.
	*/
	exports.cosmjsSalt = (0, encoding_1.toAscii)("The CosmJS salt.");
	/**
	* @deprecated Wallet encryption support will be removed from CosmJS in a future version.
	*             If you actually use this, please comment at https://github.com/cosmos/cosmjs/issues/1796.
	*/
	async function executeKdf(password, configuration) {
		switch (configuration.algorithm) {
			case "argon2id": {
				const options = configuration.params;
				if (!(0, crypto_1.isArgon2idOptions)(options)) throw new Error("Invalid format of argon2id params");
				const screamTest = (0, utils_1.sleep)(options.opsLimit * 250);
				const result = await crypto_1.Argon2id.execute(password, exports.cosmjsSalt, options);
				await screamTest;
				return result;
			}
			default: throw new Error("Unsupported KDF algorithm");
		}
	}
	exports.supportedAlgorithms = { xchacha20poly1305Ietf: "xchacha20poly1305-ietf" };
	/**
	* @deprecated Wallet encryption support will be removed from CosmJS in a future version.
	*             If you actually use this, please comment at https://github.com/cosmos/cosmjs/issues/1796.
	*/
	async function encrypt(plaintext, encryptionKey, config) {
		switch (config.algorithm) {
			case exports.supportedAlgorithms.xchacha20poly1305Ietf: {
				const nonce = crypto_1.Random.getBytes(crypto_1.xchacha20NonceLength);
				return new Uint8Array([...nonce, ...await crypto_1.Xchacha20poly1305Ietf.encrypt(plaintext, encryptionKey, nonce)]);
			}
			default: throw new Error(`Unsupported encryption algorithm: '${config.algorithm}'`);
		}
	}
	/**
	* @deprecated Wallet encryption support will be removed from CosmJS in a future version.
	*             If you actually use this, please comment at https://github.com/cosmos/cosmjs/issues/1796.
	*/
	async function decrypt(ciphertext, encryptionKey, config) {
		switch (config.algorithm) {
			case exports.supportedAlgorithms.xchacha20poly1305Ietf: {
				const nonce = ciphertext.slice(0, crypto_1.xchacha20NonceLength);
				return crypto_1.Xchacha20poly1305Ietf.decrypt(ciphertext.slice(crypto_1.xchacha20NonceLength), encryptionKey, nonce);
			}
			default: throw new Error(`Unsupported encryption algorithm: '${config.algorithm}'`);
		}
	}
}));
//#endregion
//#region node_modules/@cosmjs/proto-signing/build/directsecp256k1hdwallet.js
var require_directsecp256k1hdwallet = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DirectSecp256k1HdWallet = void 0;
	exports.extractKdfConfiguration = extractKdfConfiguration;
	var amino_1 = require_build$1();
	var crypto_1 = require_build$2();
	var encoding_1 = require_build$4();
	var utils_1 = require_build$5();
	var signing_1 = require_signing();
	var wallet_1 = require_wallet();
	var serializationTypeV1 = "directsecp256k1hdwallet-v1";
	/**
	* A KDF configuration that is not very strong but can be used on the main thread.
	* It takes about 1 second in Node.js 16.0.0 and should have similar runtimes in other modern Wasm hosts.
	*/
	var basicPasswordHashingOptions = {
		algorithm: "argon2id",
		params: {
			outputLength: 32,
			opsLimit: 24,
			memLimitKib: 12 * 1024
		}
	};
	function isDerivationJson(thing) {
		if (!(0, utils_1.isNonNullObject)(thing)) return false;
		if (typeof thing.hdPath !== "string") return false;
		if (typeof thing.prefix !== "string") return false;
		return true;
	}
	function extractKdfConfigurationV1(doc) {
		return doc.kdf;
	}
	function extractKdfConfiguration(serialization) {
		const root = JSON.parse(serialization);
		if (!(0, utils_1.isNonNullObject)(root)) throw new Error("Root document is not an object.");
		switch (root.type) {
			case serializationTypeV1: return extractKdfConfigurationV1(root);
			default: throw new Error("Unsupported serialization type");
		}
	}
	var defaultOptions = {
		bip39Password: "",
		hdPaths: [(0, amino_1.makeCosmoshubPath)(0)],
		prefix: "cosmos"
	};
	exports.DirectSecp256k1HdWallet = class DirectSecp256k1HdWallet {
		/**
		* Restores a wallet from the given BIP39 mnemonic.
		*
		* @param mnemonic Any valid English mnemonic.
		* @param options An optional `DirectSecp256k1HdWalletOptions` object optionally containing a bip39Password, hdPaths, and prefix.
		*/
		static async fromMnemonic(mnemonic, options = {}) {
			const mnemonicChecked = new crypto_1.EnglishMnemonic(mnemonic);
			const seed = await crypto_1.Bip39.mnemonicToSeed(mnemonicChecked, options.bip39Password);
			return new DirectSecp256k1HdWallet(mnemonicChecked, {
				...options,
				seed
			});
		}
		/**
		* Generates a new wallet with a BIP39 mnemonic of the given length.
		*
		* @param length The number of words in the mnemonic (12, 15, 18, 21 or 24).
		* @param options An optional `DirectSecp256k1HdWalletOptions` object optionally containing a bip39Password, hdPaths, and prefix.
		*/
		static async generate(length = 12, options = {}) {
			const entropyLength = 4 * Math.floor(11 * length / 33);
			const entropy = crypto_1.Random.getBytes(entropyLength);
			const mnemonic = crypto_1.Bip39.encode(entropy);
			return DirectSecp256k1HdWallet.fromMnemonic(mnemonic.toString(), options);
		}
		/**
		* Restores a wallet from an encrypted serialization.
		*
		* @param password The user provided password used to generate an encryption key via a KDF.
		*                 This is not normalized internally (see "Unicode normalization" to learn more).
		*
		* @deprecated Wallet encryption support will be removed from CosmJS in a future version.
		*             If you actually use this, please comment at https://github.com/cosmos/cosmjs/issues/1796.
		*/
		static async deserialize(serialization, password) {
			const root = JSON.parse(serialization);
			if (!(0, utils_1.isNonNullObject)(root)) throw new Error("Root document is not an object.");
			switch (root.type) {
				case serializationTypeV1: return DirectSecp256k1HdWallet.deserializeTypeV1(serialization, password);
				default: throw new Error("Unsupported serialization type");
			}
		}
		/**
		* Restores a wallet from an encrypted serialization.
		*
		* This is an advanced alternative to calling `deserialize(serialization, password)` directly, which allows
		* you to offload the KDF execution to a non-UI thread (e.g. in a WebWorker).
		*
		* The caller is responsible for ensuring the key was derived with the given KDF configuration. This can be
		* done using `extractKdfConfiguration(serialization)` and `executeKdf(password, kdfConfiguration)` from this package.
		*
		* @deprecated Wallet encryption support will be removed from CosmJS in a future version.
		*             If you actually use this, please comment at https://github.com/cosmos/cosmjs/issues/1796.
		*/
		static async deserializeWithEncryptionKey(serialization, encryptionKey) {
			const root = JSON.parse(serialization);
			if (!(0, utils_1.isNonNullObject)(root)) throw new Error("Root document is not an object.");
			const untypedRoot = root;
			switch (untypedRoot.type) {
				case serializationTypeV1: {
					const decryptedBytes = await (0, wallet_1.decrypt)((0, encoding_1.fromBase64)(untypedRoot.data), encryptionKey, untypedRoot.encryption);
					const { mnemonic, accounts } = JSON.parse((0, encoding_1.fromUtf8)(decryptedBytes));
					(0, utils_1.assert)(typeof mnemonic === "string");
					if (!Array.isArray(accounts)) throw new Error("Property 'accounts' is not an array");
					if (!accounts.every((account) => isDerivationJson(account))) throw new Error("Account is not in the correct format.");
					const firstPrefix = accounts[0].prefix;
					if (!accounts.every(({ prefix }) => prefix === firstPrefix)) throw new Error("Accounts do not all have the same prefix");
					const hdPaths = accounts.map(({ hdPath }) => (0, crypto_1.stringToPath)(hdPath));
					return DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
						hdPaths,
						prefix: firstPrefix
					});
				}
				default: throw new Error("Unsupported serialization type");
			}
		}
		static async deserializeTypeV1(serialization, password) {
			const root = JSON.parse(serialization);
			if (!(0, utils_1.isNonNullObject)(root)) throw new Error("Root document is not an object.");
			const encryptionKey = await (0, wallet_1.executeKdf)(password, root.kdf);
			return DirectSecp256k1HdWallet.deserializeWithEncryptionKey(serialization, encryptionKey);
		}
		/** Base secret */
		secret;
		/** BIP39 seed */
		seed;
		/** Derivation instructions */
		accounts;
		constructor(mnemonic, options) {
			const prefix = options.prefix ?? defaultOptions.prefix;
			const hdPaths = options.hdPaths ?? defaultOptions.hdPaths;
			this.secret = mnemonic;
			this.seed = options.seed;
			this.accounts = hdPaths.map((hdPath) => ({
				hdPath,
				prefix
			}));
		}
		get mnemonic() {
			return this.secret.toString();
		}
		async getAccounts() {
			return this.getAccountsWithPrivkeys().map(({ algo, pubkey, address }) => ({
				algo,
				pubkey,
				address
			}));
		}
		async signDirect(signerAddress, signDoc) {
			const account = this.getAccountsWithPrivkeys().find(({ address }) => address === signerAddress);
			if (account === void 0) throw new Error(`Address ${signerAddress} not found in wallet`);
			const { privkey, pubkey } = account;
			const signBytes = (0, signing_1.makeSignBytes)(signDoc);
			const hashedMessage = (0, crypto_1.sha256)(signBytes);
			const signature = crypto_1.Secp256k1.createSignature(hashedMessage, privkey);
			const signatureBytes = new Uint8Array([...signature.r(32), ...signature.s(32)]);
			return {
				signed: signDoc,
				signature: (0, amino_1.encodeSecp256k1Signature)(pubkey, signatureBytes)
			};
		}
		/**
		* Generates an encrypted serialization of this wallet.
		*
		* @param password The user provided password used to generate an encryption key via a KDF.
		*                 This is not normalized internally (see "Unicode normalization" to learn more).
		*
		* @deprecated Wallet encryption support will be removed from CosmJS in a future version.
		*             If you actually use this, please comment at https://github.com/cosmos/cosmjs/issues/1796.
		*/
		async serialize(password) {
			const kdfConfiguration = basicPasswordHashingOptions;
			const encryptionKey = await (0, wallet_1.executeKdf)(password, kdfConfiguration);
			return this.serializeWithEncryptionKey(encryptionKey, kdfConfiguration);
		}
		/**
		* Generates an encrypted serialization of this wallet.
		*
		* This is an advanced alternative to calling `serialize(password)` directly, which allows you to
		* offload the KDF execution to a non-UI thread (e.g. in a WebWorker).
		*
		* The caller is responsible for ensuring the key was derived with the given KDF options. If this
		* is not the case, the wallet cannot be restored with the original password.
		*
		* @deprecated Wallet encryption support will be removed from CosmJS in a future version.
		*             If you actually use this, please comment at https://github.com/cosmos/cosmjs/issues/1796.
		*/
		async serializeWithEncryptionKey(encryptionKey, kdfConfiguration) {
			const dataToEncrypt = {
				mnemonic: this.mnemonic,
				accounts: this.accounts.map(({ hdPath, prefix }) => ({
					hdPath: (0, crypto_1.pathToString)(hdPath),
					prefix
				}))
			};
			const dataToEncryptRaw = (0, encoding_1.toUtf8)(JSON.stringify(dataToEncrypt));
			const encryptionConfiguration = { algorithm: wallet_1.supportedAlgorithms.xchacha20poly1305Ietf };
			const encryptedData = await (0, wallet_1.encrypt)(dataToEncryptRaw, encryptionKey, encryptionConfiguration);
			const out = {
				type: serializationTypeV1,
				kdf: kdfConfiguration,
				encryption: encryptionConfiguration,
				data: (0, encoding_1.toBase64)(encryptedData)
			};
			return JSON.stringify(out);
		}
		getKeyPair(hdPath) {
			const { privkey } = crypto_1.Slip10.derivePath(crypto_1.Slip10Curve.Secp256k1, this.seed, hdPath);
			const { pubkey } = crypto_1.Secp256k1.makeKeypair(privkey);
			return {
				privkey,
				pubkey: crypto_1.Secp256k1.compressPubkey(pubkey)
			};
		}
		getAccountsWithPrivkeys() {
			return this.accounts.map(({ hdPath, prefix }) => {
				const { privkey, pubkey } = this.getKeyPair(hdPath);
				return {
					algo: "secp256k1",
					privkey,
					pubkey,
					address: (0, encoding_1.toBech32)(prefix, (0, amino_1.rawSecp256k1PubkeyToRawAddress)(pubkey))
				};
			});
		}
	};
}));
//#endregion
//#region node_modules/@cosmjs/proto-signing/build/directsecp256k1wallet.js
var require_directsecp256k1wallet = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.DirectSecp256k1Wallet = void 0;
	var amino_1 = require_build$1();
	var crypto_1 = require_build$2();
	var encoding_1 = require_build$4();
	var signing_1 = require_signing();
	exports.DirectSecp256k1Wallet = class DirectSecp256k1Wallet {
		/**
		* Creates a DirectSecp256k1Wallet from the given private key
		*
		* @param privkey The private key.
		* @param prefix The bech32 address prefix (human readable part). Defaults to "cosmos".
		*/
		static async fromKey(privkey, prefix = "cosmos") {
			const uncompressed = crypto_1.Secp256k1.makeKeypair(privkey).pubkey;
			return new DirectSecp256k1Wallet(privkey, crypto_1.Secp256k1.compressPubkey(uncompressed), prefix);
		}
		pubkey;
		privkey;
		prefix;
		constructor(privkey, pubkey, prefix) {
			this.privkey = privkey;
			this.pubkey = pubkey;
			this.prefix = prefix;
		}
		get address() {
			return (0, encoding_1.toBech32)(this.prefix, (0, amino_1.rawSecp256k1PubkeyToRawAddress)(this.pubkey));
		}
		async getAccounts() {
			return [{
				algo: "secp256k1",
				address: this.address,
				pubkey: this.pubkey
			}];
		}
		async signDirect(address, signDoc) {
			const signBytes = (0, signing_1.makeSignBytes)(signDoc);
			if (address !== this.address) throw new Error(`Address ${address} not found in wallet`);
			const hashedMessage = (0, crypto_1.sha256)(signBytes);
			const signature = crypto_1.Secp256k1.createSignature(hashedMessage, this.privkey);
			const signatureBytes = new Uint8Array([...signature.r(32), ...signature.s(32)]);
			return {
				signed: signDoc,
				signature: (0, amino_1.encodeSecp256k1Signature)(this.pubkey, signatureBytes)
			};
		}
	};
}));
//#endregion
//#region node_modules/@cosmjs/proto-signing/build/paths.js
var require_paths = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.makeCosmoshubPath = makeCosmoshubPath;
	var crypto_1 = require_build$2();
	/**
	* The Cosmos Hub derivation path in the form `m/44'/118'/0'/0/a`
	* with 0-based account index `a`.
	*/
	function makeCosmoshubPath(a) {
		return [
			crypto_1.Slip10RawIndex.hardened(44),
			crypto_1.Slip10RawIndex.hardened(118),
			crypto_1.Slip10RawIndex.hardened(0),
			crypto_1.Slip10RawIndex.normal(0),
			crypto_1.Slip10RawIndex.normal(a)
		];
	}
}));
//#endregion
//#region node_modules/cosmjs-types/cosmos/crypto/ed25519/keys.js
var require_keys$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PrivKey = exports.PubKey = exports.protobufPackage = void 0;
	var binary_1 = require_binary();
	var helpers_1 = require_helpers();
	exports.protobufPackage = "cosmos.crypto.ed25519";
	function createBasePubKey() {
		return { key: new Uint8Array() };
	}
	exports.PubKey = {
		typeUrl: "/cosmos.crypto.ed25519.PubKey",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.key.length !== 0) writer.uint32(10).bytes(message.key);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBasePubKey();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.key = reader.bytes();
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBasePubKey();
			if ((0, helpers_1.isSet)(object.key)) obj.key = (0, helpers_1.bytesFromBase64)(object.key);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.key !== void 0 && (obj.key = (0, helpers_1.base64FromBytes)(message.key !== void 0 ? message.key : new Uint8Array()));
			return obj;
		},
		fromPartial(object) {
			const message = createBasePubKey();
			message.key = object.key ?? new Uint8Array();
			return message;
		}
	};
	function createBasePrivKey() {
		return { key: new Uint8Array() };
	}
	exports.PrivKey = {
		typeUrl: "/cosmos.crypto.ed25519.PrivKey",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.key.length !== 0) writer.uint32(10).bytes(message.key);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBasePrivKey();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.key = reader.bytes();
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBasePrivKey();
			if ((0, helpers_1.isSet)(object.key)) obj.key = (0, helpers_1.bytesFromBase64)(object.key);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.key !== void 0 && (obj.key = (0, helpers_1.base64FromBytes)(message.key !== void 0 ? message.key : new Uint8Array()));
			return obj;
		},
		fromPartial(object) {
			const message = createBasePrivKey();
			message.key = object.key ?? new Uint8Array();
			return message;
		}
	};
}));
//#endregion
//#region node_modules/cosmjs-types/cosmos/crypto/multisig/keys.js
var require_keys$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.LegacyAminoPubKey = exports.protobufPackage = void 0;
	var any_1 = require_any();
	var binary_1 = require_binary();
	var helpers_1 = require_helpers();
	exports.protobufPackage = "cosmos.crypto.multisig";
	function createBaseLegacyAminoPubKey() {
		return {
			threshold: 0,
			publicKeys: []
		};
	}
	exports.LegacyAminoPubKey = {
		typeUrl: "/cosmos.crypto.multisig.LegacyAminoPubKey",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.threshold !== 0) writer.uint32(8).uint32(message.threshold);
			for (const v of message.publicKeys) any_1.Any.encode(v, writer.uint32(18).fork()).ldelim();
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseLegacyAminoPubKey();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.threshold = reader.uint32();
						break;
					case 2:
						message.publicKeys.push(any_1.Any.decode(reader, reader.uint32()));
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseLegacyAminoPubKey();
			if ((0, helpers_1.isSet)(object.threshold)) obj.threshold = Number(object.threshold);
			if (Array.isArray(object?.publicKeys)) obj.publicKeys = object.publicKeys.map((e) => any_1.Any.fromJSON(e));
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.threshold !== void 0 && (obj.threshold = Math.round(message.threshold));
			if (message.publicKeys) obj.publicKeys = message.publicKeys.map((e) => e ? any_1.Any.toJSON(e) : void 0);
			else obj.publicKeys = [];
			return obj;
		},
		fromPartial(object) {
			const message = createBaseLegacyAminoPubKey();
			message.threshold = object.threshold ?? 0;
			message.publicKeys = object.publicKeys?.map((e) => any_1.Any.fromPartial(e)) || [];
			return message;
		}
	};
}));
//#endregion
//#region node_modules/cosmjs-types/cosmos/crypto/secp256k1/keys.js
var require_keys = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PrivKey = exports.PubKey = exports.protobufPackage = void 0;
	var binary_1 = require_binary();
	var helpers_1 = require_helpers();
	exports.protobufPackage = "cosmos.crypto.secp256k1";
	function createBasePubKey() {
		return { key: new Uint8Array() };
	}
	exports.PubKey = {
		typeUrl: "/cosmos.crypto.secp256k1.PubKey",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.key.length !== 0) writer.uint32(10).bytes(message.key);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBasePubKey();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.key = reader.bytes();
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBasePubKey();
			if ((0, helpers_1.isSet)(object.key)) obj.key = (0, helpers_1.bytesFromBase64)(object.key);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.key !== void 0 && (obj.key = (0, helpers_1.base64FromBytes)(message.key !== void 0 ? message.key : new Uint8Array()));
			return obj;
		},
		fromPartial(object) {
			const message = createBasePubKey();
			message.key = object.key ?? new Uint8Array();
			return message;
		}
	};
	function createBasePrivKey() {
		return { key: new Uint8Array() };
	}
	exports.PrivKey = {
		typeUrl: "/cosmos.crypto.secp256k1.PrivKey",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.key.length !== 0) writer.uint32(10).bytes(message.key);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBasePrivKey();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.key = reader.bytes();
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBasePrivKey();
			if ((0, helpers_1.isSet)(object.key)) obj.key = (0, helpers_1.bytesFromBase64)(object.key);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.key !== void 0 && (obj.key = (0, helpers_1.base64FromBytes)(message.key !== void 0 ? message.key : new Uint8Array()));
			return obj;
		},
		fromPartial(object) {
			const message = createBasePrivKey();
			message.key = object.key ?? new Uint8Array();
			return message;
		}
	};
}));
//#endregion
//#region node_modules/@cosmjs/proto-signing/build/pubkey.js
var require_pubkey = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.encodePubkey = encodePubkey;
	exports.anyToSinglePubkey = anyToSinglePubkey;
	exports.decodePubkey = decodePubkey;
	exports.decodeOptionalPubkey = decodeOptionalPubkey;
	var amino_1 = require_build$1();
	var encoding_1 = require_build$4();
	var math_1 = require_build$3();
	var keys_1 = require_keys$2();
	var keys_2 = require_keys$1();
	var keys_3 = require_keys();
	var any_1 = require_any();
	/**
	* Takes a pubkey in the Amino JSON object style (type/value wrapper)
	* and converts it into a protobuf `Any`.
	*
	* This is the reverse operation to `decodePubkey`.
	*/
	function encodePubkey(pubkey) {
		if ((0, amino_1.isSecp256k1Pubkey)(pubkey)) {
			const pubkeyProto = keys_3.PubKey.fromPartial({ key: (0, encoding_1.fromBase64)(pubkey.value) });
			return any_1.Any.fromPartial({
				typeUrl: "/cosmos.crypto.secp256k1.PubKey",
				value: Uint8Array.from(keys_3.PubKey.encode(pubkeyProto).finish())
			});
		} else if ((0, amino_1.isEthSecp256k1Pubkey)(pubkey)) {
			const pubkeyProto = keys_3.PubKey.fromPartial({ key: (0, encoding_1.fromBase64)(pubkey.value) });
			return any_1.Any.fromPartial({
				typeUrl: "/cosmos.evm.crypto.v1.ethsecp256k1.PubKey",
				value: Uint8Array.from(keys_3.PubKey.encode(pubkeyProto).finish())
			});
		} else if ((0, amino_1.isEd25519Pubkey)(pubkey)) {
			const pubkeyProto = keys_1.PubKey.fromPartial({ key: (0, encoding_1.fromBase64)(pubkey.value) });
			return any_1.Any.fromPartial({
				typeUrl: "/cosmos.crypto.ed25519.PubKey",
				value: Uint8Array.from(keys_1.PubKey.encode(pubkeyProto).finish())
			});
		} else if ((0, amino_1.isMultisigThresholdPubkey)(pubkey)) {
			const pubkeyProto = keys_2.LegacyAminoPubKey.fromPartial({
				threshold: math_1.Uint53.fromString(pubkey.value.threshold).toNumber(),
				publicKeys: pubkey.value.pubkeys.map(encodePubkey)
			});
			return any_1.Any.fromPartial({
				typeUrl: "/cosmos.crypto.multisig.LegacyAminoPubKey",
				value: Uint8Array.from(keys_2.LegacyAminoPubKey.encode(pubkeyProto).finish())
			});
		} else throw new Error(`Pubkey type ${pubkey.type} not recognized`);
	}
	/**
	* Decodes a single pubkey (i.e. not a multisig pubkey) from `Any` into
	* `SinglePubkey`.
	*
	* In most cases you probably want to use `decodePubkey`.
	*/
	function anyToSinglePubkey(pubkey) {
		switch (pubkey.typeUrl) {
			case "/cosmos.crypto.secp256k1.PubKey": {
				const { key } = keys_3.PubKey.decode(pubkey.value);
				return (0, amino_1.encodeSecp256k1Pubkey)(key);
			}
			case "/cosmos.evm.crypto.v1.ethsecp256k1.PubKey": {
				const { key } = keys_3.PubKey.decode(pubkey.value);
				return (0, amino_1.encodeEthSecp256k1Pubkey)(key);
			}
			case "/cosmos.crypto.ed25519.PubKey": {
				const { key } = keys_1.PubKey.decode(pubkey.value);
				return (0, amino_1.encodeEd25519Pubkey)(key);
			}
			default: throw new Error(`Pubkey type_url ${pubkey.typeUrl} not recognized as single public key type`);
		}
	}
	/**
	* Decodes a pubkey from a protobuf `Any` into `Pubkey`.
	* This supports single pubkeys such as Cosmos ed25519 and secp256k1 keys
	* as well as multisig threshold pubkeys.
	*/
	function decodePubkey(pubkey) {
		switch (pubkey.typeUrl) {
			case "/cosmos.crypto.secp256k1.PubKey":
			case "/cosmos.evm.crypto.v1.ethsecp256k1.PubKey":
			case "/cosmos.crypto.ed25519.PubKey": return anyToSinglePubkey(pubkey);
			case "/cosmos.crypto.multisig.LegacyAminoPubKey": {
				const { threshold, publicKeys } = keys_2.LegacyAminoPubKey.decode(pubkey.value);
				return {
					type: "tendermint/PubKeyMultisigThreshold",
					value: {
						threshold: threshold.toString(),
						pubkeys: publicKeys.map(anyToSinglePubkey)
					}
				};
			}
			default: throw new Error(`Pubkey type URL '${pubkey.typeUrl}' not recognized`);
		}
	}
	/**
	* Decodes an optional pubkey from a protobuf `Any` into `Pubkey | null`.
	* This supports single pubkeys such as Cosmos ed25519 and secp256k1 keys
	* as well as multisig threshold pubkeys.
	*/
	function decodeOptionalPubkey(pubkey) {
		if (!pubkey) return null;
		if (pubkey.typeUrl) if (pubkey.value.length) return decodePubkey(pubkey);
		else throw new Error(`Pubkey is an Any with type URL '${pubkey.typeUrl}' but an empty value`);
		else if (pubkey.value.length) throw new Error(`Pubkey is an Any with an empty type URL but a value set`);
		else return null;
	}
}));
//#endregion
//#region node_modules/cosmjs-types/cosmos/bank/v1beta1/bank.js
var require_bank = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Metadata = exports.DenomUnit = exports.Supply = exports.Output = exports.Input = exports.SendEnabled = exports.Params = exports.protobufPackage = void 0;
	var coin_1 = require_coin();
	var binary_1 = require_binary();
	var helpers_1 = require_helpers();
	exports.protobufPackage = "cosmos.bank.v1beta1";
	function createBaseParams() {
		return {
			sendEnabled: [],
			defaultSendEnabled: false
		};
	}
	exports.Params = {
		typeUrl: "/cosmos.bank.v1beta1.Params",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			for (const v of message.sendEnabled) exports.SendEnabled.encode(v, writer.uint32(10).fork()).ldelim();
			if (message.defaultSendEnabled === true) writer.uint32(16).bool(message.defaultSendEnabled);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseParams();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.sendEnabled.push(exports.SendEnabled.decode(reader, reader.uint32()));
						break;
					case 2:
						message.defaultSendEnabled = reader.bool();
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseParams();
			if (Array.isArray(object?.sendEnabled)) obj.sendEnabled = object.sendEnabled.map((e) => exports.SendEnabled.fromJSON(e));
			if ((0, helpers_1.isSet)(object.defaultSendEnabled)) obj.defaultSendEnabled = Boolean(object.defaultSendEnabled);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			if (message.sendEnabled) obj.sendEnabled = message.sendEnabled.map((e) => e ? exports.SendEnabled.toJSON(e) : void 0);
			else obj.sendEnabled = [];
			message.defaultSendEnabled !== void 0 && (obj.defaultSendEnabled = message.defaultSendEnabled);
			return obj;
		},
		fromPartial(object) {
			const message = createBaseParams();
			message.sendEnabled = object.sendEnabled?.map((e) => exports.SendEnabled.fromPartial(e)) || [];
			message.defaultSendEnabled = object.defaultSendEnabled ?? false;
			return message;
		}
	};
	function createBaseSendEnabled() {
		return {
			denom: "",
			enabled: false
		};
	}
	exports.SendEnabled = {
		typeUrl: "/cosmos.bank.v1beta1.SendEnabled",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.denom !== "") writer.uint32(10).string(message.denom);
			if (message.enabled === true) writer.uint32(16).bool(message.enabled);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseSendEnabled();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.denom = reader.string();
						break;
					case 2:
						message.enabled = reader.bool();
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseSendEnabled();
			if ((0, helpers_1.isSet)(object.denom)) obj.denom = String(object.denom);
			if ((0, helpers_1.isSet)(object.enabled)) obj.enabled = Boolean(object.enabled);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.denom !== void 0 && (obj.denom = message.denom);
			message.enabled !== void 0 && (obj.enabled = message.enabled);
			return obj;
		},
		fromPartial(object) {
			const message = createBaseSendEnabled();
			message.denom = object.denom ?? "";
			message.enabled = object.enabled ?? false;
			return message;
		}
	};
	function createBaseInput() {
		return {
			address: "",
			coins: []
		};
	}
	exports.Input = {
		typeUrl: "/cosmos.bank.v1beta1.Input",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.address !== "") writer.uint32(10).string(message.address);
			for (const v of message.coins) coin_1.Coin.encode(v, writer.uint32(18).fork()).ldelim();
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseInput();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.address = reader.string();
						break;
					case 2:
						message.coins.push(coin_1.Coin.decode(reader, reader.uint32()));
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseInput();
			if ((0, helpers_1.isSet)(object.address)) obj.address = String(object.address);
			if (Array.isArray(object?.coins)) obj.coins = object.coins.map((e) => coin_1.Coin.fromJSON(e));
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.address !== void 0 && (obj.address = message.address);
			if (message.coins) obj.coins = message.coins.map((e) => e ? coin_1.Coin.toJSON(e) : void 0);
			else obj.coins = [];
			return obj;
		},
		fromPartial(object) {
			const message = createBaseInput();
			message.address = object.address ?? "";
			message.coins = object.coins?.map((e) => coin_1.Coin.fromPartial(e)) || [];
			return message;
		}
	};
	function createBaseOutput() {
		return {
			address: "",
			coins: []
		};
	}
	exports.Output = {
		typeUrl: "/cosmos.bank.v1beta1.Output",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.address !== "") writer.uint32(10).string(message.address);
			for (const v of message.coins) coin_1.Coin.encode(v, writer.uint32(18).fork()).ldelim();
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseOutput();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.address = reader.string();
						break;
					case 2:
						message.coins.push(coin_1.Coin.decode(reader, reader.uint32()));
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseOutput();
			if ((0, helpers_1.isSet)(object.address)) obj.address = String(object.address);
			if (Array.isArray(object?.coins)) obj.coins = object.coins.map((e) => coin_1.Coin.fromJSON(e));
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.address !== void 0 && (obj.address = message.address);
			if (message.coins) obj.coins = message.coins.map((e) => e ? coin_1.Coin.toJSON(e) : void 0);
			else obj.coins = [];
			return obj;
		},
		fromPartial(object) {
			const message = createBaseOutput();
			message.address = object.address ?? "";
			message.coins = object.coins?.map((e) => coin_1.Coin.fromPartial(e)) || [];
			return message;
		}
	};
	function createBaseSupply() {
		return { total: [] };
	}
	exports.Supply = {
		typeUrl: "/cosmos.bank.v1beta1.Supply",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			for (const v of message.total) coin_1.Coin.encode(v, writer.uint32(10).fork()).ldelim();
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseSupply();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.total.push(coin_1.Coin.decode(reader, reader.uint32()));
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseSupply();
			if (Array.isArray(object?.total)) obj.total = object.total.map((e) => coin_1.Coin.fromJSON(e));
			return obj;
		},
		toJSON(message) {
			const obj = {};
			if (message.total) obj.total = message.total.map((e) => e ? coin_1.Coin.toJSON(e) : void 0);
			else obj.total = [];
			return obj;
		},
		fromPartial(object) {
			const message = createBaseSupply();
			message.total = object.total?.map((e) => coin_1.Coin.fromPartial(e)) || [];
			return message;
		}
	};
	function createBaseDenomUnit() {
		return {
			denom: "",
			exponent: 0,
			aliases: []
		};
	}
	exports.DenomUnit = {
		typeUrl: "/cosmos.bank.v1beta1.DenomUnit",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.denom !== "") writer.uint32(10).string(message.denom);
			if (message.exponent !== 0) writer.uint32(16).uint32(message.exponent);
			for (const v of message.aliases) writer.uint32(26).string(v);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseDenomUnit();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.denom = reader.string();
						break;
					case 2:
						message.exponent = reader.uint32();
						break;
					case 3:
						message.aliases.push(reader.string());
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseDenomUnit();
			if ((0, helpers_1.isSet)(object.denom)) obj.denom = String(object.denom);
			if ((0, helpers_1.isSet)(object.exponent)) obj.exponent = Number(object.exponent);
			if (Array.isArray(object?.aliases)) obj.aliases = object.aliases.map((e) => String(e));
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.denom !== void 0 && (obj.denom = message.denom);
			message.exponent !== void 0 && (obj.exponent = Math.round(message.exponent));
			if (message.aliases) obj.aliases = message.aliases.map((e) => e);
			else obj.aliases = [];
			return obj;
		},
		fromPartial(object) {
			const message = createBaseDenomUnit();
			message.denom = object.denom ?? "";
			message.exponent = object.exponent ?? 0;
			message.aliases = object.aliases?.map((e) => e) || [];
			return message;
		}
	};
	function createBaseMetadata() {
		return {
			description: "",
			denomUnits: [],
			base: "",
			display: "",
			name: "",
			symbol: "",
			uri: "",
			uriHash: ""
		};
	}
	exports.Metadata = {
		typeUrl: "/cosmos.bank.v1beta1.Metadata",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.description !== "") writer.uint32(10).string(message.description);
			for (const v of message.denomUnits) exports.DenomUnit.encode(v, writer.uint32(18).fork()).ldelim();
			if (message.base !== "") writer.uint32(26).string(message.base);
			if (message.display !== "") writer.uint32(34).string(message.display);
			if (message.name !== "") writer.uint32(42).string(message.name);
			if (message.symbol !== "") writer.uint32(50).string(message.symbol);
			if (message.uri !== "") writer.uint32(58).string(message.uri);
			if (message.uriHash !== "") writer.uint32(66).string(message.uriHash);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseMetadata();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.description = reader.string();
						break;
					case 2:
						message.denomUnits.push(exports.DenomUnit.decode(reader, reader.uint32()));
						break;
					case 3:
						message.base = reader.string();
						break;
					case 4:
						message.display = reader.string();
						break;
					case 5:
						message.name = reader.string();
						break;
					case 6:
						message.symbol = reader.string();
						break;
					case 7:
						message.uri = reader.string();
						break;
					case 8:
						message.uriHash = reader.string();
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseMetadata();
			if ((0, helpers_1.isSet)(object.description)) obj.description = String(object.description);
			if (Array.isArray(object?.denomUnits)) obj.denomUnits = object.denomUnits.map((e) => exports.DenomUnit.fromJSON(e));
			if ((0, helpers_1.isSet)(object.base)) obj.base = String(object.base);
			if ((0, helpers_1.isSet)(object.display)) obj.display = String(object.display);
			if ((0, helpers_1.isSet)(object.name)) obj.name = String(object.name);
			if ((0, helpers_1.isSet)(object.symbol)) obj.symbol = String(object.symbol);
			if ((0, helpers_1.isSet)(object.uri)) obj.uri = String(object.uri);
			if ((0, helpers_1.isSet)(object.uriHash)) obj.uriHash = String(object.uriHash);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.description !== void 0 && (obj.description = message.description);
			if (message.denomUnits) obj.denomUnits = message.denomUnits.map((e) => e ? exports.DenomUnit.toJSON(e) : void 0);
			else obj.denomUnits = [];
			message.base !== void 0 && (obj.base = message.base);
			message.display !== void 0 && (obj.display = message.display);
			message.name !== void 0 && (obj.name = message.name);
			message.symbol !== void 0 && (obj.symbol = message.symbol);
			message.uri !== void 0 && (obj.uri = message.uri);
			message.uriHash !== void 0 && (obj.uriHash = message.uriHash);
			return obj;
		},
		fromPartial(object) {
			const message = createBaseMetadata();
			message.description = object.description ?? "";
			message.denomUnits = object.denomUnits?.map((e) => exports.DenomUnit.fromPartial(e)) || [];
			message.base = object.base ?? "";
			message.display = object.display ?? "";
			message.name = object.name ?? "";
			message.symbol = object.symbol ?? "";
			message.uri = object.uri ?? "";
			message.uriHash = object.uriHash ?? "";
			return message;
		}
	};
}));
//#endregion
//#region node_modules/cosmjs-types/cosmos/bank/v1beta1/tx.js
var require_tx$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MsgClientImpl = exports.MsgSetSendEnabledResponse = exports.MsgSetSendEnabled = exports.MsgUpdateParamsResponse = exports.MsgUpdateParams = exports.MsgMultiSendResponse = exports.MsgMultiSend = exports.MsgSendResponse = exports.MsgSend = exports.protobufPackage = void 0;
	var coin_1 = require_coin();
	var bank_1 = require_bank();
	var binary_1 = require_binary();
	var helpers_1 = require_helpers();
	exports.protobufPackage = "cosmos.bank.v1beta1";
	function createBaseMsgSend() {
		return {
			fromAddress: "",
			toAddress: "",
			amount: []
		};
	}
	exports.MsgSend = {
		typeUrl: "/cosmos.bank.v1beta1.MsgSend",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.fromAddress !== "") writer.uint32(10).string(message.fromAddress);
			if (message.toAddress !== "") writer.uint32(18).string(message.toAddress);
			for (const v of message.amount) coin_1.Coin.encode(v, writer.uint32(26).fork()).ldelim();
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseMsgSend();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.fromAddress = reader.string();
						break;
					case 2:
						message.toAddress = reader.string();
						break;
					case 3:
						message.amount.push(coin_1.Coin.decode(reader, reader.uint32()));
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseMsgSend();
			if ((0, helpers_1.isSet)(object.fromAddress)) obj.fromAddress = String(object.fromAddress);
			if ((0, helpers_1.isSet)(object.toAddress)) obj.toAddress = String(object.toAddress);
			if (Array.isArray(object?.amount)) obj.amount = object.amount.map((e) => coin_1.Coin.fromJSON(e));
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.fromAddress !== void 0 && (obj.fromAddress = message.fromAddress);
			message.toAddress !== void 0 && (obj.toAddress = message.toAddress);
			if (message.amount) obj.amount = message.amount.map((e) => e ? coin_1.Coin.toJSON(e) : void 0);
			else obj.amount = [];
			return obj;
		},
		fromPartial(object) {
			const message = createBaseMsgSend();
			message.fromAddress = object.fromAddress ?? "";
			message.toAddress = object.toAddress ?? "";
			message.amount = object.amount?.map((e) => coin_1.Coin.fromPartial(e)) || [];
			return message;
		}
	};
	function createBaseMsgSendResponse() {
		return {};
	}
	exports.MsgSendResponse = {
		typeUrl: "/cosmos.bank.v1beta1.MsgSendResponse",
		encode(_, writer = binary_1.BinaryWriter.create()) {
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseMsgSendResponse();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(_) {
			return createBaseMsgSendResponse();
		},
		toJSON(_) {
			return {};
		},
		fromPartial(_) {
			return createBaseMsgSendResponse();
		}
	};
	function createBaseMsgMultiSend() {
		return {
			inputs: [],
			outputs: []
		};
	}
	exports.MsgMultiSend = {
		typeUrl: "/cosmos.bank.v1beta1.MsgMultiSend",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			for (const v of message.inputs) bank_1.Input.encode(v, writer.uint32(10).fork()).ldelim();
			for (const v of message.outputs) bank_1.Output.encode(v, writer.uint32(18).fork()).ldelim();
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseMsgMultiSend();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.inputs.push(bank_1.Input.decode(reader, reader.uint32()));
						break;
					case 2:
						message.outputs.push(bank_1.Output.decode(reader, reader.uint32()));
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseMsgMultiSend();
			if (Array.isArray(object?.inputs)) obj.inputs = object.inputs.map((e) => bank_1.Input.fromJSON(e));
			if (Array.isArray(object?.outputs)) obj.outputs = object.outputs.map((e) => bank_1.Output.fromJSON(e));
			return obj;
		},
		toJSON(message) {
			const obj = {};
			if (message.inputs) obj.inputs = message.inputs.map((e) => e ? bank_1.Input.toJSON(e) : void 0);
			else obj.inputs = [];
			if (message.outputs) obj.outputs = message.outputs.map((e) => e ? bank_1.Output.toJSON(e) : void 0);
			else obj.outputs = [];
			return obj;
		},
		fromPartial(object) {
			const message = createBaseMsgMultiSend();
			message.inputs = object.inputs?.map((e) => bank_1.Input.fromPartial(e)) || [];
			message.outputs = object.outputs?.map((e) => bank_1.Output.fromPartial(e)) || [];
			return message;
		}
	};
	function createBaseMsgMultiSendResponse() {
		return {};
	}
	exports.MsgMultiSendResponse = {
		typeUrl: "/cosmos.bank.v1beta1.MsgMultiSendResponse",
		encode(_, writer = binary_1.BinaryWriter.create()) {
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseMsgMultiSendResponse();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(_) {
			return createBaseMsgMultiSendResponse();
		},
		toJSON(_) {
			return {};
		},
		fromPartial(_) {
			return createBaseMsgMultiSendResponse();
		}
	};
	function createBaseMsgUpdateParams() {
		return {
			authority: "",
			params: bank_1.Params.fromPartial({})
		};
	}
	exports.MsgUpdateParams = {
		typeUrl: "/cosmos.bank.v1beta1.MsgUpdateParams",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.authority !== "") writer.uint32(10).string(message.authority);
			if (message.params !== void 0) bank_1.Params.encode(message.params, writer.uint32(18).fork()).ldelim();
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseMsgUpdateParams();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.authority = reader.string();
						break;
					case 2:
						message.params = bank_1.Params.decode(reader, reader.uint32());
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseMsgUpdateParams();
			if ((0, helpers_1.isSet)(object.authority)) obj.authority = String(object.authority);
			if ((0, helpers_1.isSet)(object.params)) obj.params = bank_1.Params.fromJSON(object.params);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.authority !== void 0 && (obj.authority = message.authority);
			message.params !== void 0 && (obj.params = message.params ? bank_1.Params.toJSON(message.params) : void 0);
			return obj;
		},
		fromPartial(object) {
			const message = createBaseMsgUpdateParams();
			message.authority = object.authority ?? "";
			if (object.params !== void 0 && object.params !== null) message.params = bank_1.Params.fromPartial(object.params);
			return message;
		}
	};
	function createBaseMsgUpdateParamsResponse() {
		return {};
	}
	exports.MsgUpdateParamsResponse = {
		typeUrl: "/cosmos.bank.v1beta1.MsgUpdateParamsResponse",
		encode(_, writer = binary_1.BinaryWriter.create()) {
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseMsgUpdateParamsResponse();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(_) {
			return createBaseMsgUpdateParamsResponse();
		},
		toJSON(_) {
			return {};
		},
		fromPartial(_) {
			return createBaseMsgUpdateParamsResponse();
		}
	};
	function createBaseMsgSetSendEnabled() {
		return {
			authority: "",
			sendEnabled: [],
			useDefaultFor: []
		};
	}
	exports.MsgSetSendEnabled = {
		typeUrl: "/cosmos.bank.v1beta1.MsgSetSendEnabled",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.authority !== "") writer.uint32(10).string(message.authority);
			for (const v of message.sendEnabled) bank_1.SendEnabled.encode(v, writer.uint32(18).fork()).ldelim();
			for (const v of message.useDefaultFor) writer.uint32(26).string(v);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseMsgSetSendEnabled();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.authority = reader.string();
						break;
					case 2:
						message.sendEnabled.push(bank_1.SendEnabled.decode(reader, reader.uint32()));
						break;
					case 3:
						message.useDefaultFor.push(reader.string());
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseMsgSetSendEnabled();
			if ((0, helpers_1.isSet)(object.authority)) obj.authority = String(object.authority);
			if (Array.isArray(object?.sendEnabled)) obj.sendEnabled = object.sendEnabled.map((e) => bank_1.SendEnabled.fromJSON(e));
			if (Array.isArray(object?.useDefaultFor)) obj.useDefaultFor = object.useDefaultFor.map((e) => String(e));
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.authority !== void 0 && (obj.authority = message.authority);
			if (message.sendEnabled) obj.sendEnabled = message.sendEnabled.map((e) => e ? bank_1.SendEnabled.toJSON(e) : void 0);
			else obj.sendEnabled = [];
			if (message.useDefaultFor) obj.useDefaultFor = message.useDefaultFor.map((e) => e);
			else obj.useDefaultFor = [];
			return obj;
		},
		fromPartial(object) {
			const message = createBaseMsgSetSendEnabled();
			message.authority = object.authority ?? "";
			message.sendEnabled = object.sendEnabled?.map((e) => bank_1.SendEnabled.fromPartial(e)) || [];
			message.useDefaultFor = object.useDefaultFor?.map((e) => e) || [];
			return message;
		}
	};
	function createBaseMsgSetSendEnabledResponse() {
		return {};
	}
	exports.MsgSetSendEnabledResponse = {
		typeUrl: "/cosmos.bank.v1beta1.MsgSetSendEnabledResponse",
		encode(_, writer = binary_1.BinaryWriter.create()) {
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseMsgSetSendEnabledResponse();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(_) {
			return createBaseMsgSetSendEnabledResponse();
		},
		toJSON(_) {
			return {};
		},
		fromPartial(_) {
			return createBaseMsgSetSendEnabledResponse();
		}
	};
	var MsgClientImpl = class {
		rpc;
		constructor(rpc) {
			this.rpc = rpc;
			this.Send = this.Send.bind(this);
			this.MultiSend = this.MultiSend.bind(this);
			this.UpdateParams = this.UpdateParams.bind(this);
			this.SetSendEnabled = this.SetSendEnabled.bind(this);
		}
		Send(request) {
			const data = exports.MsgSend.encode(request).finish();
			return this.rpc.request("cosmos.bank.v1beta1.Msg", "Send", data).then((data) => exports.MsgSendResponse.decode(new binary_1.BinaryReader(data)));
		}
		MultiSend(request) {
			const data = exports.MsgMultiSend.encode(request).finish();
			return this.rpc.request("cosmos.bank.v1beta1.Msg", "MultiSend", data).then((data) => exports.MsgMultiSendResponse.decode(new binary_1.BinaryReader(data)));
		}
		UpdateParams(request) {
			const data = exports.MsgUpdateParams.encode(request).finish();
			return this.rpc.request("cosmos.bank.v1beta1.Msg", "UpdateParams", data).then((data) => exports.MsgUpdateParamsResponse.decode(new binary_1.BinaryReader(data)));
		}
		SetSendEnabled(request) {
			const data = exports.MsgSetSendEnabled.encode(request).finish();
			return this.rpc.request("cosmos.bank.v1beta1.Msg", "SetSendEnabled", data).then((data) => exports.MsgSetSendEnabledResponse.decode(new binary_1.BinaryReader(data)));
		}
	};
	exports.MsgClientImpl = MsgClientImpl;
}));
//#endregion
//#region node_modules/@cosmjs/proto-signing/build/registry.js
var require_registry = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Registry = void 0;
	exports.hasFromPartial = hasFromPartial;
	exports.hasCreate = hasCreate;
	exports.isTxBodyEncodeObject = isTxBodyEncodeObject;
	var encoding_1 = require_build$4();
	var tx_1 = require_tx$1();
	var coin_1 = require_coin();
	var tx_2 = require_tx$2();
	var any_1 = require_any();
	function hasFromPartial(type) {
		return typeof type.fromPartial === "function";
	}
	function hasCreate(type) {
		return typeof type.create === "function";
	}
	var defaultTypeUrls = {
		cosmosCoin: "/cosmos.base.v1beta1.Coin",
		cosmosMsgSend: "/cosmos.bank.v1beta1.MsgSend",
		cosmosTxBody: "/cosmos.tx.v1beta1.TxBody",
		googleAny: "/google.protobuf.Any"
	};
	function isTxBodyEncodeObject(encodeObject) {
		return encodeObject.typeUrl === "/cosmos.tx.v1beta1.TxBody";
	}
	var Registry = class {
		types;
		/**
		* Creates a new Registry for mapping protobuf type identifiers/type URLs to
		* actual implementations. Those implementations are typically generated with ts-proto
		* but we also support protobuf.js as a type generator.
		*
		* If there is no parameter given, a `new Registry()` adds the types `Coin` and `MsgSend`
		* for historic reasons. Those can be overridden by customTypes.
		*
		* There are currently two methods for adding new types:
		* 1. Passing types to the constructor.
		* 2. Using the `register()` method
		*/
		constructor(customTypes) {
			const { cosmosCoin, cosmosMsgSend } = defaultTypeUrls;
			this.types = customTypes ? new Map([...customTypes]) : new Map([[cosmosCoin, coin_1.Coin], [cosmosMsgSend, tx_1.MsgSend]]);
		}
		register(typeUrl, type) {
			this.types.set(typeUrl, type);
		}
		/**
		* Looks up a type that was previously added to the registry.
		*
		* The generator information (ts-proto or pbjs) gets lost along the way.
		* If you need to work with the result type in TypeScript, you can use:
		*
		* ```
		* import { assert } from "@cosmjs/utils";
		*
		* const Coin = registry.lookupType("/cosmos.base.v1beta1.Coin");
		* assert(Coin); // Ensures not unset
		* assert(hasFromPartial(Coin)); // Ensures this is the type we expect
		*
		* // Coin is typed TsProtoGeneratedType now.
		* ```
		*/
		lookupType(typeUrl) {
			return this.types.get(typeUrl);
		}
		lookupTypeWithError(typeUrl) {
			const type = this.lookupType(typeUrl);
			if (!type) throw new Error(`Unregistered type url: ${typeUrl}`);
			return type;
		}
		/**
		* Takes a typeUrl/value pair and encodes the value to protobuf if
		* the given type was previously registered.
		*
		* If the value has to be wrapped in an Any, this needs to be done
		* manually after this call. Or use `encodeAsAny` instead.
		*/
		encode(encodeObject) {
			const { value, typeUrl } = encodeObject;
			if (isTxBodyEncodeObject(encodeObject)) return this.encodeTxBody(value);
			const type = this.lookupTypeWithError(typeUrl);
			const instance = hasFromPartial(type) ? type.fromPartial(value) : type.create(value);
			return (0, encoding_1.fixUint8Array)(type.encode(instance).finish());
		}
		/**
		* Takes a typeUrl/value pair and encodes the value to an Any if
		* the given type was previously registered.
		*/
		encodeAsAny(encodeObject) {
			const binaryValue = this.encode(encodeObject);
			return any_1.Any.fromPartial({
				typeUrl: encodeObject.typeUrl,
				value: binaryValue
			});
		}
		encodeTxBody(txBodyFields) {
			const wrappedMessages = txBodyFields.messages.map((message) => this.encodeAsAny(message));
			const txBody = tx_2.TxBody.fromPartial({
				...txBodyFields,
				timeoutHeight: BigInt(txBodyFields.timeoutHeight?.toString() ?? "0"),
				messages: wrappedMessages
			});
			return (0, encoding_1.fixUint8Array)(tx_2.TxBody.encode(txBody).finish());
		}
		decode({ typeUrl, value }) {
			if (typeUrl === defaultTypeUrls.cosmosTxBody) return this.decodeTxBody(value);
			const decoded = this.lookupTypeWithError(typeUrl).decode(value);
			Object.entries(decoded).forEach(([key, val]) => {
				if (typeof Buffer !== "undefined" && typeof Buffer.isBuffer !== "undefined" && Buffer.isBuffer(val)) decoded[key] = Uint8Array.from(val);
			});
			return decoded;
		}
		decodeTxBody(txBody) {
			const decodedTxBody = tx_2.TxBody.decode(txBody);
			return {
				...decodedTxBody,
				messages: decodedTxBody.messages.map(({ typeUrl, value }) => {
					if (!typeUrl) throw new Error("Missing type_url in Any");
					if (!value) throw new Error("Missing value in Any");
					return this.decode({
						typeUrl,
						value
					});
				})
			};
		}
	};
	exports.Registry = Registry;
}));
//#endregion
//#region node_modules/@cosmjs/proto-signing/build/signer.js
var require_signer = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isOfflineDirectSigner = isOfflineDirectSigner;
	function isOfflineDirectSigner(signer) {
		return signer.signDirect !== void 0;
	}
}));
//#endregion
//#region node_modules/@cosmjs/proto-signing/build/index.js
var require_build = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.parseCoins = exports.coins = exports.coin = exports.executeKdf = exports.makeSignDoc = exports.makeSignBytes = exports.makeAuthInfoBytes = exports.isOfflineDirectSigner = exports.Registry = exports.isTxBodyEncodeObject = exports.hasFromPartial = exports.hasCreate = exports.encodePubkey = exports.decodePubkey = exports.decodeOptionalPubkey = exports.anyToSinglePubkey = exports.makeCosmoshubPath = exports.DirectSecp256k1Wallet = exports.extractKdfConfiguration = exports.DirectSecp256k1HdWallet = exports.DirectEthSecp256k1Wallet = exports.DirectEthSecp256k1HdWallet = exports.decodeTxRaw = void 0;
	var decode_1 = require_decode();
	Object.defineProperty(exports, "decodeTxRaw", {
		enumerable: true,
		get: function() {
			return decode_1.decodeTxRaw;
		}
	});
	var directethsecp256k1hdwallet_1 = require_directethsecp256k1hdwallet();
	Object.defineProperty(exports, "DirectEthSecp256k1HdWallet", {
		enumerable: true,
		get: function() {
			return directethsecp256k1hdwallet_1.DirectEthSecp256k1HdWallet;
		}
	});
	var directethsecp256k1wallet_1 = require_directethsecp256k1wallet();
	Object.defineProperty(exports, "DirectEthSecp256k1Wallet", {
		enumerable: true,
		get: function() {
			return directethsecp256k1wallet_1.DirectEthSecp256k1Wallet;
		}
	});
	var directsecp256k1hdwallet_1 = require_directsecp256k1hdwallet();
	Object.defineProperty(exports, "DirectSecp256k1HdWallet", {
		enumerable: true,
		get: function() {
			return directsecp256k1hdwallet_1.DirectSecp256k1HdWallet;
		}
	});
	Object.defineProperty(exports, "extractKdfConfiguration", {
		enumerable: true,
		get: function() {
			return directsecp256k1hdwallet_1.extractKdfConfiguration;
		}
	});
	var directsecp256k1wallet_1 = require_directsecp256k1wallet();
	Object.defineProperty(exports, "DirectSecp256k1Wallet", {
		enumerable: true,
		get: function() {
			return directsecp256k1wallet_1.DirectSecp256k1Wallet;
		}
	});
	var paths_1 = require_paths();
	Object.defineProperty(exports, "makeCosmoshubPath", {
		enumerable: true,
		get: function() {
			return paths_1.makeCosmoshubPath;
		}
	});
	var pubkey_1 = require_pubkey();
	Object.defineProperty(exports, "anyToSinglePubkey", {
		enumerable: true,
		get: function() {
			return pubkey_1.anyToSinglePubkey;
		}
	});
	Object.defineProperty(exports, "decodeOptionalPubkey", {
		enumerable: true,
		get: function() {
			return pubkey_1.decodeOptionalPubkey;
		}
	});
	Object.defineProperty(exports, "decodePubkey", {
		enumerable: true,
		get: function() {
			return pubkey_1.decodePubkey;
		}
	});
	Object.defineProperty(exports, "encodePubkey", {
		enumerable: true,
		get: function() {
			return pubkey_1.encodePubkey;
		}
	});
	var registry_1 = require_registry();
	Object.defineProperty(exports, "hasCreate", {
		enumerable: true,
		get: function() {
			return registry_1.hasCreate;
		}
	});
	Object.defineProperty(exports, "hasFromPartial", {
		enumerable: true,
		get: function() {
			return registry_1.hasFromPartial;
		}
	});
	Object.defineProperty(exports, "isTxBodyEncodeObject", {
		enumerable: true,
		get: function() {
			return registry_1.isTxBodyEncodeObject;
		}
	});
	Object.defineProperty(exports, "Registry", {
		enumerable: true,
		get: function() {
			return registry_1.Registry;
		}
	});
	var signer_1 = require_signer();
	Object.defineProperty(exports, "isOfflineDirectSigner", {
		enumerable: true,
		get: function() {
			return signer_1.isOfflineDirectSigner;
		}
	});
	var signing_1 = require_signing();
	Object.defineProperty(exports, "makeAuthInfoBytes", {
		enumerable: true,
		get: function() {
			return signing_1.makeAuthInfoBytes;
		}
	});
	Object.defineProperty(exports, "makeSignBytes", {
		enumerable: true,
		get: function() {
			return signing_1.makeSignBytes;
		}
	});
	Object.defineProperty(exports, "makeSignDoc", {
		enumerable: true,
		get: function() {
			return signing_1.makeSignDoc;
		}
	});
	var wallet_1 = require_wallet();
	Object.defineProperty(exports, "executeKdf", {
		enumerable: true,
		get: function() {
			return wallet_1.executeKdf;
		}
	});
	var amino_1 = require_build$1();
	Object.defineProperty(exports, "coin", {
		enumerable: true,
		get: function() {
			return amino_1.coin;
		}
	});
	Object.defineProperty(exports, "coins", {
		enumerable: true,
		get: function() {
			return amino_1.coins;
		}
	});
	Object.defineProperty(exports, "parseCoins", {
		enumerable: true,
		get: function() {
			return amino_1.parseCoins;
		}
	});
}));
//#endregion
//#region node_modules/cosmjs-types/ibc/core/client/v1/client.js
var require_client = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Params = exports.Height = exports.ClientConsensusStates = exports.ConsensusStateWithHeight = exports.IdentifiedClientState = exports.protobufPackage = void 0;
	var any_1 = require_any();
	var binary_1 = require_binary();
	var helpers_1 = require_helpers();
	exports.protobufPackage = "ibc.core.client.v1";
	function createBaseIdentifiedClientState() {
		return {
			clientId: "",
			clientState: void 0
		};
	}
	exports.IdentifiedClientState = {
		typeUrl: "/ibc.core.client.v1.IdentifiedClientState",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.clientId !== "") writer.uint32(10).string(message.clientId);
			if (message.clientState !== void 0) any_1.Any.encode(message.clientState, writer.uint32(18).fork()).ldelim();
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseIdentifiedClientState();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.clientId = reader.string();
						break;
					case 2:
						message.clientState = any_1.Any.decode(reader, reader.uint32());
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseIdentifiedClientState();
			if ((0, helpers_1.isSet)(object.clientId)) obj.clientId = String(object.clientId);
			if ((0, helpers_1.isSet)(object.clientState)) obj.clientState = any_1.Any.fromJSON(object.clientState);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.clientId !== void 0 && (obj.clientId = message.clientId);
			message.clientState !== void 0 && (obj.clientState = message.clientState ? any_1.Any.toJSON(message.clientState) : void 0);
			return obj;
		},
		fromPartial(object) {
			const message = createBaseIdentifiedClientState();
			message.clientId = object.clientId ?? "";
			if (object.clientState !== void 0 && object.clientState !== null) message.clientState = any_1.Any.fromPartial(object.clientState);
			return message;
		}
	};
	function createBaseConsensusStateWithHeight() {
		return {
			height: exports.Height.fromPartial({}),
			consensusState: void 0
		};
	}
	exports.ConsensusStateWithHeight = {
		typeUrl: "/ibc.core.client.v1.ConsensusStateWithHeight",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.height !== void 0) exports.Height.encode(message.height, writer.uint32(10).fork()).ldelim();
			if (message.consensusState !== void 0) any_1.Any.encode(message.consensusState, writer.uint32(18).fork()).ldelim();
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseConsensusStateWithHeight();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.height = exports.Height.decode(reader, reader.uint32());
						break;
					case 2:
						message.consensusState = any_1.Any.decode(reader, reader.uint32());
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseConsensusStateWithHeight();
			if ((0, helpers_1.isSet)(object.height)) obj.height = exports.Height.fromJSON(object.height);
			if ((0, helpers_1.isSet)(object.consensusState)) obj.consensusState = any_1.Any.fromJSON(object.consensusState);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.height !== void 0 && (obj.height = message.height ? exports.Height.toJSON(message.height) : void 0);
			message.consensusState !== void 0 && (obj.consensusState = message.consensusState ? any_1.Any.toJSON(message.consensusState) : void 0);
			return obj;
		},
		fromPartial(object) {
			const message = createBaseConsensusStateWithHeight();
			if (object.height !== void 0 && object.height !== null) message.height = exports.Height.fromPartial(object.height);
			if (object.consensusState !== void 0 && object.consensusState !== null) message.consensusState = any_1.Any.fromPartial(object.consensusState);
			return message;
		}
	};
	function createBaseClientConsensusStates() {
		return {
			clientId: "",
			consensusStates: []
		};
	}
	exports.ClientConsensusStates = {
		typeUrl: "/ibc.core.client.v1.ClientConsensusStates",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.clientId !== "") writer.uint32(10).string(message.clientId);
			for (const v of message.consensusStates) exports.ConsensusStateWithHeight.encode(v, writer.uint32(18).fork()).ldelim();
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseClientConsensusStates();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.clientId = reader.string();
						break;
					case 2:
						message.consensusStates.push(exports.ConsensusStateWithHeight.decode(reader, reader.uint32()));
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseClientConsensusStates();
			if ((0, helpers_1.isSet)(object.clientId)) obj.clientId = String(object.clientId);
			if (Array.isArray(object?.consensusStates)) obj.consensusStates = object.consensusStates.map((e) => exports.ConsensusStateWithHeight.fromJSON(e));
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.clientId !== void 0 && (obj.clientId = message.clientId);
			if (message.consensusStates) obj.consensusStates = message.consensusStates.map((e) => e ? exports.ConsensusStateWithHeight.toJSON(e) : void 0);
			else obj.consensusStates = [];
			return obj;
		},
		fromPartial(object) {
			const message = createBaseClientConsensusStates();
			message.clientId = object.clientId ?? "";
			message.consensusStates = object.consensusStates?.map((e) => exports.ConsensusStateWithHeight.fromPartial(e)) || [];
			return message;
		}
	};
	function createBaseHeight() {
		return {
			revisionNumber: BigInt(0),
			revisionHeight: BigInt(0)
		};
	}
	exports.Height = {
		typeUrl: "/ibc.core.client.v1.Height",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.revisionNumber !== BigInt(0)) writer.uint32(8).uint64(message.revisionNumber);
			if (message.revisionHeight !== BigInt(0)) writer.uint32(16).uint64(message.revisionHeight);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseHeight();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.revisionNumber = reader.uint64();
						break;
					case 2:
						message.revisionHeight = reader.uint64();
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseHeight();
			if ((0, helpers_1.isSet)(object.revisionNumber)) obj.revisionNumber = BigInt(object.revisionNumber.toString());
			if ((0, helpers_1.isSet)(object.revisionHeight)) obj.revisionHeight = BigInt(object.revisionHeight.toString());
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.revisionNumber !== void 0 && (obj.revisionNumber = (message.revisionNumber || BigInt(0)).toString());
			message.revisionHeight !== void 0 && (obj.revisionHeight = (message.revisionHeight || BigInt(0)).toString());
			return obj;
		},
		fromPartial(object) {
			const message = createBaseHeight();
			if (object.revisionNumber !== void 0 && object.revisionNumber !== null) message.revisionNumber = BigInt(object.revisionNumber.toString());
			if (object.revisionHeight !== void 0 && object.revisionHeight !== null) message.revisionHeight = BigInt(object.revisionHeight.toString());
			return message;
		}
	};
	function createBaseParams() {
		return { allowedClients: [] };
	}
	exports.Params = {
		typeUrl: "/ibc.core.client.v1.Params",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			for (const v of message.allowedClients) writer.uint32(10).string(v);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseParams();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.allowedClients.push(reader.string());
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseParams();
			if (Array.isArray(object?.allowedClients)) obj.allowedClients = object.allowedClients.map((e) => String(e));
			return obj;
		},
		toJSON(message) {
			const obj = {};
			if (message.allowedClients) obj.allowedClients = message.allowedClients.map((e) => e);
			else obj.allowedClients = [];
			return obj;
		},
		fromPartial(object) {
			const message = createBaseParams();
			message.allowedClients = object.allowedClients?.map((e) => e) || [];
			return message;
		}
	};
}));
//#endregion
//#region node_modules/cosmjs-types/ibc/applications/transfer/v1/tx.js
var require_tx = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MsgClientImpl = exports.MsgUpdateParamsResponse = exports.MsgUpdateParams = exports.MsgTransferResponse = exports.MsgTransfer = exports.protobufPackage = void 0;
	var coin_1 = require_coin();
	var client_1 = require_client();
	var binary_1 = require_binary();
	var helpers_1 = require_helpers();
	exports.protobufPackage = "ibc.applications.transfer.v1";
	function createBaseMsgTransfer() {
		return {
			sourcePort: "",
			sourceChannel: "",
			token: coin_1.Coin.fromPartial({}),
			sender: "",
			receiver: "",
			timeoutHeight: client_1.Height.fromPartial({}),
			timeoutTimestamp: BigInt(0),
			memo: "",
			encoding: ""
		};
	}
	exports.MsgTransfer = {
		typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.sourcePort !== "") writer.uint32(10).string(message.sourcePort);
			if (message.sourceChannel !== "") writer.uint32(18).string(message.sourceChannel);
			if (message.token !== void 0) coin_1.Coin.encode(message.token, writer.uint32(26).fork()).ldelim();
			if (message.sender !== "") writer.uint32(34).string(message.sender);
			if (message.receiver !== "") writer.uint32(42).string(message.receiver);
			if (message.timeoutHeight !== void 0) client_1.Height.encode(message.timeoutHeight, writer.uint32(50).fork()).ldelim();
			if (message.timeoutTimestamp !== BigInt(0)) writer.uint32(56).uint64(message.timeoutTimestamp);
			if (message.memo !== "") writer.uint32(66).string(message.memo);
			if (message.encoding !== "") writer.uint32(74).string(message.encoding);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseMsgTransfer();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.sourcePort = reader.string();
						break;
					case 2:
						message.sourceChannel = reader.string();
						break;
					case 3:
						message.token = coin_1.Coin.decode(reader, reader.uint32());
						break;
					case 4:
						message.sender = reader.string();
						break;
					case 5:
						message.receiver = reader.string();
						break;
					case 6:
						message.timeoutHeight = client_1.Height.decode(reader, reader.uint32());
						break;
					case 7:
						message.timeoutTimestamp = reader.uint64();
						break;
					case 8:
						message.memo = reader.string();
						break;
					case 9:
						message.encoding = reader.string();
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseMsgTransfer();
			if ((0, helpers_1.isSet)(object.sourcePort)) obj.sourcePort = String(object.sourcePort);
			if ((0, helpers_1.isSet)(object.sourceChannel)) obj.sourceChannel = String(object.sourceChannel);
			if ((0, helpers_1.isSet)(object.token)) obj.token = coin_1.Coin.fromJSON(object.token);
			if ((0, helpers_1.isSet)(object.sender)) obj.sender = String(object.sender);
			if ((0, helpers_1.isSet)(object.receiver)) obj.receiver = String(object.receiver);
			if ((0, helpers_1.isSet)(object.timeoutHeight)) obj.timeoutHeight = client_1.Height.fromJSON(object.timeoutHeight);
			if ((0, helpers_1.isSet)(object.timeoutTimestamp)) obj.timeoutTimestamp = BigInt(object.timeoutTimestamp.toString());
			if ((0, helpers_1.isSet)(object.memo)) obj.memo = String(object.memo);
			if ((0, helpers_1.isSet)(object.encoding)) obj.encoding = String(object.encoding);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.sourcePort !== void 0 && (obj.sourcePort = message.sourcePort);
			message.sourceChannel !== void 0 && (obj.sourceChannel = message.sourceChannel);
			message.token !== void 0 && (obj.token = message.token ? coin_1.Coin.toJSON(message.token) : void 0);
			message.sender !== void 0 && (obj.sender = message.sender);
			message.receiver !== void 0 && (obj.receiver = message.receiver);
			message.timeoutHeight !== void 0 && (obj.timeoutHeight = message.timeoutHeight ? client_1.Height.toJSON(message.timeoutHeight) : void 0);
			message.timeoutTimestamp !== void 0 && (obj.timeoutTimestamp = (message.timeoutTimestamp || BigInt(0)).toString());
			message.memo !== void 0 && (obj.memo = message.memo);
			message.encoding !== void 0 && (obj.encoding = message.encoding);
			return obj;
		},
		fromPartial(object) {
			const message = createBaseMsgTransfer();
			message.sourcePort = object.sourcePort ?? "";
			message.sourceChannel = object.sourceChannel ?? "";
			if (object.token !== void 0 && object.token !== null) message.token = coin_1.Coin.fromPartial(object.token);
			message.sender = object.sender ?? "";
			message.receiver = object.receiver ?? "";
			if (object.timeoutHeight !== void 0 && object.timeoutHeight !== null) message.timeoutHeight = client_1.Height.fromPartial(object.timeoutHeight);
			if (object.timeoutTimestamp !== void 0 && object.timeoutTimestamp !== null) message.timeoutTimestamp = BigInt(object.timeoutTimestamp.toString());
			message.memo = object.memo ?? "";
			message.encoding = object.encoding ?? "";
			return message;
		}
	};
	function createBaseMsgTransferResponse() {
		return { sequence: BigInt(0) };
	}
	exports.MsgTransferResponse = {
		typeUrl: "/ibc.applications.transfer.v1.MsgTransferResponse",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.sequence !== BigInt(0)) writer.uint32(8).uint64(message.sequence);
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseMsgTransferResponse();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.sequence = reader.uint64();
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseMsgTransferResponse();
			if ((0, helpers_1.isSet)(object.sequence)) obj.sequence = BigInt(object.sequence.toString());
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.sequence !== void 0 && (obj.sequence = (message.sequence || BigInt(0)).toString());
			return obj;
		},
		fromPartial(object) {
			const message = createBaseMsgTransferResponse();
			if (object.sequence !== void 0 && object.sequence !== null) message.sequence = BigInt(object.sequence.toString());
			return message;
		}
	};
	function createBaseMsgUpdateParams() {
		return {
			signer: "",
			params: client_1.Params.fromPartial({})
		};
	}
	exports.MsgUpdateParams = {
		typeUrl: "/ibc.applications.transfer.v1.MsgUpdateParams",
		encode(message, writer = binary_1.BinaryWriter.create()) {
			if (message.signer !== "") writer.uint32(10).string(message.signer);
			if (message.params !== void 0) client_1.Params.encode(message.params, writer.uint32(18).fork()).ldelim();
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseMsgUpdateParams();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					case 1:
						message.signer = reader.string();
						break;
					case 2:
						message.params = client_1.Params.decode(reader, reader.uint32());
						break;
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(object) {
			const obj = createBaseMsgUpdateParams();
			if ((0, helpers_1.isSet)(object.signer)) obj.signer = String(object.signer);
			if ((0, helpers_1.isSet)(object.params)) obj.params = client_1.Params.fromJSON(object.params);
			return obj;
		},
		toJSON(message) {
			const obj = {};
			message.signer !== void 0 && (obj.signer = message.signer);
			message.params !== void 0 && (obj.params = message.params ? client_1.Params.toJSON(message.params) : void 0);
			return obj;
		},
		fromPartial(object) {
			const message = createBaseMsgUpdateParams();
			message.signer = object.signer ?? "";
			if (object.params !== void 0 && object.params !== null) message.params = client_1.Params.fromPartial(object.params);
			return message;
		}
	};
	function createBaseMsgUpdateParamsResponse() {
		return {};
	}
	exports.MsgUpdateParamsResponse = {
		typeUrl: "/ibc.applications.transfer.v1.MsgUpdateParamsResponse",
		encode(_, writer = binary_1.BinaryWriter.create()) {
			return writer;
		},
		decode(input, length) {
			const reader = input instanceof binary_1.BinaryReader ? input : new binary_1.BinaryReader(input);
			let end = length === void 0 ? reader.len : reader.pos + length;
			const message = createBaseMsgUpdateParamsResponse();
			while (reader.pos < end) {
				const tag = reader.uint32();
				switch (tag >>> 3) {
					default:
						reader.skipType(tag & 7);
						break;
				}
			}
			return message;
		},
		fromJSON(_) {
			return createBaseMsgUpdateParamsResponse();
		},
		toJSON(_) {
			return {};
		},
		fromPartial(_) {
			return createBaseMsgUpdateParamsResponse();
		}
	};
	var MsgClientImpl = class {
		rpc;
		constructor(rpc) {
			this.rpc = rpc;
			this.Transfer = this.Transfer.bind(this);
			this.UpdateParams = this.UpdateParams.bind(this);
		}
		Transfer(request) {
			const data = exports.MsgTransfer.encode(request).finish();
			return this.rpc.request("ibc.applications.transfer.v1.Msg", "Transfer", data).then((data) => exports.MsgTransferResponse.decode(new binary_1.BinaryReader(data)));
		}
		UpdateParams(request) {
			const data = exports.MsgUpdateParams.encode(request).finish();
			return this.rpc.request("ibc.applications.transfer.v1.Msg", "UpdateParams", data).then((data) => exports.MsgUpdateParamsResponse.decode(new binary_1.BinaryReader(data)));
		}
	};
	exports.MsgClientImpl = MsgClientImpl;
}));
//#endregion
//#region packages/cosmos/src/keplr.ts
var import_build = require_build();
var import_build$1 = require_build$4();
var import_tx = require_tx$2();
var import_tx$1 = require_tx$1();
var import_tx$2 = require_tx();
function toBase64(bytes) {
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary);
}
async function signWithKeplr(req, paymentId, input) {
	if (!window.keplr) throw new Error("keplr_not_installed");
	await window.keplr.enable(req.extra.chainId);
	const signer = window.keplr.getOfflineSigner(req.extra.chainId);
	if (!signer.signDirect) throw new Error("keplr_direct_sign_required");
	const accounts = await signer.getAccounts();
	if (accounts.length !== 1) throw new Error("keplr_account_ambiguous");
	const account = accounts[0], message = req.extra.transferType === "bank" ? {
		typeUrl: "/cosmos.bank.v1beta1.MsgSend",
		value: import_tx$1.MsgSend.encode({
			fromAddress: account.address,
			toAddress: req.payTo,
			amount: [{
				denom: req.asset,
				amount: req.amount
			}]
		}).finish()
	} : {
		typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
		value: import_tx$2.MsgTransfer.encode({
			sourcePort: "transfer",
			sourceChannel: req.extra.sourceChannel || "",
			token: {
				denom: req.asset,
				amount: req.amount
			},
			sender: account.address,
			receiver: req.payTo,
			timeoutHeight: {
				revisionNumber: 0n,
				revisionHeight: 0n
			},
			timeoutTimestamp: BigInt(Date.now() + 10 * 6e4) * 1000000n,
			memo: "",
			encoding: ""
		}).finish()
	}, memo = `x402:${paymentId}:${req.extra.nonce}:${req.extra.resourceHash}`, signDoc = {
		bodyBytes: import_tx.TxBody.encode(import_tx.TxBody.fromPartial({
			messages: [message],
			memo
		})).finish(),
		authInfoBytes: (0, import_build.makeAuthInfoBytes)([{
			pubkey: (0, import_build.encodePubkey)({
				type: "tendermint/PubKeySecp256k1",
				value: toBase64(account.pubkey)
			}),
			sequence: input.sequence
		}], input.feeAmount, input.gasLimit, req.extra.feeGranter, void 0),
		chainId: req.extra.chainId,
		accountNumber: BigInt(input.accountNumber)
	}, signed = await signer.signDirect(account.address, signDoc);
	return {
		txBytes: toBase64(import_tx.TxRaw.encode({
			bodyBytes: signed.signed.bodyBytes,
			authInfoBytes: signed.signed.authInfoBytes,
			signatures: [(0, import_build$1.fromBase64)(signed.signature.signature)]
		}).finish()),
		signer: account.address,
		accountNumber: String(input.accountNumber),
		paymentId,
		createdAt: Math.floor(Date.now() / 1e3)
	};
}
//#endregion
//#region app/cosmos/CosmosWallet.tsx
var import_jsx_runtime = require_jsx_runtime();
var example = JSON.stringify({
	scheme: "exact",
	network: "cosmos:localnet-1",
	asset: "uatom",
	amount: "1000",
	payTo: `cosmos1${"p".repeat(38)}`,
	resource: "https://api.example/data",
	maxTimeoutSeconds: 300,
	extra: {
		chainId: "localnet-1",
		nonce: "nonce_cosmos_example_1",
		resourceHash: "a".repeat(64),
		expiresAt: Math.floor(Date.now() / 1e3) + 3600,
		transferType: "bank"
	}
}, null, 2);
function CosmosWallet() {
	const [requirements, setRequirements] = (0, import_react.useState)(example), [result, setResult] = (0, import_react.useState)(""), [error, setError] = (0, import_react.useState)("");
	async function sign() {
		setError("");
		try {
			const req = CosmosRequirementsSchema.parse(JSON.parse(requirements)), payload = await signWithKeplr(req, `pay_${crypto.randomUUID().replaceAll("-", "")}`, {
				accountNumber: Number(prompt("Account number") || 0),
				sequence: Number(prompt("Sequence") || 0),
				feeAmount: [{
					denom: req.asset,
					amount: "500"
				}],
				gasLimit: 2e5
			});
			setResult(JSON.stringify({
				x402Version: 2,
				scheme: "exact",
				network: req.network,
				payload
			}, null, 2));
		} catch (e) {
			setError(e instanceof Error ? e.message : "keplr_error");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid twoCol",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card feature",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Keplr direct signer" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Paste exact payment requirements. Keplr signs Protobuf SignDoc; the private key never leaves the extension." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					className: "code",
					style: {
						width: "100%",
						minHeight: 320,
						marginBottom: 12
					},
					value: requirements,
					onChange: (e) => setRequirements(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "button",
					onClick: sign,
					children: "Sign with Keplr"
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "failed",
					children: error
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card feature",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Offline payment payload" }), result ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "code",
				children: result
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The signed TxRaw envelope appears here for verify/settle." })]
		})]
	});
}
//#endregion
export { CosmosWallet as default };
