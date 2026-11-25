(()=>{var Sl=function(n){let e=[],t=0;for(let r=0;r<n.length;r++){let i=n.charCodeAt(r);i<128?e[t++]=i:i<2048?(e[t++]=i>>6|192,e[t++]=i&63|128):(i&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=i>>18|240,e[t++]=i>>12&63|128,e[t++]=i>>6&63|128,e[t++]=i&63|128):(e[t++]=i>>12|224,e[t++]=i>>6&63|128,e[t++]=i&63|128)}return e},Pp=function(n){let e=[],t=0,r=0;for(;t<n.length;){let i=n[t++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){let o=n[t++];e[r++]=String.fromCharCode((i&31)<<6|o&63)}else if(i>239&&i<365){let o=n[t++],a=n[t++],u=n[t++],h=((i&7)<<18|(o&63)<<12|(a&63)<<6|u&63)-65536;e[r++]=String.fromCharCode(55296+(h>>10)),e[r++]=String.fromCharCode(56320+(h&1023))}else{let o=n[t++],a=n[t++];e[r++]=String.fromCharCode((i&15)<<12|(o&63)<<6|a&63)}}return e.join("")},Rl={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();let t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<n.length;i+=3){let o=n[i],a=i+1<n.length,u=a?n[i+1]:0,h=i+2<n.length,d=h?n[i+2]:0,p=o>>2,y=(o&3)<<4|u>>4,T=(u&15)<<2|d>>6,R=d&63;h||(R=64,a||(T=64)),r.push(t[p],t[y],t[T],t[R])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(Sl(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):Pp(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();let t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<n.length;){let o=t[n.charAt(i++)],u=i<n.length?t[n.charAt(i)]:0;++i;let d=i<n.length?t[n.charAt(i)]:64;++i;let y=i<n.length?t[n.charAt(i)]:64;if(++i,o==null||u==null||d==null||y==null)throw new oo;let T=o<<2|u>>4;if(r.push(T),d!==64){let R=u<<4&240|d>>2;if(r.push(R),y!==64){let k=d<<6&192|y;r.push(k)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}},oo=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}},Cp=function(n){let e=Sl(n);return Rl.encodeByteArray(e,!0)},co=function(n){return Cp(n).replace(/\./g,"")},uo=function(n){try{return Rl.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};function Dp(){if(typeof self!="undefined")return self;if(typeof window!="undefined")return window;if(typeof global!="undefined")return global;throw new Error("Unable to locate global object.")}var Np=()=>Dp().__FIREBASE_DEFAULTS__,kp=()=>{if(typeof process=="undefined"||typeof process.env=="undefined")return;let n=process.env.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Op=()=>{if(typeof document=="undefined")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}let e=n&&uo(n[1]);return e&&JSON.parse(e)},ci=()=>{try{return Np()||kp()||Op()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Pl=n=>{var e,t;return(t=(e=ci())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[n]};var lo=()=>{var n;return(n=ci())===null||n===void 0?void 0:n.config},ho=n=>{var e;return(e=ci())===null||e===void 0?void 0:e[`_${n}`]};var ai=class{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}};function ae(){return typeof navigator!="undefined"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Cl(){return typeof window!="undefined"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(ae())}function xp(){var n;let e=(n=ci())===null||n===void 0?void 0:n.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Dl(){let n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Nl(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function kl(){let n=ae();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function Ol(){return!xp()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function fo(){try{return typeof indexedDB=="object"}catch{return!1}}function xl(){return new Promise((n,e)=>{try{let t=!0,r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},i.onupgradeneeded=()=>{t=!1},i.onerror=()=>{var o;e(((o=i.error)===null||o===void 0?void 0:o.message)||"")}}catch(t){e(t)}})}var Vp="FirebaseError",Re=class n extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=Vp,Object.setPrototypeOf(this,n.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Ze.prototype.create)}},Ze=class{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){let r=t[0]||{},i=`${this.service}/${e}`,o=this.errors[e],a=o?Lp(o,r):"Error",u=`${this.serviceName}: ${a} (${i}).`;return new Re(i,u,r)}};function Lp(n,e){return n.replace(Mp,(t,r)=>{let i=e[r];return i!=null?String(i):`<${r}?>`})}var Mp=/\{\$([^}]+)}/g;function Vl(n){for(let e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function ht(n,e){if(n===e)return!0;let t=Object.keys(n),r=Object.keys(e);for(let i of t){if(!r.includes(i))return!1;let o=n[i],a=e[i];if(bl(o)&&bl(a)){if(!ht(o,a))return!1}else if(o!==a)return!1}for(let i of r)if(!t.includes(i))return!1;return!0}function bl(n){return n!==null&&typeof n=="object"}function nn(n){let e=[];for(let[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function rn(n){let e={};return n.replace(/^\?/,"").split("&").forEach(r=>{if(r){let[i,o]=r.split("=");e[decodeURIComponent(i)]=decodeURIComponent(o)}}),e}function sn(n){let e=n.indexOf("?");if(!e)return"";let t=n.indexOf("#",e);return n.substring(e,t>0?t:void 0)}function Ll(n,e){let t=new ao(n,e);return t.subscribe.bind(t)}var ao=class{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let i;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");Fp(e,["next","error","complete"])?i=e:i={next:e,error:t,complete:r},i.next===void 0&&(i.next=so),i.error===void 0&&(i.error=so),i.complete===void 0&&(i.complete=so);let o=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),o}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console!="undefined"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}};function Fp(n,e){if(typeof n!="object"||n===null)return!1;for(let t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function so(){}var Rv=4*60*60*1e3;function ee(n){return n&&n._delegate?n._delegate:n}var Ne=class{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};var kt="[DEFAULT]";var po=class{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){let t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){let r=new ai;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{let i=this.getOrInitializeService({instanceIdentifier:t});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;let r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),i=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(o){if(i)return null;throw o}else{if(i)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(qp(e))try{this.getOrInitializeService({instanceIdentifier:kt})}catch{}for(let[t,r]of this.instancesDeferred.entries()){let i=this.normalizeInstanceIdentifier(t);try{let o=this.getOrInitializeService({instanceIdentifier:i});r.resolve(o)}catch{}}}}clearInstance(e=kt){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){let e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=kt){return this.instances.has(e)}getOptions(e=kt){return this.instancesOptions.get(e)||{}}initialize(e={}){let{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);let i=this.getOrInitializeService({instanceIdentifier:r,options:t});for(let[o,a]of this.instancesDeferred.entries()){let u=this.normalizeInstanceIdentifier(o);r===u&&a.resolve(i)}return i}onInit(e,t){var r;let i=this.normalizeInstanceIdentifier(t),o=(r=this.onInitCallbacks.get(i))!==null&&r!==void 0?r:new Set;o.add(e),this.onInitCallbacks.set(i,o);let a=this.instances.get(i);return a&&e(a,i),()=>{o.delete(e)}}invokeOnInitCallbacks(e,t){let r=this.onInitCallbacks.get(t);if(r)for(let i of r)try{i(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Up(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=kt){return this.component?this.component.multipleInstances?e:kt:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}};function Up(n){return n===kt?void 0:n}function qp(n){return n.instantiationMode==="EAGER"}var ui=class{constructor(e){this.name=e,this.providers=new Map}addComponent(e){let t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);let t=new po(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}};var Bp=[],B;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(B||(B={}));var jp={debug:B.DEBUG,verbose:B.VERBOSE,info:B.INFO,warn:B.WARN,error:B.ERROR,silent:B.SILENT},zp=B.INFO,Gp={[B.DEBUG]:"log",[B.VERBOSE]:"log",[B.INFO]:"info",[B.WARN]:"warn",[B.ERROR]:"error"},Kp=(n,e,...t)=>{if(e<n.logLevel)return;let r=new Date().toISOString(),i=Gp[e];if(i)console[i](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)},dt=class{constructor(e){this.name=e,this._logLevel=zp,this._logHandler=Kp,this._userLogHandler=null,Bp.push(this)}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in B))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?jp[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,B.DEBUG,...e),this._logHandler(this,B.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,B.VERBOSE,...e),this._logHandler(this,B.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,B.INFO,...e),this._logHandler(this,B.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,B.WARN,...e),this._logHandler(this,B.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,B.ERROR,...e),this._logHandler(this,B.ERROR,...e)}};var $p=(n,e)=>e.some(t=>n instanceof t),Ml,Fl;function Hp(){return Ml||(Ml=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Wp(){return Fl||(Fl=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}var Ul=new WeakMap,go=new WeakMap,ql=new WeakMap,mo=new WeakMap,yo=new WeakMap;function Qp(n){let e=new Promise((t,r)=>{let i=()=>{n.removeEventListener("success",o),n.removeEventListener("error",a)},o=()=>{t(qe(n.result)),i()},a=()=>{r(n.error),i()};n.addEventListener("success",o),n.addEventListener("error",a)});return e.then(t=>{t instanceof IDBCursor&&Ul.set(t,n)}).catch(()=>{}),yo.set(e,n),e}function Jp(n){if(go.has(n))return;let e=new Promise((t,r)=>{let i=()=>{n.removeEventListener("complete",o),n.removeEventListener("error",a),n.removeEventListener("abort",a)},o=()=>{t(),i()},a=()=>{r(n.error||new DOMException("AbortError","AbortError")),i()};n.addEventListener("complete",o),n.addEventListener("error",a),n.addEventListener("abort",a)});go.set(n,e)}var _o={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return go.get(n);if(e==="objectStoreNames")return n.objectStoreNames||ql.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return qe(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function Bl(n){_o=n(_o)}function Yp(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){let r=n.call(li(this),e,...t);return ql.set(r,e.sort?e.sort():[e]),qe(r)}:Wp().includes(n)?function(...e){return n.apply(li(this),e),qe(Ul.get(this))}:function(...e){return qe(n.apply(li(this),e))}}function Xp(n){return typeof n=="function"?Yp(n):(n instanceof IDBTransaction&&Jp(n),$p(n,Hp())?new Proxy(n,_o):n)}function qe(n){if(n instanceof IDBRequest)return Qp(n);if(mo.has(n))return mo.get(n);let e=Xp(n);return e!==n&&(mo.set(n,e),yo.set(e,n)),e}var li=n=>yo.get(n);function zl(n,e,{blocked:t,upgrade:r,blocking:i,terminated:o}={}){let a=indexedDB.open(n,e),u=qe(a);return r&&a.addEventListener("upgradeneeded",h=>{r(qe(a.result),h.oldVersion,h.newVersion,qe(a.transaction),h)}),t&&a.addEventListener("blocked",h=>t(h.oldVersion,h.newVersion,h)),u.then(h=>{o&&h.addEventListener("close",()=>o()),i&&h.addEventListener("versionchange",d=>i(d.oldVersion,d.newVersion,d))}).catch(()=>{}),u}var Zp=["get","getKey","getAll","getAllKeys","count"],em=["put","add","delete","clear"],vo=new Map;function jl(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(vo.get(e))return vo.get(e);let t=e.replace(/FromIndex$/,""),r=e!==t,i=em.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(i||Zp.includes(t)))return;let o=async function(a,...u){let h=this.transaction(a,i?"readwrite":"readonly"),d=h.store;return r&&(d=d.index(u.shift())),(await Promise.all([d[t](...u),i&&h.done]))[0]};return vo.set(e,o),o}Bl(n=>({...n,get:(e,t,r)=>jl(e,t)||n.get(e,t,r),has:(e,t)=>!!jl(e,t)||n.has(e,t)}));var wo=class{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(tm(t)){let r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}};function tm(n){let e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}var Eo="@firebase/app",Gl="0.10.5";var Ot=new dt("@firebase/app"),nm="@firebase/app-compat",rm="@firebase/analytics-compat",im="@firebase/analytics",sm="@firebase/app-check-compat",om="@firebase/app-check",am="@firebase/auth",cm="@firebase/auth-compat",um="@firebase/database",lm="@firebase/database-compat",hm="@firebase/functions",dm="@firebase/functions-compat",fm="@firebase/installations",pm="@firebase/installations-compat",mm="@firebase/messaging",gm="@firebase/messaging-compat",_m="@firebase/performance",ym="@firebase/performance-compat",vm="@firebase/remote-config",Im="@firebase/remote-config-compat",wm="@firebase/storage",Em="@firebase/storage-compat",Tm="@firebase/firestore",Am="@firebase/vertexai-preview",bm="@firebase/firestore-compat",Sm="firebase",Rm="10.12.2";var To="[DEFAULT]",Pm={[Eo]:"fire-core",[nm]:"fire-core-compat",[im]:"fire-analytics",[rm]:"fire-analytics-compat",[om]:"fire-app-check",[sm]:"fire-app-check-compat",[am]:"fire-auth",[cm]:"fire-auth-compat",[um]:"fire-rtdb",[lm]:"fire-rtdb-compat",[hm]:"fire-fn",[dm]:"fire-fn-compat",[fm]:"fire-iid",[pm]:"fire-iid-compat",[mm]:"fire-fcm",[gm]:"fire-fcm-compat",[_m]:"fire-perf",[ym]:"fire-perf-compat",[vm]:"fire-rc",[Im]:"fire-rc-compat",[wm]:"fire-gcs",[Em]:"fire-gcs-compat",[Tm]:"fire-fst",[bm]:"fire-fst-compat",[Am]:"fire-vertex","fire-js":"fire-js",[Sm]:"fire-js-all"};var hi=new Map,Cm=new Map,Ao=new Map;function Kl(n,e){try{n.container.addComponent(e)}catch(t){Ot.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function pt(n){let e=n.name;if(Ao.has(e))return Ot.debug(`There were multiple attempts to register component ${e}.`),!1;Ao.set(e,n);for(let t of hi.values())Kl(t,n);for(let t of Cm.values())Kl(t,n);return!0}function tr(n,e){let t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function Me(n){return n.settings!==void 0}var Dm={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},ft=new Ze("app","Firebase",Dm);var bo=class{constructor(e,t,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new Ne("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw ft.create("app-deleted",{appName:this._name})}};var mt=Rm;function Po(n,e={}){let t=n;typeof e!="object"&&(e={name:e});let r=Object.assign({name:To,automaticDataCollectionEnabled:!1},e),i=r.name;if(typeof i!="string"||!i)throw ft.create("bad-app-name",{appName:String(i)});if(t||(t=lo()),!t)throw ft.create("no-options");let o=hi.get(i);if(o){if(ht(t,o.options)&&ht(r,o.config))return o;throw ft.create("duplicate-app",{appName:i})}let a=new ui(i);for(let h of Ao.values())a.addComponent(h);let u=new bo(t,r,a);return hi.set(i,u),u}function Co(n=To){let e=hi.get(n);if(!e&&n===To&&lo())return Po();if(!e)throw ft.create("no-app",{appName:n});return e}function Le(n,e,t){var r;let i=(r=Pm[n])!==null&&r!==void 0?r:n;t&&(i+=`-${t}`);let o=i.match(/\s|\//),a=e.match(/\s|\//);if(o||a){let u=[`Unable to register library "${i}" with version "${e}":`];o&&u.push(`library name "${i}" contains illegal characters (whitespace or "/")`),o&&a&&u.push("and"),a&&u.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Ot.warn(u.join(" "));return}pt(new Ne(`${i}-version`,()=>({library:i,version:e}),"VERSION"))}var Nm="firebase-heartbeat-database",km=1,er="firebase-heartbeat-store",Io=null;function Ql(){return Io||(Io=zl(Nm,km,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(er)}catch(t){console.warn(t)}}}}).catch(n=>{throw ft.create("idb-open",{originalErrorMessage:n.message})})),Io}async function Om(n){try{let t=(await Ql()).transaction(er),r=await t.objectStore(er).get(Jl(n));return await t.done,r}catch(e){if(e instanceof Re)Ot.warn(e.message);else{let t=ft.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Ot.warn(t.message)}}}async function $l(n,e){try{let r=(await Ql()).transaction(er,"readwrite");await r.objectStore(er).put(e,Jl(n)),await r.done}catch(t){if(t instanceof Re)Ot.warn(t.message);else{let r=ft.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});Ot.warn(r.message)}}}function Jl(n){return`${n.name}!${n.options.appId}`}var xm=1024,Vm=30*24*60*60*1e3,So=class{constructor(e){this.container=e,this._heartbeatsCache=null;let t=this.container.getProvider("app").getImmediate();this._storage=new Ro(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;let i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),o=Hl();if(!(((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null))&&!(this._heartbeatsCache.lastSentHeartbeatDate===o||this._heartbeatsCache.heartbeats.some(a=>a.date===o)))return this._heartbeatsCache.heartbeats.push({date:o,agent:i}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(a=>{let u=new Date(a.date).valueOf();return Date.now()-u<=Vm}),this._storage.overwrite(this._heartbeatsCache)}async getHeartbeatsHeader(){var e;if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";let t=Hl(),{heartbeatsToSend:r,unsentEntries:i}=Lm(this._heartbeatsCache.heartbeats),o=co(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),o}};function Hl(){return new Date().toISOString().substring(0,10)}function Lm(n,e=xm){let t=[],r=n.slice();for(let i of n){let o=t.find(a=>a.agent===i.agent);if(o){if(o.dates.push(i.date),Wl(t)>e){o.dates.pop();break}}else if(t.push({agent:i.agent,dates:[i.date]}),Wl(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}var Ro=class{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return fo()?xl().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){let t=await Om(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){let i=await this.read();return $l(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:i.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){let i=await this.read();return $l(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...e.heartbeats]})}else return}};function Wl(n){return co(JSON.stringify({version:2,heartbeats:n})).length}function Mm(n){pt(new Ne("platform-logger",e=>new wo(e),"PRIVATE")),pt(new Ne("heartbeat",e=>new So(e),"PRIVATE")),Le(Eo,Gl,n),Le(Eo,Gl,"esm2017"),Le("fire-js","")}Mm("");var Fm="firebase",Um="10.12.2";Le(Fm,Um,"app");function di(n,e){var t={};for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&e.indexOf(r)<0&&(t[r]=n[r]);if(n!=null&&typeof Object.getOwnPropertySymbols=="function")for(var i=0,r=Object.getOwnPropertySymbols(n);i<r.length;i++)e.indexOf(r[i])<0&&Object.prototype.propertyIsEnumerable.call(n,r[i])&&(t[r[i]]=n[r[i]]);return t}function fh(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}var ph=fh,mh=new Ze("auth","Firebase",fh());var yi=new dt("@firebase/auth");function qm(n,...e){yi.logLevel<=B.WARN&&yi.warn(`Auth (${mt}): ${n}`,...e)}function pi(n,...e){yi.logLevel<=B.ERROR&&yi.error(`Auth (${mt}): ${n}`,...e)}function Fe(n,...e){throw Yo(n,...e)}function je(n,...e){return Yo(n,...e)}function gh(n,e,t){let r=Object.assign(Object.assign({},ph()),{[e]:t});return new Ze("auth","Firebase",r).create(e,{appName:n.name})}function tt(n){return gh(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Yo(n,...e){if(typeof n!="string"){let t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return mh.create(n,...e)}function V(n,e,...t){if(!n)throw Yo(e,...t)}function Be(n){let e="INTERNAL ASSERTION FAILED: "+n;throw pi(e),new Error(e)}function nt(n,e){n||Be(e)}function ko(){var n;return typeof self!="undefined"&&((n=self.location)===null||n===void 0?void 0:n.href)||""}function Bm(){return Yl()==="http:"||Yl()==="https:"}function Yl(){var n;return typeof self!="undefined"&&((n=self.location)===null||n===void 0?void 0:n.protocol)||null}function jm(){return typeof navigator!="undefined"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(Bm()||Dl()||"connection"in navigator)?navigator.onLine:!0}function zm(){if(typeof navigator=="undefined")return null;let n=navigator;return n.languages&&n.languages[0]||n.language||null}var xt=class{constructor(e,t){this.shortDelay=e,this.longDelay=t,nt(t>e,"Short delay should be less than long delay!"),this.isMobile=Cl()||Nl()}get(){return jm()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}};function Xo(n,e){nt(n.emulator,"Emulator should always be set here");let{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}var vi=class{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self!="undefined"&&"fetch"in self)return self.fetch;if(typeof globalThis!="undefined"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch!="undefined")return fetch;Be("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self!="undefined"&&"Headers"in self)return self.Headers;if(typeof globalThis!="undefined"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers!="undefined")return Headers;Be("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self!="undefined"&&"Response"in self)return self.Response;if(typeof globalThis!="undefined"&&globalThis.Response)return globalThis.Response;if(typeof Response!="undefined")return Response;Be("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}};var Gm={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};var Km=new xt(3e4,6e4);function ce(n,e){return n.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:n.tenantId}):e}async function he(n,e,t,r,i={}){return _h(n,i,async()=>{let o={},a={};r&&(e==="GET"?a=r:o={body:JSON.stringify(r)});let u=nn(Object.assign({key:n.config.apiKey},a)).slice(1),h=await n._getAdditionalHeaders();return h["Content-Type"]="application/json",n.languageCode&&(h["X-Firebase-Locale"]=n.languageCode),vi.fetch()(yh(n,n.config.apiHost,t,u),Object.assign({method:e,headers:h,referrerPolicy:"no-referrer"},o))})}async function _h(n,e,t){n._canInitEmulator=!1;let r=Object.assign(Object.assign({},Gm),e);try{let i=new Oo(n),o=await Promise.race([t(),i.promise]);i.clearNetworkTimeout();let a=await o.json();if("needConfirmation"in a)throw nr(n,"account-exists-with-different-credential",a);if(o.ok&&!("errorMessage"in a))return a;{let u=o.ok?a.errorMessage:a.error.message,[h,d]=u.split(" : ");if(h==="FEDERATED_USER_ID_ALREADY_LINKED")throw nr(n,"credential-already-in-use",a);if(h==="EMAIL_EXISTS")throw nr(n,"email-already-in-use",a);if(h==="USER_DISABLED")throw nr(n,"user-disabled",a);let p=r[h]||h.toLowerCase().replace(/[_\s]+/g,"-");if(d)throw gh(n,p,d);Fe(n,p)}}catch(i){if(i instanceof Re)throw i;Fe(n,"network-request-failed",{message:String(i)})}}async function _t(n,e,t,r,i={}){let o=await he(n,e,t,r,i);return"mfaPendingCredential"in o&&Fe(n,"multi-factor-auth-required",{_serverResponse:o}),o}function yh(n,e,t,r){let i=`${e}${t}?${r}`;return n.config.emulator?Xo(n.config,i):`${n.config.apiScheme}://${i}`}function $m(n){switch(n){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}var Oo=class{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(je(this.auth,"network-request-failed")),Km.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}};function nr(n,e,t){let r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);let i=je(n,e,r);return i.customData._tokenResponse=t,i}function Xl(n){return n!==void 0&&n.enterprise!==void 0}var xo=class{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(let t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return $m(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}};async function Hm(n,e){return he(n,"GET","/v2/recaptchaConfig",ce(n,e))}async function Wm(n,e){return he(n,"POST","/v1/accounts:delete",e)}async function vh(n,e){return he(n,"POST","/v1/accounts:lookup",e)}function rr(n){if(n)try{let e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function Ih(n,e=!1){let t=ee(n),r=await t.getIdToken(e),i=Zo(r);V(i&&i.exp&&i.auth_time&&i.iat,t.auth,"internal-error");let o=typeof i.firebase=="object"?i.firebase:void 0,a=o==null?void 0:o.sign_in_provider;return{claims:i,token:r,authTime:rr(Do(i.auth_time)),issuedAtTime:rr(Do(i.iat)),expirationTime:rr(Do(i.exp)),signInProvider:a||null,signInSecondFactor:(o==null?void 0:o.sign_in_second_factor)||null}}function Do(n){return Number(n)*1e3}function Zo(n){let[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return pi("JWT malformed, contained fewer than 3 sections"),null;try{let i=uo(t);return i?JSON.parse(i):(pi("Failed to decode base64 JWT payload"),null)}catch(i){return pi("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function Zl(n){let e=Zo(n);return V(e,"internal-error"),V(typeof e.exp!="undefined","internal-error"),V(typeof e.iat!="undefined","internal-error"),Number(e.exp)-Number(e.iat)}async function an(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof Re&&Qm(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function Qm({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}var Vo=class{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){let r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;let i=((t=this.user.stsTokenManager.expirationTime)!==null&&t!==void 0?t:0)-Date.now()-3e5;return Math.max(0,i)}}schedule(e=!1){if(!this.isRunning)return;let t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}};var sr=class{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=rr(this.lastLoginAt),this.creationTime=rr(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}};async function Ii(n){var e;let t=n.auth,r=await n.getIdToken(),i=await an(n,vh(t,{idToken:r}));V(i==null?void 0:i.users.length,t,"internal-error");let o=i.users[0];n._notifyReloadListener(o);let a=!((e=o.providerUserInfo)===null||e===void 0)&&e.length?Eh(o.providerUserInfo):[],u=Jm(n.providerData,a),h=n.isAnonymous,d=!(n.email&&o.passwordHash)&&!(u!=null&&u.length),p=h?d:!1,y={uid:o.localId,displayName:o.displayName||null,photoURL:o.photoUrl||null,email:o.email||null,emailVerified:o.emailVerified||!1,phoneNumber:o.phoneNumber||null,tenantId:o.tenantId||null,providerData:u,metadata:new sr(o.createdAt,o.lastLoginAt),isAnonymous:p};Object.assign(n,y)}async function wh(n){let e=ee(n);await Ii(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function Jm(n,e){return[...n.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function Eh(n){return n.map(e=>{var{providerId:t}=e,r=di(e,["providerId"]);return{providerId:t,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}async function Ym(n,e){let t=await _h(n,{},async()=>{let r=nn({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:o}=n.config,a=yh(n,i,"/v1/token",`key=${o}`),u=await n._getAdditionalHeaders();return u["Content-Type"]="application/x-www-form-urlencoded",vi.fetch()(a,{method:"POST",headers:u,body:r})});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function Xm(n,e){return he(n,"POST","/v2/accounts:revokeToken",ce(n,e))}var ir=class n{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){V(e.idToken,"internal-error"),V(typeof e.idToken!="undefined","internal-error"),V(typeof e.refreshToken!="undefined","internal-error");let t="expiresIn"in e&&typeof e.expiresIn!="undefined"?Number(e.expiresIn):Zl(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){V(e.length!==0,"internal-error");let t=Zl(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(V(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){let{accessToken:r,refreshToken:i,expiresIn:o}=await Ym(e,t);this.updateTokensAndExpiration(r,i,Number(o))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){let{refreshToken:r,accessToken:i,expirationTime:o}=t,a=new n;return r&&(V(typeof r=="string","internal-error",{appName:e}),a.refreshToken=r),i&&(V(typeof i=="string","internal-error",{appName:e}),a.accessToken=i),o&&(V(typeof o=="number","internal-error",{appName:e}),a.expirationTime=o),a}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new n,this.toJSON())}_performRefresh(){return Be("not implemented")}};function gt(n,e){V(typeof n=="string"||typeof n=="undefined","internal-error",{appName:e})}var cn=class n{constructor(e){var{uid:t,auth:r,stsTokenManager:i}=e,o=di(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new Vo(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=r,this.stsTokenManager=i,this.accessToken=i.accessToken,this.displayName=o.displayName||null,this.email=o.email||null,this.emailVerified=o.emailVerified||!1,this.phoneNumber=o.phoneNumber||null,this.photoURL=o.photoURL||null,this.isAnonymous=o.isAnonymous||!1,this.tenantId=o.tenantId||null,this.providerData=o.providerData?[...o.providerData]:[],this.metadata=new sr(o.createdAt||void 0,o.lastLoginAt||void 0)}async getIdToken(e){let t=await an(this,this.stsTokenManager.getToken(this.auth,e));return V(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return Ih(this,e)}reload(){return wh(this)}_assign(e){this!==e&&(V(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){let t=new n(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){V(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await Ii(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Me(this.auth.app))return Promise.reject(tt(this.auth));let e=await this.getIdToken();return await an(this,Wm(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var r,i,o,a,u,h,d,p;let y=(r=t.displayName)!==null&&r!==void 0?r:void 0,T=(i=t.email)!==null&&i!==void 0?i:void 0,R=(o=t.phoneNumber)!==null&&o!==void 0?o:void 0,k=(a=t.photoURL)!==null&&a!==void 0?a:void 0,x=(u=t.tenantId)!==null&&u!==void 0?u:void 0,D=(h=t._redirectEventId)!==null&&h!==void 0?h:void 0,q=(d=t.createdAt)!==null&&d!==void 0?d:void 0,z=(p=t.lastLoginAt)!==null&&p!==void 0?p:void 0,{uid:G,emailVerified:X,isAnonymous:Ie,providerData:Q,stsTokenManager:I}=t;V(G&&I,e,"internal-error");let m=ir.fromJSON(this.name,I);V(typeof G=="string",e,"internal-error"),gt(y,e.name),gt(T,e.name),V(typeof X=="boolean",e,"internal-error"),V(typeof Ie=="boolean",e,"internal-error"),gt(R,e.name),gt(k,e.name),gt(x,e.name),gt(D,e.name),gt(q,e.name),gt(z,e.name);let _=new n({uid:G,auth:e,email:T,emailVerified:X,displayName:y,isAnonymous:Ie,photoURL:k,phoneNumber:R,tenantId:x,stsTokenManager:m,createdAt:q,lastLoginAt:z});return Q&&Array.isArray(Q)&&(_.providerData=Q.map(v=>Object.assign({},v))),D&&(_._redirectEventId=D),_}static async _fromIdTokenResponse(e,t,r=!1){let i=new ir;i.updateFromServerResponse(t);let o=new n({uid:t.localId,auth:e,stsTokenManager:i,isAnonymous:r});return await Ii(o),o}static async _fromGetAccountInfoResponse(e,t,r){let i=t.users[0];V(i.localId!==void 0,"internal-error");let o=i.providerUserInfo!==void 0?Eh(i.providerUserInfo):[],a=!(i.email&&i.passwordHash)&&!(o!=null&&o.length),u=new ir;u.updateFromIdToken(r);let h=new n({uid:i.localId,auth:e,stsTokenManager:u,isAnonymous:a}),d={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:o,metadata:new sr(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(o!=null&&o.length)};return Object.assign(h,d),h}};var eh=new Map;function et(n){nt(n instanceof Function,"Expected a class definition");let e=eh.get(n);return e?(nt(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,eh.set(n,e),e)}var wi=class{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){let t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}};wi.type="NONE";var Lo=wi;function mi(n,e,t){return`firebase:${n}:${e}:${t}`}var Ei=class n{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;let{config:i,name:o}=this.auth;this.fullUserKey=mi(this.userKey,i.apiKey,o),this.fullPersistenceKey=mi("persistence",i.apiKey,o),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){let e=await this.persistence._get(this.fullUserKey);return e?cn._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;let t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new n(et(Lo),e,r);let i=(await Promise.all(t.map(async d=>{if(await d._isAvailable())return d}))).filter(d=>d),o=i[0]||et(Lo),a=mi(r,e.config.apiKey,e.name),u=null;for(let d of t)try{let p=await d._get(a);if(p){let y=cn._fromJSON(e,p);d!==o&&(u=y),o=d;break}}catch{}let h=i.filter(d=>d._shouldAllowMigration);return!o._shouldAllowMigration||!h.length?new n(o,e,r):(o=h[0],u&&await o._set(a,u.toJSON()),await Promise.all(t.map(async d=>{if(d!==o)try{await d._remove(a)}catch{}})),new n(o,e,r))}};function th(n){let e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(bh(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Th(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Rh(e))return"Blackberry";if(Ph(e))return"Webos";if(ea(e))return"Safari";if((e.includes("chrome/")||Ah(e))&&!e.includes("edge/"))return"Chrome";if(Sh(e))return"Android";{let t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Th(n=ae()){return/firefox\//i.test(n)}function ea(n=ae()){let e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Ah(n=ae()){return/crios\//i.test(n)}function bh(n=ae()){return/iemobile/i.test(n)}function Sh(n=ae()){return/android/i.test(n)}function Rh(n=ae()){return/blackberry/i.test(n)}function Ph(n=ae()){return/webos/i.test(n)}function qi(n=ae()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function Zm(n=ae()){var e;return qi(n)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function eg(){return kl()&&document.documentMode===10}function Ch(n=ae()){return qi(n)||Sh(n)||Ph(n)||Rh(n)||/windows phone/i.test(n)||bh(n)}function tg(){try{return!!(window&&window!==window.top)}catch{return!1}}function Dh(n,e=[]){let t;switch(n){case"Browser":t=th(ae());break;case"Worker":t=`${th(ae())}-${n}`;break;default:t=n}let r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${mt}/${r}`}var Mo=class{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){let r=o=>new Promise((a,u)=>{try{let h=e(o);a(h)}catch(h){u(h)}});r.onAbort=t,this.queue.push(r);let i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;let t=[];try{for(let r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(let i of t)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}};async function ng(n,e={}){return he(n,"GET","/v2/passwordPolicy",ce(n,e))}var rg=6,Fo=class{constructor(e){var t,r,i,o;let a=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(t=a.minPasswordLength)!==null&&t!==void 0?t:rg,a.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=a.maxPasswordLength),a.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=a.containsLowercaseCharacter),a.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=a.containsUppercaseCharacter),a.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=a.containsNumericCharacter),a.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=a.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(i=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&i!==void 0?i:"",this.forceUpgradeOnSignin=(o=e.forceUpgradeOnSignin)!==null&&o!==void 0?o:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var t,r,i,o,a,u;let h={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,h),this.validatePasswordCharacterOptions(e,h),h.isValid&&(h.isValid=(t=h.meetsMinPasswordLength)!==null&&t!==void 0?t:!0),h.isValid&&(h.isValid=(r=h.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),h.isValid&&(h.isValid=(i=h.containsLowercaseLetter)!==null&&i!==void 0?i:!0),h.isValid&&(h.isValid=(o=h.containsUppercaseLetter)!==null&&o!==void 0?o:!0),h.isValid&&(h.isValid=(a=h.containsNumericCharacter)!==null&&a!==void 0?a:!0),h.isValid&&(h.isValid=(u=h.containsNonAlphanumericCharacter)!==null&&u!==void 0?u:!0),h}validatePasswordLengthOptions(e,t){let r=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),i&&(t.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let i=0;i<e.length;i++)r=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,i,o){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=o))}};var Uo=class{constructor(e,t,r,i){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Ti(this),this.idTokenSubscription=new Ti(this),this.beforeStateQueue=new Mo(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=mh,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=et(t)),this._initializationPromise=this.queue(async()=>{var r,i;if(!this._deleted&&(this.persistenceManager=await Ei.create(this,e),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((i=this.currentUser)===null||i===void 0?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;let e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{let t=await vh(this,{idToken:e}),r=await cn._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(Me(this.app)){let a=this.app.settings.authIdToken;return a?new Promise(u=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(a).then(u,u))}):this.directlySetCurrentUser(null)}let r=await this.assertedPersistence.getCurrentUser(),i=r,o=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();let a=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,u=i==null?void 0:i._redirectEventId,h=await this.tryRedirectSignIn(e);(!a||a===u)&&(h!=null&&h.user)&&(i=h.user,o=!0)}if(!i)return this.directlySetCurrentUser(null);if(!i._redirectEventId){if(o)try{await this.beforeStateQueue.runMiddleware(i)}catch(a){i=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(a))}return i?this.reloadAndSetCurrentUserOrClear(i):this.directlySetCurrentUser(null)}return V(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===i._redirectEventId?this.directlySetCurrentUser(i):this.reloadAndSetCurrentUserOrClear(i)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await Ii(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=zm()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Me(this.app))return Promise.reject(tt(this));let t=e?ee(e):null;return t&&V(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&V(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Me(this.app)?Promise.reject(tt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Me(this.app)?Promise.reject(tt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(et(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();let t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){let e=await ng(this),t=new Fo(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new Ze("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{let r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){let t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await Xm(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){let r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){let t=e&&et(e)||this._popupRedirectResolver;V(t,this,"argument-error"),this.redirectPersistenceManager=await Ei.create(this,[et(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);let r=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,i){if(this._deleted)return()=>{};let o=typeof t=="function"?t:t.next.bind(t),a=!1,u=this._isInitialized?Promise.resolve():this._initializationPromise;if(V(u,this,"internal-error"),u.then(()=>{a||o(this.currentUser)}),typeof t=="function"){let h=e.addObserver(t,r,i);return()=>{a=!0,h()}}else{let h=e.addObserver(t);return()=>{a=!0,h()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return V(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Dh(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;let t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);let r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(t["X-Firebase-Client"]=r);let i=await this._getAppCheckToken();return i&&(t["X-Firebase-AppCheck"]=i),t}async _getAppCheckToken(){var e;let t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t!=null&&t.error&&qm(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}};function yt(n){return ee(n)}var Ti=class{constructor(e){this.auth=e,this.observer=null,this.addObserver=Ll(t=>this.observer=t)}get next(){return V(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}};var Bi={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function ig(n){Bi=n}function Nh(n){return Bi.loadJS(n)}function sg(){return Bi.recaptchaEnterpriseScript}function og(){return Bi.gapiScript}function kh(n){return`__${n}${Math.floor(Math.random()*1e6)}`}var ag="recaptcha-enterprise",cg="NO_RECAPTCHA",qo=class{constructor(e){this.type=ag,this.auth=yt(e)}async verify(e="verify",t=!1){async function r(o){if(!t){if(o.tenantId==null&&o._agentRecaptchaConfig!=null)return o._agentRecaptchaConfig.siteKey;if(o.tenantId!=null&&o._tenantRecaptchaConfigs[o.tenantId]!==void 0)return o._tenantRecaptchaConfigs[o.tenantId].siteKey}return new Promise(async(a,u)=>{Hm(o,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(h=>{if(h.recaptchaKey===void 0)u(new Error("recaptcha Enterprise site key undefined"));else{let d=new xo(h);return o.tenantId==null?o._agentRecaptchaConfig=d:o._tenantRecaptchaConfigs[o.tenantId]=d,a(d.siteKey)}}).catch(h=>{u(h)})})}function i(o,a,u){let h=window.grecaptcha;Xl(h)?h.enterprise.ready(()=>{h.enterprise.execute(o,{action:e}).then(d=>{a(d)}).catch(()=>{a(cg)})}):u(Error("No reCAPTCHA enterprise script loaded."))}return new Promise((o,a)=>{r(this.auth).then(u=>{if(!t&&Xl(window.grecaptcha))i(u,o,a);else{if(typeof window=="undefined"){a(new Error("RecaptchaVerifier is only supported in browser"));return}let h=sg();h.length!==0&&(h+=u),Nh(h).then(()=>{i(u,o,a)}).catch(d=>{a(d)})}}).catch(u=>{a(u)})})}};async function nh(n,e,t,r=!1){let i=new qo(n),o;try{o=await i.verify(t)}catch{o=await i.verify(t,!0)}let a=Object.assign({},e);return r?Object.assign(a,{captchaResp:o}):Object.assign(a,{captchaResponse:o}),Object.assign(a,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(a,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),a}async function Bo(n,e,t,r){var i;if(!((i=n._getRecaptchaConfig())===null||i===void 0)&&i.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){let o=await nh(n,e,t,t==="getOobCode");return r(n,o)}else return r(n,e).catch(async o=>{if(o.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);let a=await nh(n,e,t,t==="getOobCode");return r(n,a)}else return Promise.reject(o)})}function Oh(n,e){let t=tr(n,"auth");if(t.isInitialized()){let i=t.getImmediate(),o=t.getOptions();if(ht(o,e!=null?e:{}))return i;Fe(i,"already-initialized")}return t.initialize({options:e})}function ug(n,e){let t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(et);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function xh(n,e,t){let r=yt(n);V(r._canInitEmulator,r,"emulator-config-failed"),V(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");let i=!!(t!=null&&t.disableWarnings),o=Vh(e),{host:a,port:u}=lg(e),h=u===null?"":`:${u}`;r.config.emulator={url:`${o}//${a}${h}/`},r.settings.appVerificationDisabledForTesting=!0,r.emulatorConfig=Object.freeze({host:a,port:u,protocol:o.replace(":",""),options:Object.freeze({disableWarnings:i})}),i||hg()}function Vh(n){let e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function lg(n){let e=Vh(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};let r=t[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(r);if(i){let o=i[1];return{host:o,port:rh(r.substr(o.length+1))}}else{let[o,a]=r.split(":");return{host:o,port:rh(a)}}}function rh(n){if(!n)return null;let e=Number(n);return isNaN(e)?null:e}function hg(){function n(){let e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console!="undefined"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window!="undefined"&&typeof document!="undefined"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}var Vt=class{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return Be("not implemented")}_getIdTokenResponse(e){return Be("not implemented")}_linkToIdToken(e,t){return Be("not implemented")}_getReauthenticationResolver(e){return Be("not implemented")}};async function dg(n,e){return he(n,"POST","/v1/accounts:signUp",e)}async function fg(n,e){return _t(n,"POST","/v1/accounts:signInWithPassword",ce(n,e))}async function pg(n,e){return _t(n,"POST","/v1/accounts:signInWithEmailLink",ce(n,e))}async function mg(n,e){return _t(n,"POST","/v1/accounts:signInWithEmailLink",ce(n,e))}var or=class n extends Vt{constructor(e,t,r,i=null){super("password",r),this._email=e,this._password=t,this._tenantId=i}static _fromEmailAndPassword(e,t){return new n(e,t,"password")}static _fromEmailAndCode(e,t,r=null){return new n(e,t,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){let t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":let t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Bo(e,t,"signInWithPassword",fg);case"emailLink":return pg(e,{email:this._email,oobCode:this._password});default:Fe(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":let r={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Bo(e,r,"signUpPassword",dg);case"emailLink":return mg(e,{idToken:t,email:this._email,oobCode:this._password});default:Fe(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}};async function on(n,e){return _t(n,"POST","/v1/accounts:signInWithIdp",ce(n,e))}var gg="http://localhost",Lt=class n extends Vt{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){let t=new n(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):Fe("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){let t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i}=t,o=di(t,["providerId","signInMethod"]);if(!r||!i)return null;let a=new n(r,i);return a.idToken=o.idToken||void 0,a.accessToken=o.accessToken||void 0,a.secret=o.secret,a.nonce=o.nonce,a.pendingToken=o.pendingToken||null,a}_getIdTokenResponse(e){let t=this.buildRequest();return on(e,t)}_linkToIdToken(e,t){let r=this.buildRequest();return r.idToken=t,on(e,r)}_getReauthenticationResolver(e){let t=this.buildRequest();return t.autoCreate=!1,on(e,t)}buildRequest(){let e={requestUri:gg,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{let t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=nn(t)}return e}};async function _g(n,e){return he(n,"POST","/v1/accounts:sendVerificationCode",ce(n,e))}async function yg(n,e){return _t(n,"POST","/v1/accounts:signInWithPhoneNumber",ce(n,e))}async function vg(n,e){let t=await _t(n,"POST","/v1/accounts:signInWithPhoneNumber",ce(n,e));if(t.temporaryProof)throw nr(n,"account-exists-with-different-credential",t);return t}var Ig={USER_NOT_FOUND:"user-not-found"};async function wg(n,e){let t=Object.assign(Object.assign({},e),{operation:"REAUTH"});return _t(n,"POST","/v1/accounts:signInWithPhoneNumber",ce(n,t),Ig)}var ar=class n extends Vt{constructor(e){super("phone","phone"),this.params=e}static _fromVerification(e,t){return new n({verificationId:e,verificationCode:t})}static _fromTokenResponse(e,t){return new n({phoneNumber:e,temporaryProof:t})}_getIdTokenResponse(e){return yg(e,this._makeVerificationRequest())}_linkToIdToken(e,t){return vg(e,Object.assign({idToken:t},this._makeVerificationRequest()))}_getReauthenticationResolver(e){return wg(e,this._makeVerificationRequest())}_makeVerificationRequest(){let{temporaryProof:e,phoneNumber:t,verificationId:r,verificationCode:i}=this.params;return e&&t?{temporaryProof:e,phoneNumber:t}:{sessionInfo:r,code:i}}toJSON(){let e={providerId:this.providerId};return this.params.phoneNumber&&(e.phoneNumber=this.params.phoneNumber),this.params.temporaryProof&&(e.temporaryProof=this.params.temporaryProof),this.params.verificationCode&&(e.verificationCode=this.params.verificationCode),this.params.verificationId&&(e.verificationId=this.params.verificationId),e}static fromJSON(e){typeof e=="string"&&(e=JSON.parse(e));let{verificationId:t,verificationCode:r,phoneNumber:i,temporaryProof:o}=e;return!r&&!t&&!i&&!o?null:new n({verificationId:t,verificationCode:r,phoneNumber:i,temporaryProof:o})}};function Eg(n){switch(n){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function Tg(n){let e=rn(sn(n)).link,t=e?rn(sn(e)).deep_link_id:null,r=rn(sn(n)).deep_link_id;return(r?rn(sn(r)).link:null)||r||t||e||n}var Ai=class n{constructor(e){var t,r,i,o,a,u;let h=rn(sn(e)),d=(t=h.apiKey)!==null&&t!==void 0?t:null,p=(r=h.oobCode)!==null&&r!==void 0?r:null,y=Eg((i=h.mode)!==null&&i!==void 0?i:null);V(d&&p&&y,"argument-error"),this.apiKey=d,this.operation=y,this.code=p,this.continueUrl=(o=h.continueUrl)!==null&&o!==void 0?o:null,this.languageCode=(a=h.languageCode)!==null&&a!==void 0?a:null,this.tenantId=(u=h.tenantId)!==null&&u!==void 0?u:null}static parseLink(e){let t=Tg(e);try{return new n(t)}catch{return null}}};var Mt=class n{constructor(){this.providerId=n.PROVIDER_ID}static credential(e,t){return or._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){let r=Ai.parseLink(t);return V(r,"argument-error"),or._fromEmailAndCode(e,r.code,r.tenantId)}};Mt.PROVIDER_ID="password";Mt.EMAIL_PASSWORD_SIGN_IN_METHOD="password";Mt.EMAIL_LINK_SIGN_IN_METHOD="emailLink";var bi=class{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}};var Ft=class extends bi{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}};var cr=class n extends Ft{constructor(){super("facebook.com")}static credential(e){return Lt._fromParams({providerId:n.PROVIDER_ID,signInMethod:n.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return n.credentialFromTaggedObject(e)}static credentialFromError(e){return n.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return n.credential(e.oauthAccessToken)}catch{return null}}};cr.FACEBOOK_SIGN_IN_METHOD="facebook.com";cr.PROVIDER_ID="facebook.com";var ur=class n extends Ft{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return Lt._fromParams({providerId:n.PROVIDER_ID,signInMethod:n.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return n.credentialFromTaggedObject(e)}static credentialFromError(e){return n.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return n.credential(t,r)}catch{return null}}};ur.GOOGLE_SIGN_IN_METHOD="google.com";ur.PROVIDER_ID="google.com";var lr=class n extends Ft{constructor(){super("github.com")}static credential(e){return Lt._fromParams({providerId:n.PROVIDER_ID,signInMethod:n.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return n.credentialFromTaggedObject(e)}static credentialFromError(e){return n.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return n.credential(e.oauthAccessToken)}catch{return null}}};lr.GITHUB_SIGN_IN_METHOD="github.com";lr.PROVIDER_ID="github.com";var hr=class n extends Ft{constructor(){super("twitter.com")}static credential(e,t){return Lt._fromParams({providerId:n.PROVIDER_ID,signInMethod:n.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return n.credentialFromTaggedObject(e)}static credentialFromError(e){return n.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return n.credential(t,r)}catch{return null}}};hr.TWITTER_SIGN_IN_METHOD="twitter.com";hr.PROVIDER_ID="twitter.com";async function Ag(n,e){return _t(n,"POST","/v1/accounts:signUp",ce(n,e))}var un=class n{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,i=!1){let o=await cn._fromIdTokenResponse(e,r,i),a=ih(r);return new n({user:o,providerId:a,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);let i=ih(r);return new n({user:e,providerId:i,_tokenResponse:r,operationType:t})}};function ih(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}var jo=class n extends Re{constructor(e,t,r,i){var o;super(t.code,t.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,n.prototype),this.customData={appName:e.name,tenantId:(o=e.tenantId)!==null&&o!==void 0?o:void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,i){return new n(e,t,r,i)}};function Lh(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(o=>{throw o.code==="auth/multi-factor-auth-required"?jo._fromErrorAndOperation(n,o,e,r):o})}async function bg(n,e,t=!1){let r=await an(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return un._forOperation(n,"link",r)}async function Sg(n,e,t=!1){let{auth:r}=n;if(Me(r.app))return Promise.reject(tt(r));let i="reauthenticate";try{let o=await an(n,Lh(r,i,e,n),t);V(o.idToken,r,"internal-error");let a=Zo(o.idToken);V(a,r,"internal-error");let{sub:u}=a;return V(n.uid===u,r,"user-mismatch"),un._forOperation(n,i,o)}catch(o){throw(o==null?void 0:o.code)==="auth/user-not-found"&&Fe(r,"user-mismatch"),o}}async function Mh(n,e,t=!1){if(Me(n.app))return Promise.reject(tt(n));let r="signIn",i=await Lh(n,r,e),o=await un._fromIdTokenResponse(n,r,i);return t||await n._updateCurrentUser(o.user),o}async function Fh(n,e){return Mh(yt(n),e)}async function Uh(n){let e=yt(n);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function ta(n,e,t){if(Me(n.app))return Promise.reject(tt(n));let r=yt(n),a=await Bo(r,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",Ag).catch(h=>{throw h.code==="auth/password-does-not-meet-requirements"&&Uh(n),h}),u=await un._fromIdTokenResponse(r,"signIn",a);return await r._updateCurrentUser(u.user),u}function na(n,e,t){return Me(n.app)?Promise.reject(tt(n)):Fh(ee(n),Mt.credential(e,t)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&Uh(n),r})}async function Rg(n,e){return he(n,"POST","/v1/accounts:update",e)}async function ra(n,{displayName:e,photoURL:t}){if(e===void 0&&t===void 0)return;let r=ee(n),o={idToken:await r.getIdToken(),displayName:e,photoUrl:t,returnSecureToken:!0},a=await an(r,Rg(r.auth,o));r.displayName=a.displayName||null,r.photoURL=a.photoUrl||null;let u=r.providerData.find(({providerId:h})=>h==="password");u&&(u.displayName=r.displayName,u.photoURL=r.photoURL),await r._updateTokensIfNecessary(a)}function qh(n,e,t,r){return ee(n).onIdTokenChanged(e,t,r)}function Bh(n,e,t){return ee(n).beforeAuthStateChanged(e,t)}function ia(n,e,t,r){return ee(n).onAuthStateChanged(e,t,r)}function sa(n){return ee(n).signOut()}function Pg(n,e){return he(n,"POST","/v2/accounts/mfaEnrollment:start",ce(n,e))}function Cg(n,e){return he(n,"POST","/v2/accounts/mfaEnrollment:finalize",ce(n,e))}function Dg(n,e){return he(n,"POST","/v2/accounts/mfaEnrollment:start",ce(n,e))}function Ng(n,e){return he(n,"POST","/v2/accounts/mfaEnrollment:finalize",ce(n,e))}var Si="__sak";var Ri=class{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Si,"1"),this.storage.removeItem(Si),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){let t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}};function kg(){let n=ae();return ea(n)||qi(n)}var Og=1e3,xg=10,Pi=class extends Ri{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.safariLocalStorageNotSynced=kg()&&tg(),this.fallbackToPolling=Ch(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(let t of Object.keys(this.listeners)){let r=this.storage.getItem(t),i=this.localCache[t];r!==i&&e(t,i,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((a,u,h)=>{this.notifyListeners(a,h)});return}let r=e.key;if(t?this.detachListener():this.stopPolling(),this.safariLocalStorageNotSynced){let a=this.storage.getItem(r);if(e.newValue!==a)e.newValue!==null?this.storage.setItem(r,e.newValue):this.storage.removeItem(r);else if(this.localCache[r]===e.newValue&&!t)return}let i=()=>{let a=this.storage.getItem(r);!t&&this.localCache[r]===a||this.notifyListeners(r,a)},o=this.storage.getItem(r);eg()&&o!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,xg):i()}notifyListeners(e,t){this.localCache[e]=t;let r=this.listeners[e];if(r)for(let i of Array.from(r))i(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},Og)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){let t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}};Pi.type="LOCAL";var jh=Pi;var Ci=class extends Ri{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}};Ci.type="SESSION";var oa=Ci;function Vg(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}var Di=class n{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){let t=this.receivers.find(i=>i.isListeningto(e));if(t)return t;let r=new n(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){let t=e,{eventId:r,eventType:i,data:o}=t.data,a=this.handlersMap[i];if(!(a!=null&&a.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:i});let u=Array.from(a).map(async d=>d(t.origin,o)),h=await Vg(u);t.ports[0].postMessage({status:"done",eventId:r,eventType:i,response:h})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}};Di.receivers=[];function aa(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}var zo=class{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){let i=typeof MessageChannel!="undefined"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let o,a;return new Promise((u,h)=>{let d=aa("",20);i.port1.start();let p=setTimeout(()=>{h(new Error("unsupported_event"))},r);a={messageChannel:i,onMessage(y){let T=y;if(T.data.eventId===d)switch(T.data.status){case"ack":clearTimeout(p),o=setTimeout(()=>{h(new Error("timeout"))},3e3);break;case"done":clearTimeout(o),u(T.data.response);break;default:clearTimeout(p),clearTimeout(o),h(new Error("invalid_response"));break}}},this.handlers.add(a),i.port1.addEventListener("message",a.onMessage),this.target.postMessage({eventType:e,eventId:d,data:t},[i.port2])}).finally(()=>{a&&this.removeMessageHandler(a)})}};function ze(){return window}function Lg(n){ze().location.href=n}function zh(){return typeof ze().WorkerGlobalScope!="undefined"&&typeof ze().importScripts=="function"}async function Mg(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function Fg(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)===null||n===void 0?void 0:n.controller)||null}function Ug(){return zh()?self:null}var Gh="firebaseLocalStorageDb",qg=1,Ni="firebaseLocalStorage",Kh="fbase_key",Ut=class{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}};function ji(n,e){return n.transaction([Ni],e?"readwrite":"readonly").objectStore(Ni)}function Bg(){let n=indexedDB.deleteDatabase(Gh);return new Ut(n).toPromise()}function Go(){let n=indexedDB.open(Gh,qg);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{let r=n.result;try{r.createObjectStore(Ni,{keyPath:Kh})}catch(i){t(i)}}),n.addEventListener("success",async()=>{let r=n.result;r.objectStoreNames.contains(Ni)?e(r):(r.close(),await Bg(),e(await Go()))})})}async function sh(n,e,t){let r=ji(n,!0).put({[Kh]:e,value:t});return new Ut(r).toPromise()}async function jg(n,e){let t=ji(n,!1).get(e),r=await new Ut(t).toPromise();return r===void 0?null:r.value}function oh(n,e){let t=ji(n,!0).delete(e);return new Ut(t).toPromise()}var zg=800,Gg=3,ki=class{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Go(),this.db)}async _withRetries(e){let t=0;for(;;)try{let r=await this._openDb();return await e(r)}catch(r){if(t++>Gg)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return zh()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Di._getInstance(Ug()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await Mg(),!this.activeServiceWorker)return;this.sender=new zo(this.activeServiceWorker);let r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((t=r[0])===null||t===void 0)&&t.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||Fg()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;let e=await Go();return await sh(e,Si,"1"),await oh(e,Si),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>sh(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){let t=await this._withRetries(r=>jg(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>oh(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){let e=await this._withRetries(i=>{let o=ji(i,!1).getAll();return new Ut(o).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];let t=[],r=new Set;if(e.length!==0)for(let{fbase_key:i,value:o}of e)r.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(o)&&(this.notifyListeners(i,o),t.push(i));for(let i of Object.keys(this.localCache))this.localCache[i]&&!r.has(i)&&(this.notifyListeners(i,null),t.push(i));return t}notifyListeners(e,t){this.localCache[e]=t;let r=this.listeners[e];if(r)for(let i of Array.from(r))i(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),zg)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}};ki.type="LOCAL";var $h=ki;function Kg(n,e){return he(n,"POST","/v2/accounts/mfaSignIn:start",ce(n,e))}function $g(n,e){return he(n,"POST","/v2/accounts/mfaSignIn:finalize",ce(n,e))}function Hg(n,e){return he(n,"POST","/v2/accounts/mfaSignIn:finalize",ce(n,e))}var eI=kh("rcb"),tI=new xt(3e4,6e4);var Wg="recaptcha";async function Qg(n,e,t){var r;let i=await t.verify();try{V(typeof i=="string",n,"argument-error"),V(t.type===Wg,n,"argument-error");let o;if(typeof e=="string"?o={phoneNumber:e}:o=e,"session"in o){let a=o.session;if("phoneNumber"in o)return V(a.type==="enroll",n,"internal-error"),(await Pg(n,{idToken:a.credential,phoneEnrollmentInfo:{phoneNumber:o.phoneNumber,recaptchaToken:i}})).phoneSessionInfo.sessionInfo;{V(a.type==="signin",n,"internal-error");let u=((r=o.multiFactorHint)===null||r===void 0?void 0:r.uid)||o.multiFactorUid;return V(u,n,"missing-multi-factor-info"),(await Kg(n,{mfaPendingCredential:a.credential,mfaEnrollmentId:u,phoneSignInInfo:{recaptchaToken:i}})).phoneResponseInfo.sessionInfo}}else{let{sessionInfo:a}=await _g(n,{phoneNumber:o.phoneNumber,recaptchaToken:i});return a}}finally{t._reset()}}var dr=class n{constructor(e){this.providerId=n.PROVIDER_ID,this.auth=yt(e)}verifyPhoneNumber(e,t){return Qg(this.auth,e,ee(t))}static credential(e,t){return ar._fromVerification(e,t)}static credentialFromResult(e){let t=e;return n.credentialFromTaggedObject(t)}static credentialFromError(e){return n.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{phoneNumber:t,temporaryProof:r}=e;return t&&r?ar._fromTokenResponse(t,r):null}};dr.PROVIDER_ID="phone";dr.PHONE_SIGN_IN_METHOD="phone";function Jg(n,e){return e?et(e):(V(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}var fr=class extends Vt{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return on(e,this._buildIdpRequest())}_linkToIdToken(e,t){return on(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return on(e,this._buildIdpRequest())}_buildIdpRequest(e){let t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}};function Yg(n){return Mh(n.auth,new fr(n),n.bypassAuthState)}function Xg(n){let{auth:e,user:t}=n;return V(t,e,"internal-error"),Sg(t,new fr(n),n.bypassAuthState)}async function Zg(n){let{auth:e,user:t}=n;return V(t,e,"internal-error"),bg(t,new fr(n),n.bypassAuthState)}var Oi=class{constructor(e,t,r,i,o=!1){this.auth=e,this.resolver=r,this.user=i,this.bypassAuthState=o,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){let{urlResponse:t,sessionId:r,postBody:i,tenantId:o,error:a,type:u}=e;if(a){this.reject(a);return}let h={auth:this.auth,requestUri:t,sessionId:r,tenantId:o||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(u)(h))}catch(d){this.reject(d)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return Yg;case"linkViaPopup":case"linkViaRedirect":return Zg;case"reauthViaPopup":case"reauthViaRedirect":return Xg;default:Fe(this.auth,"internal-error")}}resolve(e){nt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){nt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}};var e_=new xt(2e3,1e4);var Ko=class n extends Oi{constructor(e,t,r,i,o){super(e,t,i,o),this.provider=r,this.authWindow=null,this.pollId=null,n.currentPopupAction&&n.currentPopupAction.cancel(),n.currentPopupAction=this}async executeNotNull(){let e=await this.execute();return V(e,this.auth,"internal-error"),e}async onExecution(){nt(this.filter.length===1,"Popup operations only handle one event");let e=aa();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(je(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(je(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,n.currentPopupAction=null}pollUserCancellation(){let e=()=>{var t,r;if(!((r=(t=this.authWindow)===null||t===void 0?void 0:t.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(je(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,e_.get())};e()}};Ko.currentPopupAction=null;var t_="pendingRedirect",gi=new Map,$o=class extends Oi{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=gi.get(this.auth._key());if(!e){try{let r=await n_(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}gi.set(this.auth._key(),e)}return this.bypassAuthState||gi.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){let t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}};async function n_(n,e){let t=s_(e),r=i_(n);if(!await r._isAvailable())return!1;let i=await r._get(t)==="true";return await r._remove(t),i}function r_(n,e){gi.set(n._key(),e)}function i_(n){return et(n._redirectPersistence)}function s_(n){return mi(t_,n.config.apiKey,n.name)}async function o_(n,e,t=!1){if(Me(n.app))return Promise.reject(tt(n));let r=yt(n),i=Jg(r,e),a=await new $o(r,i,t).execute();return a&&!t&&(delete a.user._redirectEventId,await r._persistUserIfCurrent(a.user),await r._setRedirectUser(null,e)),a}var a_=10*60*1e3,Ho=class{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!c_(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!Hh(e)){let i=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";t.onError(je(this.auth,i))}else t.onAuthEvent(e)}isEventForConsumer(e,t){let r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=a_&&this.cachedEventUids.clear(),this.cachedEventUids.has(ah(e))}saveEventToCache(e){this.cachedEventUids.add(ah(e)),this.lastProcessedEventTime=Date.now()}};function ah(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function Hh({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function c_(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Hh(n);default:return!1}}async function u_(n,e={}){return he(n,"GET","/v1/projects",e)}var l_=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,h_=/^https?/;async function d_(n){if(n.config.emulator)return;let{authorizedDomains:e}=await u_(n);for(let t of e)try{if(f_(t))return}catch{}Fe(n,"unauthorized-domain")}function f_(n){let e=ko(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){let a=new URL(n);return a.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&a.hostname===r}if(!h_.test(t))return!1;if(l_.test(n))return r===n;let i=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(r)}var p_=new xt(3e4,6e4);function ch(){let n=ze().___jsl;if(n!=null&&n.H){for(let e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function m_(n){return new Promise((e,t)=>{var r,i,o;function a(){ch(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{ch(),t(je(n,"network-request-failed"))},timeout:p_.get()})}if(!((i=(r=ze().gapi)===null||r===void 0?void 0:r.iframes)===null||i===void 0)&&i.Iframe)e(gapi.iframes.getContext());else if(!((o=ze().gapi)===null||o===void 0)&&o.load)a();else{let u=kh("iframefcb");return ze()[u]=()=>{gapi.load?a():t(je(n,"network-request-failed"))},Nh(`${og()}?onload=${u}`).catch(h=>t(h))}}).catch(e=>{throw _i=null,e})}var _i=null;function g_(n){return _i=_i||m_(n),_i}var __=new xt(5e3,15e3),y_="__/auth/iframe",v_="emulator/auth/iframe",I_={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},w_=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function E_(n){let e=n.config;V(e.authDomain,n,"auth-domain-config-required");let t=e.emulator?Xo(e,v_):`https://${n.config.authDomain}/${y_}`,r={apiKey:e.apiKey,appName:n.name,v:mt},i=w_.get(n.config.apiHost);i&&(r.eid=i);let o=n._getFrameworks();return o.length&&(r.fw=o.join(",")),`${t}?${nn(r).slice(1)}`}async function T_(n){let e=await g_(n),t=ze().gapi;return V(t,n,"internal-error"),e.open({where:document.body,url:E_(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:I_,dontclear:!0},r=>new Promise(async(i,o)=>{await r.restyle({setHideOnLeave:!1});let a=je(n,"network-request-failed"),u=ze().setTimeout(()=>{o(a)},__.get());function h(){ze().clearTimeout(u),i(r)}r.ping(h).then(h,()=>{o(a)})}))}var A_={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},b_=500,S_=600,R_="_blank",P_="http://localhost",xi=class{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}};function C_(n,e,t,r=b_,i=S_){let o=Math.max((window.screen.availHeight-i)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString(),u="",h=Object.assign(Object.assign({},A_),{width:r.toString(),height:i.toString(),top:o,left:a}),d=ae().toLowerCase();t&&(u=Ah(d)?R_:t),Th(d)&&(e=e||P_,h.scrollbars="yes");let p=Object.entries(h).reduce((T,[R,k])=>`${T}${R}=${k},`,"");if(Zm(d)&&u!=="_self")return D_(e||"",u),new xi(null);let y=window.open(e||"",u,p);V(y,n,"popup-blocked");try{y.focus()}catch{}return new xi(y)}function D_(n,e){let t=document.createElement("a");t.href=n,t.target=e;let r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}var N_="__/auth/handler",k_="emulator/auth/handler",O_=encodeURIComponent("fac");async function uh(n,e,t,r,i,o){V(n.config.authDomain,n,"auth-domain-config-required"),V(n.config.apiKey,n,"invalid-api-key");let a={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:mt,eventId:i};if(e instanceof bi){e.setDefaultLanguage(n.languageCode),a.providerId=e.providerId||"",Vl(e.getCustomParameters())||(a.customParameters=JSON.stringify(e.getCustomParameters()));for(let[p,y]of Object.entries(o||{}))a[p]=y}if(e instanceof Ft){let p=e.getScopes().filter(y=>y!=="");p.length>0&&(a.scopes=p.join(","))}n.tenantId&&(a.tid=n.tenantId);let u=a;for(let p of Object.keys(u))u[p]===void 0&&delete u[p];let h=await n._getAppCheckToken(),d=h?`#${O_}=${encodeURIComponent(h)}`:"";return`${x_(n)}?${nn(u).slice(1)}${d}`}function x_({config:n}){return n.emulator?Xo(n,k_):`https://${n.authDomain}/${N_}`}var No="webStorageSupport",Wo=class{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=oa,this._completeRedirectFn=o_,this._overrideRedirectResult=r_}async _openPopup(e,t,r,i){var o;nt((o=this.eventManagers[e._key()])===null||o===void 0?void 0:o.manager,"_initialize() not called before _openPopup()");let a=await uh(e,t,r,ko(),i);return C_(e,a,aa())}async _openRedirect(e,t,r,i){await this._originValidation(e);let o=await uh(e,t,r,ko(),i);return Lg(o),new Promise(()=>{})}_initialize(e){let t=e._key();if(this.eventManagers[t]){let{manager:i,promise:o}=this.eventManagers[t];return i?Promise.resolve(i):(nt(o,"If manager is not set, promise should be"),o)}let r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){let t=await T_(e),r=new Ho(e);return t.register("authEvent",i=>(V(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:r.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(No,{type:No},i=>{var o;let a=(o=i==null?void 0:i[0])===null||o===void 0?void 0:o[No];a!==void 0&&t(!!a),Fe(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){let t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=d_(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Ch()||ea()||qi()}},Wh=Wo,Vi=class{constructor(e){this.factorId=e}_process(e,t,r){switch(t.type){case"enroll":return this._finalizeEnroll(e,t.credential,r);case"signin":return this._finalizeSignIn(e,t.credential);default:return Be("unexpected MultiFactorSessionType")}}},Qo=class n extends Vi{constructor(e){super("phone"),this.credential=e}static _fromCredential(e){return new n(e)}_finalizeEnroll(e,t,r){return Cg(e,{idToken:t,displayName:r,phoneVerificationInfo:this.credential._makeVerificationRequest()})}_finalizeSignIn(e,t){return $g(e,{mfaPendingCredential:t,phoneVerificationInfo:this.credential._makeVerificationRequest()})}},Li=class{constructor(){}static assertion(e){return Qo._fromCredential(e)}};Li.FACTOR_ID="phone";var Mi=class{static assertionForEnrollment(e,t){return Fi._fromSecret(e,t)}static assertionForSignIn(e,t){return Fi._fromEnrollmentId(e,t)}static async generateSecret(e){var t;let r=e;V(typeof((t=r.user)===null||t===void 0?void 0:t.auth)!="undefined","internal-error");let i=await Dg(r.user.auth,{idToken:r.credential,totpEnrollmentInfo:{}});return Ui._fromStartTotpMfaEnrollmentResponse(i,r.user.auth)}};Mi.FACTOR_ID="totp";var Fi=class n extends Vi{constructor(e,t,r){super("totp"),this.otp=e,this.enrollmentId=t,this.secret=r}static _fromSecret(e,t){return new n(t,void 0,e)}static _fromEnrollmentId(e,t){return new n(t,e)}async _finalizeEnroll(e,t,r){return V(typeof this.secret!="undefined",e,"argument-error"),Ng(e,{idToken:t,displayName:r,totpVerificationInfo:this.secret._makeTotpVerificationInfo(this.otp)})}async _finalizeSignIn(e,t){V(this.enrollmentId!==void 0&&this.otp!==void 0,e,"argument-error");let r={verificationCode:this.otp};return Hg(e,{mfaPendingCredential:t,mfaEnrollmentId:this.enrollmentId,totpVerificationInfo:r})}},Ui=class n{constructor(e,t,r,i,o,a,u){this.sessionInfo=a,this.auth=u,this.secretKey=e,this.hashingAlgorithm=t,this.codeLength=r,this.codeIntervalSeconds=i,this.enrollmentCompletionDeadline=o}static _fromStartTotpMfaEnrollmentResponse(e,t){return new n(e.totpSessionInfo.sharedSecretKey,e.totpSessionInfo.hashingAlgorithm,e.totpSessionInfo.verificationCodeLength,e.totpSessionInfo.periodSec,new Date(e.totpSessionInfo.finalizeEnrollmentTime).toUTCString(),e.totpSessionInfo.sessionInfo,t)}_makeTotpVerificationInfo(e){return{sessionInfo:this.sessionInfo,verificationCode:e}}generateQrCodeUrl(e,t){var r;let i=!1;return(fi(e)||fi(t))&&(i=!0),i&&(fi(e)&&(e=((r=this.auth.currentUser)===null||r===void 0?void 0:r.email)||"unknownuser"),fi(t)&&(t=this.auth.name)),`otpauth://totp/${t}:${e}?secret=${this.secretKey}&issuer=${t}&algorithm=${this.hashingAlgorithm}&digits=${this.codeLength}`}};function fi(n){return typeof n=="undefined"||(n==null?void 0:n.length)===0}var lh="@firebase/auth",hh="1.7.4";var Jo=class{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;let t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();let t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){V(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}};function V_(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function L_(n){pt(new Ne("auth",(e,{options:t})=>{let r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),o=e.getProvider("app-check-internal"),{apiKey:a,authDomain:u}=r.options;V(a&&!a.includes(":"),"invalid-api-key",{appName:r.name});let h={apiKey:a,authDomain:u,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Dh(n)},d=new Uo(r,i,o,h);return ug(d,t),d},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),pt(new Ne("auth-internal",e=>{let t=yt(e.getProvider("auth").getImmediate());return(r=>new Jo(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),Le(lh,hh,V_(n)),Le(lh,hh,"esm2017")}var M_=5*60,F_=ho("authIdTokenMaxAge")||M_,dh=null,U_=n=>async e=>{let t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>F_)return;let i=t==null?void 0:t.token;dh!==i&&(dh=i,await fetch(n,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function ca(n=Co()){let e=tr(n,"auth");if(e.isInitialized())return e.getImmediate();let t=Oh(n,{popupRedirectResolver:Wh,persistence:[$h,jh,oa]}),r=ho("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){let o=new URL(r,location.origin);if(location.origin===o.origin){let a=U_(o.toString());Bh(t,a,()=>a(t.currentUser)),qh(t,u=>a(u))}}let i=Pl("auth");return i&&xh(t,`http://${i}`),t}function q_(){var n,e;return(e=(n=document.getElementsByTagName("head"))===null||n===void 0?void 0:n[0])!==null&&e!==void 0?e:document}ig({loadJS(n){return new Promise((e,t)=>{let r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=i=>{let o=je("internal-error");o.customData=i,t(o)},r.type="text/javascript",r.charset="UTF-8",q_().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});L_("Browser");var Qh=typeof globalThis!="undefined"?globalThis:typeof window!="undefined"?window:typeof global!="undefined"?global:typeof self!="undefined"?self:{},Jh={};var vt,ua;(function(){var n;function e(I,m){function _(){}_.prototype=m.prototype,I.D=m.prototype,I.prototype=new _,I.prototype.constructor=I,I.C=function(v,w,A){for(var g=Array(arguments.length-2),Je=2;Je<arguments.length;Je++)g[Je-2]=arguments[Je];return m.prototype[w].apply(v,g)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,t),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function i(I,m,_){_||(_=0);var v=Array(16);if(typeof m=="string")for(var w=0;16>w;++w)v[w]=m.charCodeAt(_++)|m.charCodeAt(_++)<<8|m.charCodeAt(_++)<<16|m.charCodeAt(_++)<<24;else for(w=0;16>w;++w)v[w]=m[_++]|m[_++]<<8|m[_++]<<16|m[_++]<<24;m=I.g[0],_=I.g[1],w=I.g[2];var A=I.g[3],g=m+(A^_&(w^A))+v[0]+3614090360&4294967295;m=_+(g<<7&4294967295|g>>>25),g=A+(w^m&(_^w))+v[1]+3905402710&4294967295,A=m+(g<<12&4294967295|g>>>20),g=w+(_^A&(m^_))+v[2]+606105819&4294967295,w=A+(g<<17&4294967295|g>>>15),g=_+(m^w&(A^m))+v[3]+3250441966&4294967295,_=w+(g<<22&4294967295|g>>>10),g=m+(A^_&(w^A))+v[4]+4118548399&4294967295,m=_+(g<<7&4294967295|g>>>25),g=A+(w^m&(_^w))+v[5]+1200080426&4294967295,A=m+(g<<12&4294967295|g>>>20),g=w+(_^A&(m^_))+v[6]+2821735955&4294967295,w=A+(g<<17&4294967295|g>>>15),g=_+(m^w&(A^m))+v[7]+4249261313&4294967295,_=w+(g<<22&4294967295|g>>>10),g=m+(A^_&(w^A))+v[8]+1770035416&4294967295,m=_+(g<<7&4294967295|g>>>25),g=A+(w^m&(_^w))+v[9]+2336552879&4294967295,A=m+(g<<12&4294967295|g>>>20),g=w+(_^A&(m^_))+v[10]+4294925233&4294967295,w=A+(g<<17&4294967295|g>>>15),g=_+(m^w&(A^m))+v[11]+2304563134&4294967295,_=w+(g<<22&4294967295|g>>>10),g=m+(A^_&(w^A))+v[12]+1804603682&4294967295,m=_+(g<<7&4294967295|g>>>25),g=A+(w^m&(_^w))+v[13]+4254626195&4294967295,A=m+(g<<12&4294967295|g>>>20),g=w+(_^A&(m^_))+v[14]+2792965006&4294967295,w=A+(g<<17&4294967295|g>>>15),g=_+(m^w&(A^m))+v[15]+1236535329&4294967295,_=w+(g<<22&4294967295|g>>>10),g=m+(w^A&(_^w))+v[1]+4129170786&4294967295,m=_+(g<<5&4294967295|g>>>27),g=A+(_^w&(m^_))+v[6]+3225465664&4294967295,A=m+(g<<9&4294967295|g>>>23),g=w+(m^_&(A^m))+v[11]+643717713&4294967295,w=A+(g<<14&4294967295|g>>>18),g=_+(A^m&(w^A))+v[0]+3921069994&4294967295,_=w+(g<<20&4294967295|g>>>12),g=m+(w^A&(_^w))+v[5]+3593408605&4294967295,m=_+(g<<5&4294967295|g>>>27),g=A+(_^w&(m^_))+v[10]+38016083&4294967295,A=m+(g<<9&4294967295|g>>>23),g=w+(m^_&(A^m))+v[15]+3634488961&4294967295,w=A+(g<<14&4294967295|g>>>18),g=_+(A^m&(w^A))+v[4]+3889429448&4294967295,_=w+(g<<20&4294967295|g>>>12),g=m+(w^A&(_^w))+v[9]+568446438&4294967295,m=_+(g<<5&4294967295|g>>>27),g=A+(_^w&(m^_))+v[14]+3275163606&4294967295,A=m+(g<<9&4294967295|g>>>23),g=w+(m^_&(A^m))+v[3]+4107603335&4294967295,w=A+(g<<14&4294967295|g>>>18),g=_+(A^m&(w^A))+v[8]+1163531501&4294967295,_=w+(g<<20&4294967295|g>>>12),g=m+(w^A&(_^w))+v[13]+2850285829&4294967295,m=_+(g<<5&4294967295|g>>>27),g=A+(_^w&(m^_))+v[2]+4243563512&4294967295,A=m+(g<<9&4294967295|g>>>23),g=w+(m^_&(A^m))+v[7]+1735328473&4294967295,w=A+(g<<14&4294967295|g>>>18),g=_+(A^m&(w^A))+v[12]+2368359562&4294967295,_=w+(g<<20&4294967295|g>>>12),g=m+(_^w^A)+v[5]+4294588738&4294967295,m=_+(g<<4&4294967295|g>>>28),g=A+(m^_^w)+v[8]+2272392833&4294967295,A=m+(g<<11&4294967295|g>>>21),g=w+(A^m^_)+v[11]+1839030562&4294967295,w=A+(g<<16&4294967295|g>>>16),g=_+(w^A^m)+v[14]+4259657740&4294967295,_=w+(g<<23&4294967295|g>>>9),g=m+(_^w^A)+v[1]+2763975236&4294967295,m=_+(g<<4&4294967295|g>>>28),g=A+(m^_^w)+v[4]+1272893353&4294967295,A=m+(g<<11&4294967295|g>>>21),g=w+(A^m^_)+v[7]+4139469664&4294967295,w=A+(g<<16&4294967295|g>>>16),g=_+(w^A^m)+v[10]+3200236656&4294967295,_=w+(g<<23&4294967295|g>>>9),g=m+(_^w^A)+v[13]+681279174&4294967295,m=_+(g<<4&4294967295|g>>>28),g=A+(m^_^w)+v[0]+3936430074&4294967295,A=m+(g<<11&4294967295|g>>>21),g=w+(A^m^_)+v[3]+3572445317&4294967295,w=A+(g<<16&4294967295|g>>>16),g=_+(w^A^m)+v[6]+76029189&4294967295,_=w+(g<<23&4294967295|g>>>9),g=m+(_^w^A)+v[9]+3654602809&4294967295,m=_+(g<<4&4294967295|g>>>28),g=A+(m^_^w)+v[12]+3873151461&4294967295,A=m+(g<<11&4294967295|g>>>21),g=w+(A^m^_)+v[15]+530742520&4294967295,w=A+(g<<16&4294967295|g>>>16),g=_+(w^A^m)+v[2]+3299628645&4294967295,_=w+(g<<23&4294967295|g>>>9),g=m+(w^(_|~A))+v[0]+4096336452&4294967295,m=_+(g<<6&4294967295|g>>>26),g=A+(_^(m|~w))+v[7]+1126891415&4294967295,A=m+(g<<10&4294967295|g>>>22),g=w+(m^(A|~_))+v[14]+2878612391&4294967295,w=A+(g<<15&4294967295|g>>>17),g=_+(A^(w|~m))+v[5]+4237533241&4294967295,_=w+(g<<21&4294967295|g>>>11),g=m+(w^(_|~A))+v[12]+1700485571&4294967295,m=_+(g<<6&4294967295|g>>>26),g=A+(_^(m|~w))+v[3]+2399980690&4294967295,A=m+(g<<10&4294967295|g>>>22),g=w+(m^(A|~_))+v[10]+4293915773&4294967295,w=A+(g<<15&4294967295|g>>>17),g=_+(A^(w|~m))+v[1]+2240044497&4294967295,_=w+(g<<21&4294967295|g>>>11),g=m+(w^(_|~A))+v[8]+1873313359&4294967295,m=_+(g<<6&4294967295|g>>>26),g=A+(_^(m|~w))+v[15]+4264355552&4294967295,A=m+(g<<10&4294967295|g>>>22),g=w+(m^(A|~_))+v[6]+2734768916&4294967295,w=A+(g<<15&4294967295|g>>>17),g=_+(A^(w|~m))+v[13]+1309151649&4294967295,_=w+(g<<21&4294967295|g>>>11),g=m+(w^(_|~A))+v[4]+4149444226&4294967295,m=_+(g<<6&4294967295|g>>>26),g=A+(_^(m|~w))+v[11]+3174756917&4294967295,A=m+(g<<10&4294967295|g>>>22),g=w+(m^(A|~_))+v[2]+718787259&4294967295,w=A+(g<<15&4294967295|g>>>17),g=_+(A^(w|~m))+v[9]+3951481745&4294967295,I.g[0]=I.g[0]+m&4294967295,I.g[1]=I.g[1]+(w+(g<<21&4294967295|g>>>11))&4294967295,I.g[2]=I.g[2]+w&4294967295,I.g[3]=I.g[3]+A&4294967295}r.prototype.u=function(I,m){m===void 0&&(m=I.length);for(var _=m-this.blockSize,v=this.B,w=this.h,A=0;A<m;){if(w==0)for(;A<=_;)i(this,I,A),A+=this.blockSize;if(typeof I=="string"){for(;A<m;)if(v[w++]=I.charCodeAt(A++),w==this.blockSize){i(this,v),w=0;break}}else for(;A<m;)if(v[w++]=I[A++],w==this.blockSize){i(this,v),w=0;break}}this.h=w,this.o+=m},r.prototype.v=function(){var I=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);I[0]=128;for(var m=1;m<I.length-8;++m)I[m]=0;var _=8*this.o;for(m=I.length-8;m<I.length;++m)I[m]=_&255,_/=256;for(this.u(I),I=Array(16),m=_=0;4>m;++m)for(var v=0;32>v;v+=8)I[_++]=this.g[m]>>>v&255;return I};function o(I,m){var _=u;return Object.prototype.hasOwnProperty.call(_,I)?_[I]:_[I]=m(I)}function a(I,m){this.h=m;for(var _=[],v=!0,w=I.length-1;0<=w;w--){var A=I[w]|0;v&&A==m||(_[w]=A,v=!1)}this.g=_}var u={};function h(I){return-128<=I&&128>I?o(I,function(m){return new a([m|0],0>m?-1:0)}):new a([I|0],0>I?-1:0)}function d(I){if(isNaN(I)||!isFinite(I))return y;if(0>I)return D(d(-I));for(var m=[],_=1,v=0;I>=_;v++)m[v]=I/_|0,_*=4294967296;return new a(m,0)}function p(I,m){if(I.length==0)throw Error("number format error: empty string");if(m=m||10,2>m||36<m)throw Error("radix out of range: "+m);if(I.charAt(0)=="-")return D(p(I.substring(1),m));if(0<=I.indexOf("-"))throw Error('number format error: interior "-" character');for(var _=d(Math.pow(m,8)),v=y,w=0;w<I.length;w+=8){var A=Math.min(8,I.length-w),g=parseInt(I.substring(w,w+A),m);8>A?(A=d(Math.pow(m,A)),v=v.j(A).add(d(g))):(v=v.j(_),v=v.add(d(g)))}return v}var y=h(0),T=h(1),R=h(16777216);n=a.prototype,n.m=function(){if(x(this))return-D(this).m();for(var I=0,m=1,_=0;_<this.g.length;_++){var v=this.i(_);I+=(0<=v?v:4294967296+v)*m,m*=4294967296}return I},n.toString=function(I){if(I=I||10,2>I||36<I)throw Error("radix out of range: "+I);if(k(this))return"0";if(x(this))return"-"+D(this).toString(I);for(var m=d(Math.pow(I,6)),_=this,v="";;){var w=X(_,m).g;_=q(_,w.j(m));var A=((0<_.g.length?_.g[0]:_.h)>>>0).toString(I);if(_=w,k(_))return A+v;for(;6>A.length;)A="0"+A;v=A+v}},n.i=function(I){return 0>I?0:I<this.g.length?this.g[I]:this.h};function k(I){if(I.h!=0)return!1;for(var m=0;m<I.g.length;m++)if(I.g[m]!=0)return!1;return!0}function x(I){return I.h==-1}n.l=function(I){return I=q(this,I),x(I)?-1:k(I)?0:1};function D(I){for(var m=I.g.length,_=[],v=0;v<m;v++)_[v]=~I.g[v];return new a(_,~I.h).add(T)}n.abs=function(){return x(this)?D(this):this},n.add=function(I){for(var m=Math.max(this.g.length,I.g.length),_=[],v=0,w=0;w<=m;w++){var A=v+(this.i(w)&65535)+(I.i(w)&65535),g=(A>>>16)+(this.i(w)>>>16)+(I.i(w)>>>16);v=g>>>16,A&=65535,g&=65535,_[w]=g<<16|A}return new a(_,_[_.length-1]&-2147483648?-1:0)};function q(I,m){return I.add(D(m))}n.j=function(I){if(k(this)||k(I))return y;if(x(this))return x(I)?D(this).j(D(I)):D(D(this).j(I));if(x(I))return D(this.j(D(I)));if(0>this.l(R)&&0>I.l(R))return d(this.m()*I.m());for(var m=this.g.length+I.g.length,_=[],v=0;v<2*m;v++)_[v]=0;for(v=0;v<this.g.length;v++)for(var w=0;w<I.g.length;w++){var A=this.i(v)>>>16,g=this.i(v)&65535,Je=I.i(w)>>>16,Vn=I.i(w)&65535;_[2*v+2*w]+=g*Vn,z(_,2*v+2*w),_[2*v+2*w+1]+=A*Vn,z(_,2*v+2*w+1),_[2*v+2*w+1]+=g*Je,z(_,2*v+2*w+1),_[2*v+2*w+2]+=A*Je,z(_,2*v+2*w+2)}for(v=0;v<m;v++)_[v]=_[2*v+1]<<16|_[2*v];for(v=m;v<2*m;v++)_[v]=0;return new a(_,0)};function z(I,m){for(;(I[m]&65535)!=I[m];)I[m+1]+=I[m]>>>16,I[m]&=65535,m++}function G(I,m){this.g=I,this.h=m}function X(I,m){if(k(m))throw Error("division by zero");if(k(I))return new G(y,y);if(x(I))return m=X(D(I),m),new G(D(m.g),D(m.h));if(x(m))return m=X(I,D(m)),new G(D(m.g),m.h);if(30<I.g.length){if(x(I)||x(m))throw Error("slowDivide_ only works with positive integers.");for(var _=T,v=m;0>=v.l(I);)_=Ie(_),v=Ie(v);var w=Q(_,1),A=Q(v,1);for(v=Q(v,2),_=Q(_,2);!k(v);){var g=A.add(v);0>=g.l(I)&&(w=w.add(_),A=g),v=Q(v,1),_=Q(_,1)}return m=q(I,w.j(m)),new G(w,m)}for(w=y;0<=I.l(m);){for(_=Math.max(1,Math.floor(I.m()/m.m())),v=Math.ceil(Math.log(_)/Math.LN2),v=48>=v?1:Math.pow(2,v-48),A=d(_),g=A.j(m);x(g)||0<g.l(I);)_-=v,A=d(_),g=A.j(m);k(A)&&(A=T),w=w.add(A),I=q(I,g)}return new G(w,I)}n.A=function(I){return X(this,I).h},n.and=function(I){for(var m=Math.max(this.g.length,I.g.length),_=[],v=0;v<m;v++)_[v]=this.i(v)&I.i(v);return new a(_,this.h&I.h)},n.or=function(I){for(var m=Math.max(this.g.length,I.g.length),_=[],v=0;v<m;v++)_[v]=this.i(v)|I.i(v);return new a(_,this.h|I.h)},n.xor=function(I){for(var m=Math.max(this.g.length,I.g.length),_=[],v=0;v<m;v++)_[v]=this.i(v)^I.i(v);return new a(_,this.h^I.h)};function Ie(I){for(var m=I.g.length+1,_=[],v=0;v<m;v++)_[v]=I.i(v)<<1|I.i(v-1)>>>31;return new a(_,I.h)}function Q(I,m){var _=m>>5;m%=32;for(var v=I.g.length-_,w=[],A=0;A<v;A++)w[A]=0<m?I.i(A+_)>>>m|I.i(A+_+1)<<32-m:I.i(A+_);return new a(w,I.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,ua=Jh.Md5=r,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.A,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=d,a.fromString=p,vt=Jh.Integer=a}).apply(typeof Qh!="undefined"?Qh:typeof self!="undefined"?self:typeof window!="undefined"?window:{});var zi=typeof globalThis!="undefined"?globalThis:typeof window!="undefined"?window:typeof global!="undefined"?global:typeof self!="undefined"?self:{},rt={};var la,ha,ln,da,pr,Gi,fa,pa,ma;(function(){var n,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(s,c,l){return s==Array.prototype||s==Object.prototype||(s[c]=l.value),s};function t(s){s=[typeof globalThis=="object"&&globalThis,s,typeof window=="object"&&window,typeof self=="object"&&self,typeof zi=="object"&&zi];for(var c=0;c<s.length;++c){var l=s[c];if(l&&l.Math==Math)return l}throw Error("Cannot find global object")}var r=t(this);function i(s,c){if(c)e:{var l=r;s=s.split(".");for(var f=0;f<s.length-1;f++){var E=s[f];if(!(E in l))break e;l=l[E]}s=s[s.length-1],f=l[s],c=c(f),c!=f&&c!=null&&e(l,s,{configurable:!0,writable:!0,value:c})}}function o(s,c){s instanceof String&&(s+="");var l=0,f=!1,E={next:function(){if(!f&&l<s.length){var b=l++;return{value:c(b,s[b]),done:!1}}return f=!0,{done:!0,value:void 0}}};return E[Symbol.iterator]=function(){return E},E}i("Array.prototype.values",function(s){return s||function(){return o(this,function(c,l){return l})}});var a=a||{},u=this||self;function h(s){var c=typeof s;return c=c!="object"?c:s?Array.isArray(s)?"array":c:"null",c=="array"||c=="object"&&typeof s.length=="number"}function d(s){var c=typeof s;return c=="object"&&s!=null||c=="function"}function p(s,c,l){return s.call.apply(s.bind,arguments)}function y(s,c,l){if(!s)throw Error();if(2<arguments.length){var f=Array.prototype.slice.call(arguments,2);return function(){var E=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(E,f),s.apply(c,E)}}return function(){return s.apply(c,arguments)}}function T(s,c,l){return T=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?p:y,T.apply(null,arguments)}function R(s,c){var l=Array.prototype.slice.call(arguments,1);return function(){var f=l.slice();return f.push.apply(f,arguments),s.apply(this,f)}}function k(s,c){function l(){}l.prototype=c.prototype,s.aa=c.prototype,s.prototype=new l,s.prototype.constructor=s,s.Qb=function(f,E,b){for(var C=Array(arguments.length-2),J=2;J<arguments.length;J++)C[J-2]=arguments[J];return c.prototype[E].apply(f,C)}}function x(s){let c=s.length;if(0<c){let l=Array(c);for(let f=0;f<c;f++)l[f]=s[f];return l}return[]}function D(s,c){for(let l=1;l<arguments.length;l++){let f=arguments[l];if(h(f)){let E=s.length||0,b=f.length||0;s.length=E+b;for(let C=0;C<b;C++)s[E+C]=f[C]}else s.push(f)}}class q{constructor(c,l){this.i=c,this.j=l,this.h=0,this.g=null}get(){let c;return 0<this.h?(this.h--,c=this.g,this.g=c.next,c.next=null):c=this.i(),c}}function z(s){return/^[\s\xa0]*$/.test(s)}function G(){var s=u.navigator;return s&&(s=s.userAgent)?s:""}function X(s){return X[" "](s),s}X[" "]=function(){};var Ie=G().indexOf("Gecko")!=-1&&!(G().toLowerCase().indexOf("webkit")!=-1&&G().indexOf("Edge")==-1)&&!(G().indexOf("Trident")!=-1||G().indexOf("MSIE")!=-1)&&G().indexOf("Edge")==-1;function Q(s,c,l){for(let f in s)c.call(l,s[f],f,s)}function I(s,c){for(let l in s)c.call(void 0,s[l],l,s)}function m(s){let c={};for(let l in s)c[l]=s[l];return c}let _="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function v(s,c){let l,f;for(let E=1;E<arguments.length;E++){f=arguments[E];for(l in f)s[l]=f[l];for(let b=0;b<_.length;b++)l=_[b],Object.prototype.hasOwnProperty.call(f,l)&&(s[l]=f[l])}}function w(s){var c=1;s=s.split(":");let l=[];for(;0<c&&s.length;)l.push(s.shift()),c--;return s.length&&l.push(s.join(":")),l}function A(s){u.setTimeout(()=>{throw s},0)}function g(){var s=xs;let c=null;return s.g&&(c=s.g,s.g=s.g.next,s.g||(s.h=null),c.next=null),c}class Je{constructor(){this.h=this.g=null}add(c,l){let f=Vn.get();f.set(c,l),this.h?this.h.next=f:this.g=f,this.h=f}}var Vn=new q(()=>new Wf,s=>s.reset());class Wf{constructor(){this.next=this.g=this.h=null}set(c,l){this.h=c,this.g=l,this.next=null}reset(){this.next=this.g=this.h=null}}let Ln,Mn=!1,xs=new Je,Au=()=>{let s=u.Promise.resolve(void 0);Ln=()=>{s.then(Qf)}};var Qf=()=>{for(var s;s=g();){try{s.h.call(s.g)}catch(l){A(l)}var c=Vn;c.j(s),100>c.h&&(c.h++,s.next=c.g,c.g=s)}Mn=!1};function at(){this.s=this.s,this.C=this.C}at.prototype.s=!1,at.prototype.ma=function(){this.s||(this.s=!0,this.N())},at.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function de(s,c){this.type=s,this.g=this.target=c,this.defaultPrevented=!1}de.prototype.h=function(){this.defaultPrevented=!0};var Jf=function(){if(!u.addEventListener||!Object.defineProperty)return!1;var s=!1,c=Object.defineProperty({},"passive",{get:function(){s=!0}});try{let l=()=>{};u.addEventListener("test",l,c),u.removeEventListener("test",l,c)}catch{}return s}();function Fn(s,c){if(de.call(this,s?s.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,s){var l=this.type=s.type,f=s.changedTouches&&s.changedTouches.length?s.changedTouches[0]:null;if(this.target=s.target||s.srcElement,this.g=c,c=s.relatedTarget){if(Ie){e:{try{X(c.nodeName);var E=!0;break e}catch{}E=!1}E||(c=null)}}else l=="mouseover"?c=s.fromElement:l=="mouseout"&&(c=s.toElement);this.relatedTarget=c,f?(this.clientX=f.clientX!==void 0?f.clientX:f.pageX,this.clientY=f.clientY!==void 0?f.clientY:f.pageY,this.screenX=f.screenX||0,this.screenY=f.screenY||0):(this.clientX=s.clientX!==void 0?s.clientX:s.pageX,this.clientY=s.clientY!==void 0?s.clientY:s.pageY,this.screenX=s.screenX||0,this.screenY=s.screenY||0),this.button=s.button,this.key=s.key||"",this.ctrlKey=s.ctrlKey,this.altKey=s.altKey,this.shiftKey=s.shiftKey,this.metaKey=s.metaKey,this.pointerId=s.pointerId||0,this.pointerType=typeof s.pointerType=="string"?s.pointerType:Yf[s.pointerType]||"",this.state=s.state,this.i=s,s.defaultPrevented&&Fn.aa.h.call(this)}}k(Fn,de);var Yf={2:"touch",3:"pen",4:"mouse"};Fn.prototype.h=function(){Fn.aa.h.call(this);var s=this.i;s.preventDefault?s.preventDefault():s.returnValue=!1};var Un="closure_listenable_"+(1e6*Math.random()|0),Xf=0;function Zf(s,c,l,f,E){this.listener=s,this.proxy=null,this.src=c,this.type=l,this.capture=!!f,this.ha=E,this.key=++Xf,this.da=this.fa=!1}function Gr(s){s.da=!0,s.listener=null,s.proxy=null,s.src=null,s.ha=null}function Kr(s){this.src=s,this.g={},this.h=0}Kr.prototype.add=function(s,c,l,f,E){var b=s.toString();s=this.g[b],s||(s=this.g[b]=[],this.h++);var C=Ls(s,c,f,E);return-1<C?(c=s[C],l||(c.fa=!1)):(c=new Zf(c,this.src,b,!!f,E),c.fa=l,s.push(c)),c};function Vs(s,c){var l=c.type;if(l in s.g){var f=s.g[l],E=Array.prototype.indexOf.call(f,c,void 0),b;(b=0<=E)&&Array.prototype.splice.call(f,E,1),b&&(Gr(c),s.g[l].length==0&&(delete s.g[l],s.h--))}}function Ls(s,c,l,f){for(var E=0;E<s.length;++E){var b=s[E];if(!b.da&&b.listener==c&&b.capture==!!l&&b.ha==f)return E}return-1}var Ms="closure_lm_"+(1e6*Math.random()|0),Fs={};function bu(s,c,l,f,E){if(f&&f.once)return Ru(s,c,l,f,E);if(Array.isArray(c)){for(var b=0;b<c.length;b++)bu(s,c[b],l,f,E);return null}return l=js(l),s&&s[Un]?s.K(c,l,d(f)?!!f.capture:!!f,E):Su(s,c,l,!1,f,E)}function Su(s,c,l,f,E,b){if(!c)throw Error("Invalid event type");var C=d(E)?!!E.capture:!!E,J=qs(s);if(J||(s[Ms]=J=new Kr(s)),l=J.add(c,l,f,C,b),l.proxy)return l;if(f=ep(),l.proxy=f,f.src=s,f.listener=l,s.addEventListener)Jf||(E=C),E===void 0&&(E=!1),s.addEventListener(c.toString(),f,E);else if(s.attachEvent)s.attachEvent(Cu(c.toString()),f);else if(s.addListener&&s.removeListener)s.addListener(f);else throw Error("addEventListener and attachEvent are unavailable.");return l}function ep(){function s(l){return c.call(s.src,s.listener,l)}let c=tp;return s}function Ru(s,c,l,f,E){if(Array.isArray(c)){for(var b=0;b<c.length;b++)Ru(s,c[b],l,f,E);return null}return l=js(l),s&&s[Un]?s.L(c,l,d(f)?!!f.capture:!!f,E):Su(s,c,l,!0,f,E)}function Pu(s,c,l,f,E){if(Array.isArray(c))for(var b=0;b<c.length;b++)Pu(s,c[b],l,f,E);else f=d(f)?!!f.capture:!!f,l=js(l),s&&s[Un]?(s=s.i,c=String(c).toString(),c in s.g&&(b=s.g[c],l=Ls(b,l,f,E),-1<l&&(Gr(b[l]),Array.prototype.splice.call(b,l,1),b.length==0&&(delete s.g[c],s.h--)))):s&&(s=qs(s))&&(c=s.g[c.toString()],s=-1,c&&(s=Ls(c,l,f,E)),(l=-1<s?c[s]:null)&&Us(l))}function Us(s){if(typeof s!="number"&&s&&!s.da){var c=s.src;if(c&&c[Un])Vs(c.i,s);else{var l=s.type,f=s.proxy;c.removeEventListener?c.removeEventListener(l,f,s.capture):c.detachEvent?c.detachEvent(Cu(l),f):c.addListener&&c.removeListener&&c.removeListener(f),(l=qs(c))?(Vs(l,s),l.h==0&&(l.src=null,c[Ms]=null)):Gr(s)}}}function Cu(s){return s in Fs?Fs[s]:Fs[s]="on"+s}function tp(s,c){if(s.da)s=!0;else{c=new Fn(c,this);var l=s.listener,f=s.ha||s.src;s.fa&&Us(s),s=l.call(f,c)}return s}function qs(s){return s=s[Ms],s instanceof Kr?s:null}var Bs="__closure_events_fn_"+(1e9*Math.random()>>>0);function js(s){return typeof s=="function"?s:(s[Bs]||(s[Bs]=function(c){return s.handleEvent(c)}),s[Bs])}function fe(){at.call(this),this.i=new Kr(this),this.M=this,this.F=null}k(fe,at),fe.prototype[Un]=!0,fe.prototype.removeEventListener=function(s,c,l,f){Pu(this,s,c,l,f)};function we(s,c){var l,f=s.F;if(f)for(l=[];f;f=f.F)l.push(f);if(s=s.M,f=c.type||c,typeof c=="string")c=new de(c,s);else if(c instanceof de)c.target=c.target||s;else{var E=c;c=new de(f,s),v(c,E)}if(E=!0,l)for(var b=l.length-1;0<=b;b--){var C=c.g=l[b];E=$r(C,f,!0,c)&&E}if(C=c.g=s,E=$r(C,f,!0,c)&&E,E=$r(C,f,!1,c)&&E,l)for(b=0;b<l.length;b++)C=c.g=l[b],E=$r(C,f,!1,c)&&E}fe.prototype.N=function(){if(fe.aa.N.call(this),this.i){var s=this.i,c;for(c in s.g){for(var l=s.g[c],f=0;f<l.length;f++)Gr(l[f]);delete s.g[c],s.h--}}this.F=null},fe.prototype.K=function(s,c,l,f){return this.i.add(String(s),c,!1,l,f)},fe.prototype.L=function(s,c,l,f){return this.i.add(String(s),c,!0,l,f)};function $r(s,c,l,f){if(c=s.i.g[String(c)],!c)return!0;c=c.concat();for(var E=!0,b=0;b<c.length;++b){var C=c[b];if(C&&!C.da&&C.capture==l){var J=C.listener,le=C.ha||C.src;C.fa&&Vs(s.i,C),E=J.call(le,f)!==!1&&E}}return E&&!f.defaultPrevented}function Du(s,c,l){if(typeof s=="function")l&&(s=T(s,l));else if(s&&typeof s.handleEvent=="function")s=T(s.handleEvent,s);else throw Error("Invalid listener argument");return 2147483647<Number(c)?-1:u.setTimeout(s,c||0)}function Nu(s){s.g=Du(()=>{s.g=null,s.i&&(s.i=!1,Nu(s))},s.l);let c=s.h;s.h=null,s.m.apply(null,c)}class np extends at{constructor(c,l){super(),this.m=c,this.l=l,this.h=null,this.i=!1,this.g=null}j(c){this.h=arguments,this.g?this.i=!0:Nu(this)}N(){super.N(),this.g&&(u.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function qn(s){at.call(this),this.h=s,this.g={}}k(qn,at);var ku=[];function Ou(s){Q(s.g,function(c,l){this.g.hasOwnProperty(l)&&Us(c)},s),s.g={}}qn.prototype.N=function(){qn.aa.N.call(this),Ou(this)},qn.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var zs=u.JSON.stringify,rp=u.JSON.parse,ip=class{stringify(s){return u.JSON.stringify(s,void 0)}parse(s){return u.JSON.parse(s,void 0)}};function Gs(){}Gs.prototype.h=null;function xu(s){return s.h||(s.h=s.i())}function Vu(){}var Bn={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function Ks(){de.call(this,"d")}k(Ks,de);function $s(){de.call(this,"c")}k($s,de);var Pt={},Lu=null;function Hr(){return Lu=Lu||new fe}Pt.La="serverreachability";function Mu(s){de.call(this,Pt.La,s)}k(Mu,de);function jn(s){let c=Hr();we(c,new Mu(c))}Pt.STAT_EVENT="statevent";function Fu(s,c){de.call(this,Pt.STAT_EVENT,s),this.stat=c}k(Fu,de);function Ee(s){let c=Hr();we(c,new Fu(c,s))}Pt.Ma="timingevent";function Uu(s,c){de.call(this,Pt.Ma,s),this.size=c}k(Uu,de);function zn(s,c){if(typeof s!="function")throw Error("Fn must not be null and must be a function");return u.setTimeout(function(){s()},c)}function Gn(){this.g=!0}Gn.prototype.xa=function(){this.g=!1};function sp(s,c,l,f,E,b){s.info(function(){if(s.g)if(b)for(var C="",J=b.split("&"),le=0;le<J.length;le++){var $=J[le].split("=");if(1<$.length){var pe=$[0];$=$[1];var me=pe.split("_");C=2<=me.length&&me[1]=="type"?C+(pe+"="+$+"&"):C+(pe+"=redacted&")}}else C=null;else C=b;return"XMLHTTP REQ ("+f+") [attempt "+E+"]: "+c+`
`+l+`
`+C})}function op(s,c,l,f,E,b,C){s.info(function(){return"XMLHTTP RESP ("+f+") [ attempt "+E+"]: "+c+`
`+l+`
`+b+" "+C})}function Xt(s,c,l,f){s.info(function(){return"XMLHTTP TEXT ("+c+"): "+cp(s,l)+(f?" "+f:"")})}function ap(s,c){s.info(function(){return"TIMEOUT: "+c})}Gn.prototype.info=function(){};function cp(s,c){if(!s.g)return c;if(!c)return null;try{var l=JSON.parse(c);if(l){for(s=0;s<l.length;s++)if(Array.isArray(l[s])){var f=l[s];if(!(2>f.length)){var E=f[1];if(Array.isArray(E)&&!(1>E.length)){var b=E[0];if(b!="noop"&&b!="stop"&&b!="close")for(var C=1;C<E.length;C++)E[C]=""}}}}return zs(l)}catch{return c}}var Wr={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},qu={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},Hs;function Qr(){}k(Qr,Gs),Qr.prototype.g=function(){return new XMLHttpRequest},Qr.prototype.i=function(){return{}},Hs=new Qr;function ct(s,c,l,f){this.j=s,this.i=c,this.l=l,this.R=f||1,this.U=new qn(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Bu}function Bu(){this.i=null,this.g="",this.h=!1}var ju={},Ws={};function Qs(s,c,l){s.L=1,s.v=Zr(Ye(c)),s.m=l,s.P=!0,zu(s,null)}function zu(s,c){s.F=Date.now(),Jr(s),s.A=Ye(s.v);var l=s.A,f=s.R;Array.isArray(f)||(f=[String(f)]),rl(l.i,"t",f),s.C=0,l=s.j.J,s.h=new Bu,s.g=wl(s.j,l?c:null,!s.m),0<s.O&&(s.M=new np(T(s.Y,s,s.g),s.O)),c=s.U,l=s.g,f=s.ca;var E="readystatechange";Array.isArray(E)||(E&&(ku[0]=E.toString()),E=ku);for(var b=0;b<E.length;b++){var C=bu(l,E[b],f||c.handleEvent,!1,c.h||c);if(!C)break;c.g[C.key]=C}c=s.H?m(s.H):{},s.m?(s.u||(s.u="POST"),c["Content-Type"]="application/x-www-form-urlencoded",s.g.ea(s.A,s.u,s.m,c)):(s.u="GET",s.g.ea(s.A,s.u,null,c)),jn(),sp(s.i,s.u,s.A,s.l,s.R,s.m)}ct.prototype.ca=function(s){s=s.target;let c=this.M;c&&Xe(s)==3?c.j():this.Y(s)},ct.prototype.Y=function(s){try{if(s==this.g)e:{let me=Xe(this.g);var c=this.g.Ba();let tn=this.g.Z();if(!(3>me)&&(me!=3||this.g&&(this.h.h||this.g.oa()||ll(this.g)))){this.J||me!=4||c==7||(c==8||0>=tn?jn(3):jn(2)),Js(this);var l=this.g.Z();this.X=l;t:if(Gu(this)){var f=ll(this.g);s="";var E=f.length,b=Xe(this.g)==4;if(!this.h.i){if(typeof TextDecoder=="undefined"){Ct(this),Kn(this);var C="";break t}this.h.i=new u.TextDecoder}for(c=0;c<E;c++)this.h.h=!0,s+=this.h.i.decode(f[c],{stream:!(b&&c==E-1)});f.length=0,this.h.g+=s,this.C=0,C=this.h.g}else C=this.g.oa();if(this.o=l==200,op(this.i,this.u,this.A,this.l,this.R,me,l),this.o){if(this.T&&!this.K){t:{if(this.g){var J,le=this.g;if((J=le.g?le.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!z(J)){var $=J;break t}}$=null}if(l=$)Xt(this.i,this.l,l,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Ys(this,l);else{this.o=!1,this.s=3,Ee(12),Ct(this),Kn(this);break e}}if(this.P){l=!0;let Ve;for(;!this.J&&this.C<C.length;)if(Ve=up(this,C),Ve==Ws){me==4&&(this.s=4,Ee(14),l=!1),Xt(this.i,this.l,null,"[Incomplete Response]");break}else if(Ve==ju){this.s=4,Ee(15),Xt(this.i,this.l,C,"[Invalid Chunk]"),l=!1;break}else Xt(this.i,this.l,Ve,null),Ys(this,Ve);if(Gu(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),me!=4||C.length!=0||this.h.h||(this.s=1,Ee(16),l=!1),this.o=this.o&&l,!l)Xt(this.i,this.l,C,"[Invalid Chunked Response]"),Ct(this),Kn(this);else if(0<C.length&&!this.W){this.W=!0;var pe=this.j;pe.g==this&&pe.ba&&!pe.M&&(pe.j.info("Great, no buffering proxy detected. Bytes received: "+C.length),ro(pe),pe.M=!0,Ee(11))}}else Xt(this.i,this.l,C,null),Ys(this,C);me==4&&Ct(this),this.o&&!this.J&&(me==4?_l(this.j,this):(this.o=!1,Jr(this)))}else Sp(this.g),l==400&&0<C.indexOf("Unknown SID")?(this.s=3,Ee(12)):(this.s=0,Ee(13)),Ct(this),Kn(this)}}}catch{}finally{}};function Gu(s){return s.g?s.u=="GET"&&s.L!=2&&s.j.Ca:!1}function up(s,c){var l=s.C,f=c.indexOf(`
`,l);return f==-1?Ws:(l=Number(c.substring(l,f)),isNaN(l)?ju:(f+=1,f+l>c.length?Ws:(c=c.slice(f,f+l),s.C=f+l,c)))}ct.prototype.cancel=function(){this.J=!0,Ct(this)};function Jr(s){s.S=Date.now()+s.I,Ku(s,s.I)}function Ku(s,c){if(s.B!=null)throw Error("WatchDog timer not null");s.B=zn(T(s.ba,s),c)}function Js(s){s.B&&(u.clearTimeout(s.B),s.B=null)}ct.prototype.ba=function(){this.B=null;let s=Date.now();0<=s-this.S?(ap(this.i,this.A),this.L!=2&&(jn(),Ee(17)),Ct(this),this.s=2,Kn(this)):Ku(this,this.S-s)};function Kn(s){s.j.G==0||s.J||_l(s.j,s)}function Ct(s){Js(s);var c=s.M;c&&typeof c.ma=="function"&&c.ma(),s.M=null,Ou(s.U),s.g&&(c=s.g,s.g=null,c.abort(),c.ma())}function Ys(s,c){try{var l=s.j;if(l.G!=0&&(l.g==s||Xs(l.h,s))){if(!s.K&&Xs(l.h,s)&&l.G==3){try{var f=l.Da.g.parse(c)}catch{f=null}if(Array.isArray(f)&&f.length==3){var E=f;if(E[0]==0){e:if(!l.u){if(l.g)if(l.g.F+3e3<s.F)ii(l),ni(l);else break e;no(l),Ee(18)}}else l.za=E[1],0<l.za-l.T&&37500>E[2]&&l.F&&l.v==0&&!l.C&&(l.C=zn(T(l.Za,l),6e3));if(1>=Wu(l.h)&&l.ca){try{l.ca()}catch{}l.ca=void 0}}else Nt(l,11)}else if((s.K||l.g==s)&&ii(l),!z(c))for(E=l.Da.g.parse(c),c=0;c<E.length;c++){let $=E[c];if(l.T=$[0],$=$[1],l.G==2)if($[0]=="c"){l.K=$[1],l.ia=$[2];let pe=$[3];pe!=null&&(l.la=pe,l.j.info("VER="+l.la));let me=$[4];me!=null&&(l.Aa=me,l.j.info("SVER="+l.Aa));let tn=$[5];tn!=null&&typeof tn=="number"&&0<tn&&(f=1.5*tn,l.L=f,l.j.info("backChannelRequestTimeoutMs_="+f)),f=l;let Ve=s.g;if(Ve){let oi=Ve.g?Ve.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(oi){var b=f.h;b.g||oi.indexOf("spdy")==-1&&oi.indexOf("quic")==-1&&oi.indexOf("h2")==-1||(b.j=b.l,b.g=new Set,b.h&&(Zs(b,b.h),b.h=null))}if(f.D){let io=Ve.g?Ve.g.getResponseHeader("X-HTTP-Session-Id"):null;io&&(f.ya=io,Z(f.I,f.D,io))}}l.G=3,l.l&&l.l.ua(),l.ba&&(l.R=Date.now()-s.F,l.j.info("Handshake RTT: "+l.R+"ms")),f=l;var C=s;if(f.qa=Il(f,f.J?f.ia:null,f.W),C.K){Qu(f.h,C);var J=C,le=f.L;le&&(J.I=le),J.B&&(Js(J),Jr(J)),f.g=C}else ml(f);0<l.i.length&&ri(l)}else $[0]!="stop"&&$[0]!="close"||Nt(l,7);else l.G==3&&($[0]=="stop"||$[0]=="close"?$[0]=="stop"?Nt(l,7):to(l):$[0]!="noop"&&l.l&&l.l.ta($),l.v=0)}}jn(4)}catch{}}var lp=class{constructor(s,c){this.g=s,this.map=c}};function $u(s){this.l=s||10,u.PerformanceNavigationTiming?(s=u.performance.getEntriesByType("navigation"),s=0<s.length&&(s[0].nextHopProtocol=="hq"||s[0].nextHopProtocol=="h2")):s=!!(u.chrome&&u.chrome.loadTimes&&u.chrome.loadTimes()&&u.chrome.loadTimes().wasFetchedViaSpdy),this.j=s?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function Hu(s){return s.h?!0:s.g?s.g.size>=s.j:!1}function Wu(s){return s.h?1:s.g?s.g.size:0}function Xs(s,c){return s.h?s.h==c:s.g?s.g.has(c):!1}function Zs(s,c){s.g?s.g.add(c):s.h=c}function Qu(s,c){s.h&&s.h==c?s.h=null:s.g&&s.g.has(c)&&s.g.delete(c)}$u.prototype.cancel=function(){if(this.i=Ju(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(let s of this.g.values())s.cancel();this.g.clear()}};function Ju(s){if(s.h!=null)return s.i.concat(s.h.D);if(s.g!=null&&s.g.size!==0){let c=s.i;for(let l of s.g.values())c=c.concat(l.D);return c}return x(s.i)}function hp(s){if(s.V&&typeof s.V=="function")return s.V();if(typeof Map!="undefined"&&s instanceof Map||typeof Set!="undefined"&&s instanceof Set)return Array.from(s.values());if(typeof s=="string")return s.split("");if(h(s)){for(var c=[],l=s.length,f=0;f<l;f++)c.push(s[f]);return c}c=[],l=0;for(f in s)c[l++]=s[f];return c}function dp(s){if(s.na&&typeof s.na=="function")return s.na();if(!s.V||typeof s.V!="function"){if(typeof Map!="undefined"&&s instanceof Map)return Array.from(s.keys());if(!(typeof Set!="undefined"&&s instanceof Set)){if(h(s)||typeof s=="string"){var c=[];s=s.length;for(var l=0;l<s;l++)c.push(l);return c}c=[],l=0;for(let f in s)c[l++]=f;return c}}}function Yu(s,c){if(s.forEach&&typeof s.forEach=="function")s.forEach(c,void 0);else if(h(s)||typeof s=="string")Array.prototype.forEach.call(s,c,void 0);else for(var l=dp(s),f=hp(s),E=f.length,b=0;b<E;b++)c.call(void 0,f[b],l&&l[b],s)}var Xu=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function fp(s,c){if(s){s=s.split("&");for(var l=0;l<s.length;l++){var f=s[l].indexOf("="),E=null;if(0<=f){var b=s[l].substring(0,f);E=s[l].substring(f+1)}else b=s[l];c(b,E?decodeURIComponent(E.replace(/\+/g," ")):"")}}}function Dt(s){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,s instanceof Dt){this.h=s.h,Yr(this,s.j),this.o=s.o,this.g=s.g,Xr(this,s.s),this.l=s.l;var c=s.i,l=new Wn;l.i=c.i,c.g&&(l.g=new Map(c.g),l.h=c.h),Zu(this,l),this.m=s.m}else s&&(c=String(s).match(Xu))?(this.h=!1,Yr(this,c[1]||"",!0),this.o=$n(c[2]||""),this.g=$n(c[3]||"",!0),Xr(this,c[4]),this.l=$n(c[5]||"",!0),Zu(this,c[6]||"",!0),this.m=$n(c[7]||"")):(this.h=!1,this.i=new Wn(null,this.h))}Dt.prototype.toString=function(){var s=[],c=this.j;c&&s.push(Hn(c,el,!0),":");var l=this.g;return(l||c=="file")&&(s.push("//"),(c=this.o)&&s.push(Hn(c,el,!0),"@"),s.push(encodeURIComponent(String(l)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),l=this.s,l!=null&&s.push(":",String(l))),(l=this.l)&&(this.g&&l.charAt(0)!="/"&&s.push("/"),s.push(Hn(l,l.charAt(0)=="/"?gp:mp,!0))),(l=this.i.toString())&&s.push("?",l),(l=this.m)&&s.push("#",Hn(l,yp)),s.join("")};function Ye(s){return new Dt(s)}function Yr(s,c,l){s.j=l?$n(c,!0):c,s.j&&(s.j=s.j.replace(/:$/,""))}function Xr(s,c){if(c){if(c=Number(c),isNaN(c)||0>c)throw Error("Bad port number "+c);s.s=c}else s.s=null}function Zu(s,c,l){c instanceof Wn?(s.i=c,vp(s.i,s.h)):(l||(c=Hn(c,_p)),s.i=new Wn(c,s.h))}function Z(s,c,l){s.i.set(c,l)}function Zr(s){return Z(s,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),s}function $n(s,c){return s?c?decodeURI(s.replace(/%25/g,"%2525")):decodeURIComponent(s):""}function Hn(s,c,l){return typeof s=="string"?(s=encodeURI(s).replace(c,pp),l&&(s=s.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),s):null}function pp(s){return s=s.charCodeAt(0),"%"+(s>>4&15).toString(16)+(s&15).toString(16)}var el=/[#\/\?@]/g,mp=/[#\?:]/g,gp=/[#\?]/g,_p=/[#\?@]/g,yp=/#/g;function Wn(s,c){this.h=this.g=null,this.i=s||null,this.j=!!c}function ut(s){s.g||(s.g=new Map,s.h=0,s.i&&fp(s.i,function(c,l){s.add(decodeURIComponent(c.replace(/\+/g," ")),l)}))}n=Wn.prototype,n.add=function(s,c){ut(this),this.i=null,s=Zt(this,s);var l=this.g.get(s);return l||this.g.set(s,l=[]),l.push(c),this.h+=1,this};function tl(s,c){ut(s),c=Zt(s,c),s.g.has(c)&&(s.i=null,s.h-=s.g.get(c).length,s.g.delete(c))}function nl(s,c){return ut(s),c=Zt(s,c),s.g.has(c)}n.forEach=function(s,c){ut(this),this.g.forEach(function(l,f){l.forEach(function(E){s.call(c,E,f,this)},this)},this)},n.na=function(){ut(this);let s=Array.from(this.g.values()),c=Array.from(this.g.keys()),l=[];for(let f=0;f<c.length;f++){let E=s[f];for(let b=0;b<E.length;b++)l.push(c[f])}return l},n.V=function(s){ut(this);let c=[];if(typeof s=="string")nl(this,s)&&(c=c.concat(this.g.get(Zt(this,s))));else{s=Array.from(this.g.values());for(let l=0;l<s.length;l++)c=c.concat(s[l])}return c},n.set=function(s,c){return ut(this),this.i=null,s=Zt(this,s),nl(this,s)&&(this.h-=this.g.get(s).length),this.g.set(s,[c]),this.h+=1,this},n.get=function(s,c){return s?(s=this.V(s),0<s.length?String(s[0]):c):c};function rl(s,c,l){tl(s,c),0<l.length&&(s.i=null,s.g.set(Zt(s,c),x(l)),s.h+=l.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";let s=[],c=Array.from(this.g.keys());for(var l=0;l<c.length;l++){var f=c[l];let b=encodeURIComponent(String(f)),C=this.V(f);for(f=0;f<C.length;f++){var E=b;C[f]!==""&&(E+="="+encodeURIComponent(String(C[f]))),s.push(E)}}return this.i=s.join("&")};function Zt(s,c){return c=String(c),s.j&&(c=c.toLowerCase()),c}function vp(s,c){c&&!s.j&&(ut(s),s.i=null,s.g.forEach(function(l,f){var E=f.toLowerCase();f!=E&&(tl(this,f),rl(this,E,l))},s)),s.j=c}function Ip(s,c){let l=new Gn;if(u.Image){let f=new Image;f.onload=R(lt,l,"TestLoadImage: loaded",!0,c,f),f.onerror=R(lt,l,"TestLoadImage: error",!1,c,f),f.onabort=R(lt,l,"TestLoadImage: abort",!1,c,f),f.ontimeout=R(lt,l,"TestLoadImage: timeout",!1,c,f),u.setTimeout(function(){f.ontimeout&&f.ontimeout()},1e4),f.src=s}else c(!1)}function wp(s,c){let l=new Gn,f=new AbortController,E=setTimeout(()=>{f.abort(),lt(l,"TestPingServer: timeout",!1,c)},1e4);fetch(s,{signal:f.signal}).then(b=>{clearTimeout(E),b.ok?lt(l,"TestPingServer: ok",!0,c):lt(l,"TestPingServer: server error",!1,c)}).catch(()=>{clearTimeout(E),lt(l,"TestPingServer: error",!1,c)})}function lt(s,c,l,f,E){try{E&&(E.onload=null,E.onerror=null,E.onabort=null,E.ontimeout=null),f(l)}catch{}}function Ep(){this.g=new ip}function Tp(s,c,l){let f=l||"";try{Yu(s,function(E,b){let C=E;d(E)&&(C=zs(E)),c.push(f+b+"="+encodeURIComponent(C))})}catch(E){throw c.push(f+"type="+encodeURIComponent("_badmap")),E}}function Qn(s){this.l=s.Ub||null,this.j=s.eb||!1}k(Qn,Gs),Qn.prototype.g=function(){return new ei(this.l,this.j)},Qn.prototype.i=function(s){return function(){return s}}({});function ei(s,c){fe.call(this),this.D=s,this.o=c,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}k(ei,fe),n=ei.prototype,n.open=function(s,c){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=s,this.A=c,this.readyState=1,Yn(this)},n.send=function(s){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;let c={headers:this.u,method:this.B,credentials:this.m,cache:void 0};s&&(c.body=s),(this.D||u).fetch(new Request(this.A,c)).then(this.Sa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,Jn(this)),this.readyState=0},n.Sa=function(s){if(this.g&&(this.l=s,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=s.headers,this.readyState=2,Yn(this)),this.g&&(this.readyState=3,Yn(this),this.g)))if(this.responseType==="arraybuffer")s.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof u.ReadableStream!="undefined"&&"body"in s){if(this.j=s.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;il(this)}else s.text().then(this.Ra.bind(this),this.ga.bind(this))};function il(s){s.j.read().then(s.Pa.bind(s)).catch(s.ga.bind(s))}n.Pa=function(s){if(this.g){if(this.o&&s.value)this.response.push(s.value);else if(!this.o){var c=s.value?s.value:new Uint8Array(0);(c=this.v.decode(c,{stream:!s.done}))&&(this.response=this.responseText+=c)}s.done?Jn(this):Yn(this),this.readyState==3&&il(this)}},n.Ra=function(s){this.g&&(this.response=this.responseText=s,Jn(this))},n.Qa=function(s){this.g&&(this.response=s,Jn(this))},n.ga=function(){this.g&&Jn(this)};function Jn(s){s.readyState=4,s.l=null,s.j=null,s.v=null,Yn(s)}n.setRequestHeader=function(s,c){this.u.append(s,c)},n.getResponseHeader=function(s){return this.h&&this.h.get(s.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";let s=[],c=this.h.entries();for(var l=c.next();!l.done;)l=l.value,s.push(l[0]+": "+l[1]),l=c.next();return s.join(`\r
`)};function Yn(s){s.onreadystatechange&&s.onreadystatechange.call(s)}Object.defineProperty(ei.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(s){this.m=s?"include":"same-origin"}});function sl(s){let c="";return Q(s,function(l,f){c+=f,c+=":",c+=l,c+=`\r
`}),c}function eo(s,c,l){e:{for(f in l){var f=!1;break e}f=!0}f||(l=sl(l),typeof s=="string"?l!=null&&encodeURIComponent(String(l)):Z(s,c,l))}function te(s){fe.call(this),this.headers=new Map,this.o=s||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}k(te,fe);var Ap=/^https?$/i,bp=["POST","PUT"];n=te.prototype,n.Ha=function(s){this.J=s},n.ea=function(s,c,l,f){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+s);c=c?c.toUpperCase():"GET",this.D=s,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():Hs.g(),this.v=this.o?xu(this.o):xu(Hs),this.g.onreadystatechange=T(this.Ea,this);try{this.B=!0,this.g.open(c,String(s),!0),this.B=!1}catch(b){ol(this,b);return}if(s=l||"",l=new Map(this.headers),f)if(Object.getPrototypeOf(f)===Object.prototype)for(var E in f)l.set(E,f[E]);else if(typeof f.keys=="function"&&typeof f.get=="function")for(let b of f.keys())l.set(b,f.get(b));else throw Error("Unknown input type for opt_headers: "+String(f));f=Array.from(l.keys()).find(b=>b.toLowerCase()=="content-type"),E=u.FormData&&s instanceof u.FormData,!(0<=Array.prototype.indexOf.call(bp,c,void 0))||f||E||l.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(let[b,C]of l)this.g.setRequestHeader(b,C);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{ul(this),this.u=!0,this.g.send(s),this.u=!1}catch(b){ol(this,b)}};function ol(s,c){s.h=!1,s.g&&(s.j=!0,s.g.abort(),s.j=!1),s.l=c,s.m=5,al(s),ti(s)}function al(s){s.A||(s.A=!0,we(s,"complete"),we(s,"error"))}n.abort=function(s){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=s||7,we(this,"complete"),we(this,"abort"),ti(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),ti(this,!0)),te.aa.N.call(this)},n.Ea=function(){this.s||(this.B||this.u||this.j?cl(this):this.bb())},n.bb=function(){cl(this)};function cl(s){if(s.h&&typeof a!="undefined"&&(!s.v[1]||Xe(s)!=4||s.Z()!=2)){if(s.u&&Xe(s)==4)Du(s.Ea,0,s);else if(we(s,"readystatechange"),Xe(s)==4){s.h=!1;try{let C=s.Z();e:switch(C){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var c=!0;break e;default:c=!1}var l;if(!(l=c)){var f;if(f=C===0){var E=String(s.D).match(Xu)[1]||null;!E&&u.self&&u.self.location&&(E=u.self.location.protocol.slice(0,-1)),f=!Ap.test(E?E.toLowerCase():"")}l=f}if(l)we(s,"complete"),we(s,"success");else{s.m=6;try{var b=2<Xe(s)?s.g.statusText:""}catch{b=""}s.l=b+" ["+s.Z()+"]",al(s)}}finally{ti(s)}}}}function ti(s,c){if(s.g){ul(s);let l=s.g,f=s.v[0]?()=>{}:null;s.g=null,s.v=null,c||we(s,"ready");try{l.onreadystatechange=f}catch{}}}function ul(s){s.I&&(u.clearTimeout(s.I),s.I=null)}n.isActive=function(){return!!this.g};function Xe(s){return s.g?s.g.readyState:0}n.Z=function(){try{return 2<Xe(this)?this.g.status:-1}catch{return-1}},n.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.Oa=function(s){if(this.g){var c=this.g.responseText;return s&&c.indexOf(s)==0&&(c=c.substring(s.length)),rp(c)}};function ll(s){try{if(!s.g)return null;if("response"in s.g)return s.g.response;switch(s.H){case"":case"text":return s.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in s.g)return s.g.mozResponseArrayBuffer}return null}catch{return null}}function Sp(s){let c={};s=(s.g&&2<=Xe(s)&&s.g.getAllResponseHeaders()||"").split(`\r
`);for(let f=0;f<s.length;f++){if(z(s[f]))continue;var l=w(s[f]);let E=l[0];if(l=l[1],typeof l!="string")continue;l=l.trim();let b=c[E]||[];c[E]=b,b.push(l)}I(c,function(f){return f.join(", ")})}n.Ba=function(){return this.m},n.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function Xn(s,c,l){return l&&l.internalChannelParams&&l.internalChannelParams[s]||c}function hl(s){this.Aa=0,this.i=[],this.j=new Gn,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=Xn("failFast",!1,s),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=Xn("baseRetryDelayMs",5e3,s),this.cb=Xn("retryDelaySeedMs",1e4,s),this.Wa=Xn("forwardChannelMaxRetries",2,s),this.wa=Xn("forwardChannelRequestTimeoutMs",2e4,s),this.pa=s&&s.xmlHttpFactory||void 0,this.Xa=s&&s.Tb||void 0,this.Ca=s&&s.useFetchStreams||!1,this.L=void 0,this.J=s&&s.supportsCrossDomainXhr||!1,this.K="",this.h=new $u(s&&s.concurrentRequestLimit),this.Da=new Ep,this.P=s&&s.fastHandshake||!1,this.O=s&&s.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=s&&s.Rb||!1,s&&s.xa&&this.j.xa(),s&&s.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&s&&s.detectBufferingProxy||!1,this.ja=void 0,s&&s.longPollingTimeout&&0<s.longPollingTimeout&&(this.ja=s.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}n=hl.prototype,n.la=8,n.G=1,n.connect=function(s,c,l,f){Ee(0),this.W=s,this.H=c||{},l&&f!==void 0&&(this.H.OSID=l,this.H.OAID=f),this.F=this.X,this.I=Il(this,null,this.W),ri(this)};function to(s){if(dl(s),s.G==3){var c=s.U++,l=Ye(s.I);if(Z(l,"SID",s.K),Z(l,"RID",c),Z(l,"TYPE","terminate"),Zn(s,l),c=new ct(s,s.j,c),c.L=2,c.v=Zr(Ye(l)),l=!1,u.navigator&&u.navigator.sendBeacon)try{l=u.navigator.sendBeacon(c.v.toString(),"")}catch{}!l&&u.Image&&(new Image().src=c.v,l=!0),l||(c.g=wl(c.j,null),c.g.ea(c.v)),c.F=Date.now(),Jr(c)}vl(s)}function ni(s){s.g&&(ro(s),s.g.cancel(),s.g=null)}function dl(s){ni(s),s.u&&(u.clearTimeout(s.u),s.u=null),ii(s),s.h.cancel(),s.s&&(typeof s.s=="number"&&u.clearTimeout(s.s),s.s=null)}function ri(s){if(!Hu(s.h)&&!s.s){s.s=!0;var c=s.Ga;Ln||Au(),Mn||(Ln(),Mn=!0),xs.add(c,s),s.B=0}}function Rp(s,c){return Wu(s.h)>=s.h.j-(s.s?1:0)?!1:s.s?(s.i=c.D.concat(s.i),!0):s.G==1||s.G==2||s.B>=(s.Va?0:s.Wa)?!1:(s.s=zn(T(s.Ga,s,c),yl(s,s.B)),s.B++,!0)}n.Ga=function(s){if(this.s)if(this.s=null,this.G==1){if(!s){this.U=Math.floor(1e5*Math.random()),s=this.U++;let E=new ct(this,this.j,s),b=this.o;if(this.S&&(b?(b=m(b),v(b,this.S)):b=this.S),this.m!==null||this.O||(E.H=b,b=null),this.P)e:{for(var c=0,l=0;l<this.i.length;l++){t:{var f=this.i[l];if("__data__"in f.map&&(f=f.map.__data__,typeof f=="string")){f=f.length;break t}f=void 0}if(f===void 0)break;if(c+=f,4096<c){c=l;break e}if(c===4096||l===this.i.length-1){c=l+1;break e}}c=1e3}else c=1e3;c=pl(this,E,c),l=Ye(this.I),Z(l,"RID",s),Z(l,"CVER",22),this.D&&Z(l,"X-HTTP-Session-Id",this.D),Zn(this,l),b&&(this.O?c="headers="+encodeURIComponent(String(sl(b)))+"&"+c:this.m&&eo(l,this.m,b)),Zs(this.h,E),this.Ua&&Z(l,"TYPE","init"),this.P?(Z(l,"$req",c),Z(l,"SID","null"),E.T=!0,Qs(E,l,null)):Qs(E,l,c),this.G=2}}else this.G==3&&(s?fl(this,s):this.i.length==0||Hu(this.h)||fl(this))};function fl(s,c){var l;c?l=c.l:l=s.U++;let f=Ye(s.I);Z(f,"SID",s.K),Z(f,"RID",l),Z(f,"AID",s.T),Zn(s,f),s.m&&s.o&&eo(f,s.m,s.o),l=new ct(s,s.j,l,s.B+1),s.m===null&&(l.H=s.o),c&&(s.i=c.D.concat(s.i)),c=pl(s,l,1e3),l.I=Math.round(.5*s.wa)+Math.round(.5*s.wa*Math.random()),Zs(s.h,l),Qs(l,f,c)}function Zn(s,c){s.H&&Q(s.H,function(l,f){Z(c,f,l)}),s.l&&Yu({},function(l,f){Z(c,f,l)})}function pl(s,c,l){l=Math.min(s.i.length,l);var f=s.l?T(s.l.Na,s.l,s):null;e:{var E=s.i;let b=-1;for(;;){let C=["count="+l];b==-1?0<l?(b=E[0].g,C.push("ofs="+b)):b=0:C.push("ofs="+b);let J=!0;for(let le=0;le<l;le++){let $=E[le].g,pe=E[le].map;if($-=b,0>$)b=Math.max(0,E[le].g-100),J=!1;else try{Tp(pe,C,"req"+$+"_")}catch{f&&f(pe)}}if(J){f=C.join("&");break e}}}return s=s.i.splice(0,l),c.D=s,f}function ml(s){if(!s.g&&!s.u){s.Y=1;var c=s.Fa;Ln||Au(),Mn||(Ln(),Mn=!0),xs.add(c,s),s.v=0}}function no(s){return s.g||s.u||3<=s.v?!1:(s.Y++,s.u=zn(T(s.Fa,s),yl(s,s.v)),s.v++,!0)}n.Fa=function(){if(this.u=null,gl(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var s=2*this.R;this.j.info("BP detection timer enabled: "+s),this.A=zn(T(this.ab,this),s)}},n.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,Ee(10),ni(this),gl(this))};function ro(s){s.A!=null&&(u.clearTimeout(s.A),s.A=null)}function gl(s){s.g=new ct(s,s.j,"rpc",s.Y),s.m===null&&(s.g.H=s.o),s.g.O=0;var c=Ye(s.qa);Z(c,"RID","rpc"),Z(c,"SID",s.K),Z(c,"AID",s.T),Z(c,"CI",s.F?"0":"1"),!s.F&&s.ja&&Z(c,"TO",s.ja),Z(c,"TYPE","xmlhttp"),Zn(s,c),s.m&&s.o&&eo(c,s.m,s.o),s.L&&(s.g.I=s.L);var l=s.g;s=s.ia,l.L=1,l.v=Zr(Ye(c)),l.m=null,l.P=!0,zu(l,s)}n.Za=function(){this.C!=null&&(this.C=null,ni(this),no(this),Ee(19))};function ii(s){s.C!=null&&(u.clearTimeout(s.C),s.C=null)}function _l(s,c){var l=null;if(s.g==c){ii(s),ro(s),s.g=null;var f=2}else if(Xs(s.h,c))l=c.D,Qu(s.h,c),f=1;else return;if(s.G!=0){if(c.o)if(f==1){l=c.m?c.m.length:0,c=Date.now()-c.F;var E=s.B;f=Hr(),we(f,new Uu(f,l)),ri(s)}else ml(s);else if(E=c.s,E==3||E==0&&0<c.X||!(f==1&&Rp(s,c)||f==2&&no(s)))switch(l&&0<l.length&&(c=s.h,c.i=c.i.concat(l)),E){case 1:Nt(s,5);break;case 4:Nt(s,10);break;case 3:Nt(s,6);break;default:Nt(s,2)}}}function yl(s,c){let l=s.Ta+Math.floor(Math.random()*s.cb);return s.isActive()||(l*=2),l*c}function Nt(s,c){if(s.j.info("Error code "+c),c==2){var l=T(s.fb,s),f=s.Xa;let E=!f;f=new Dt(f||"//www.google.com/images/cleardot.gif"),u.location&&u.location.protocol=="http"||Yr(f,"https"),Zr(f),E?Ip(f.toString(),l):wp(f.toString(),l)}else Ee(2);s.G=0,s.l&&s.l.sa(c),vl(s),dl(s)}n.fb=function(s){s?(this.j.info("Successfully pinged google.com"),Ee(2)):(this.j.info("Failed to ping google.com"),Ee(1))};function vl(s){if(s.G=0,s.ka=[],s.l){let c=Ju(s.h);(c.length!=0||s.i.length!=0)&&(D(s.ka,c),D(s.ka,s.i),s.h.i.length=0,x(s.i),s.i.length=0),s.l.ra()}}function Il(s,c,l){var f=l instanceof Dt?Ye(l):new Dt(l);if(f.g!="")c&&(f.g=c+"."+f.g),Xr(f,f.s);else{var E=u.location;f=E.protocol,c=c?c+"."+E.hostname:E.hostname,E=+E.port;var b=new Dt(null);f&&Yr(b,f),c&&(b.g=c),E&&Xr(b,E),l&&(b.l=l),f=b}return l=s.D,c=s.ya,l&&c&&Z(f,l,c),Z(f,"VER",s.la),Zn(s,f),f}function wl(s,c,l){if(c&&!s.J)throw Error("Can't create secondary domain capable XhrIo object.");return c=s.Ca&&!s.pa?new te(new Qn({eb:l})):new te(s.pa),c.Ha(s.J),c}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function El(){}n=El.prototype,n.ua=function(){},n.ta=function(){},n.sa=function(){},n.ra=function(){},n.isActive=function(){return!0},n.Na=function(){};function si(){}si.prototype.g=function(s,c){return new Se(s,c)};function Se(s,c){fe.call(this),this.g=new hl(c),this.l=s,this.h=c&&c.messageUrlParams||null,s=c&&c.messageHeaders||null,c&&c.clientProtocolHeaderRequired&&(s?s["X-Client-Protocol"]="webchannel":s={"X-Client-Protocol":"webchannel"}),this.g.o=s,s=c&&c.initMessageHeaders||null,c&&c.messageContentType&&(s?s["X-WebChannel-Content-Type"]=c.messageContentType:s={"X-WebChannel-Content-Type":c.messageContentType}),c&&c.va&&(s?s["X-WebChannel-Client-Profile"]=c.va:s={"X-WebChannel-Client-Profile":c.va}),this.g.S=s,(s=c&&c.Sb)&&!z(s)&&(this.g.m=s),this.v=c&&c.supportsCrossDomainXhr||!1,this.u=c&&c.sendRawJson||!1,(c=c&&c.httpSessionIdParam)&&!z(c)&&(this.g.D=c,s=this.h,s!==null&&c in s&&(s=this.h,c in s&&delete s[c])),this.j=new en(this)}k(Se,fe),Se.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Se.prototype.close=function(){to(this.g)},Se.prototype.o=function(s){var c=this.g;if(typeof s=="string"){var l={};l.__data__=s,s=l}else this.u&&(l={},l.__data__=zs(s),s=l);c.i.push(new lp(c.Ya++,s)),c.G==3&&ri(c)},Se.prototype.N=function(){this.g.l=null,delete this.j,to(this.g),delete this.g,Se.aa.N.call(this)};function Tl(s){Ks.call(this),s.__headers__&&(this.headers=s.__headers__,this.statusCode=s.__status__,delete s.__headers__,delete s.__status__);var c=s.__sm__;if(c){e:{for(let l in c){s=l;break e}s=void 0}(this.i=s)&&(s=this.i,c=c!==null&&s in c?c[s]:void 0),this.data=c}else this.data=s}k(Tl,Ks);function Al(){$s.call(this),this.status=1}k(Al,$s);function en(s){this.g=s}k(en,El),en.prototype.ua=function(){we(this.g,"a")},en.prototype.ta=function(s){we(this.g,new Tl(s))},en.prototype.sa=function(s){we(this.g,new Al)},en.prototype.ra=function(){we(this.g,"b")},si.prototype.createWebChannel=si.prototype.g,Se.prototype.send=Se.prototype.o,Se.prototype.open=Se.prototype.m,Se.prototype.close=Se.prototype.close,ma=rt.createWebChannelTransport=function(){return new si},pa=rt.getStatEventTarget=function(){return Hr()},fa=rt.Event=Pt,Gi=rt.Stat={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},Wr.NO_ERROR=0,Wr.TIMEOUT=8,Wr.HTTP_ERROR=6,pr=rt.ErrorCode=Wr,qu.COMPLETE="complete",da=rt.EventType=qu,Vu.EventType=Bn,Bn.OPEN="a",Bn.CLOSE="b",Bn.ERROR="c",Bn.MESSAGE="d",fe.prototype.listen=fe.prototype.K,ln=rt.WebChannel=Vu,ha=rt.FetchXmlHttpFactory=Qn,te.prototype.listenOnce=te.prototype.L,te.prototype.getLastError=te.prototype.Ka,te.prototype.getLastErrorCode=te.prototype.Ba,te.prototype.getStatus=te.prototype.Z,te.prototype.getResponseJson=te.prototype.Oa,te.prototype.getResponseText=te.prototype.oa,te.prototype.send=te.prototype.ea,te.prototype.setWithCredentials=te.prototype.Ha,la=rt.XhrIo=te}).apply(typeof zi!="undefined"?zi:typeof self!="undefined"?self:typeof window!="undefined"?window:{});var Yh="@firebase/firestore";var _e=class{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}};_e.UNAUTHENTICATED=new _e(null),_e.GOOGLE_CREDENTIALS=new _e("google-credentials-uid"),_e.FIRST_PARTY=new _e("first-party-uid"),_e.MOCK_USER=new _e("mock-user");var kn="10.12.1";var jt=new dt("@firebase/firestore");function mr(){return jt.logLevel}function O(n,...e){if(jt.logLevel<=B.DEBUG){let t=e.map(tu);jt.debug(`Firestore (${kn}): ${n}`,...t)}}function it(n,...e){if(jt.logLevel<=B.ERROR){let t=e.map(tu);jt.error(`Firestore (${kn}): ${n}`,...t)}}function Er(n,...e){if(jt.logLevel<=B.WARN){let t=e.map(tu);jt.warn(`Firestore (${kn}): ${n}`,...t)}}function tu(n){if(typeof n=="string")return n;try{return function(t){return JSON.stringify(t)}(n)}catch{return n}}function M(n="Unexpected state"){let e=`FIRESTORE (${kn}) INTERNAL ASSERTION FAILED: `+n;throw it(e),new Error(e)}function W(n,e){n||M()}function U(n,e){return n}var S={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"},N=class extends Re{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}};var Oe=class{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}};var va=class{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}},Ia=class{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(_e.UNAUTHENTICATED))}shutdown(){}};var wa=class{constructor(e){this.t=e,this.currentUser=_e.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){let r=this.i,i=h=>this.i!==r?(r=this.i,t(h)):Promise.resolve(),o=new Oe;this.o=()=>{this.i++,this.currentUser=this.u(),o.resolve(),o=new Oe,e.enqueueRetryable(()=>i(this.currentUser))};let a=()=>{let h=o;e.enqueueRetryable(async()=>{await h.promise,await i(this.currentUser)})},u=h=>{O("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=h,this.auth.addAuthTokenListener(this.o),a()};this.t.onInit(h=>u(h)),setTimeout(()=>{if(!this.auth){let h=this.t.getImmediate({optional:!0});h?u(h):(O("FirebaseAuthCredentialsProvider","Auth not yet detected"),o.resolve(),o=new Oe)}},0),a()}getToken(){let e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(r=>this.i!==e?(O("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(W(typeof r.accessToken=="string"),new va(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.auth.removeAuthTokenListener(this.o)}u(){let e=this.auth&&this.auth.getUid();return W(e===null||typeof e=="string"),new _e(e)}},Ea=class{constructor(e,t,r){this.l=e,this.h=t,this.P=r,this.type="FirstParty",this.user=_e.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);let e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}},Ta=class{constructor(e,t,r){this.l=e,this.h=t,this.P=r}getToken(){return Promise.resolve(new Ea(this.l,this.h,this.P))}start(e,t){e.enqueueRetryable(()=>t(_e.FIRST_PARTY))}shutdown(){}invalidateToken(){}},Aa=class{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}},ba=class{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,t){let r=o=>{o.error!=null&&O("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${o.error.message}`);let a=o.token!==this.R;return this.R=o.token,O("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?t(o.token):Promise.resolve()};this.o=o=>{e.enqueueRetryable(()=>r(o))};let i=o=>{O("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=o,this.appCheck.addTokenListener(this.o)};this.A.onInit(o=>i(o)),setTimeout(()=>{if(!this.appCheck){let o=this.A.getImmediate({optional:!0});o?i(o):O("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){let e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(W(typeof t.token=="string"),this.R=t.token,new Aa(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.appCheck.removeTokenListener(this.o)}};function B_(n){let e=typeof self!="undefined"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}var Qi=class{static newId(){let e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=Math.floor(256/e.length)*e.length,r="";for(;r.length<20;){let i=B_(40);for(let o=0;o<i.length;++o)r.length<20&&i[o]<t&&(r+=e.charAt(i[o]%e.length))}return r}};function H(n,e){return n<e?-1:n>e?1:0}function _n(n,e,t){return n.length===e.length&&n.every((r,i)=>t(r,e[i]))}var ue=class n{constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new N(S.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new N(S.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<-62135596800)throw new N(S.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new N(S.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return n.fromMillis(Date.now())}static fromDate(e){return n.fromMillis(e.getTime())}static fromMillis(e){let t=Math.floor(e/1e3),r=Math.floor(1e6*(e-1e3*t));return new n(t,r)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?H(this.nanoseconds,e.nanoseconds):H(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){let e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}};var F=class n{constructor(e){this.timestamp=e}static fromTimestamp(e){return new n(e)}static min(){return new n(new ue(0,0))}static max(){return new n(new ue(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}};var Ji=class n{constructor(e,t,r){t===void 0?t=0:t>e.length&&M(),r===void 0?r=e.length-t:r>e.length-t&&M(),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return n.comparator(this,e)===0}child(e){let t=this.segments.slice(this.offset,this.limit());return e instanceof n?e.forEach(r=>{t.push(r)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){let r=Math.min(e.length,t.length);for(let i=0;i<r;i++){let o=e.get(i),a=t.get(i);if(o<a)return-1;if(o>a)return 1}return e.length<t.length?-1:e.length>t.length?1:0}},Y=class n extends Ji{construct(e,t,r){return new n(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){let t=[];for(let r of e){if(r.indexOf("//")>=0)throw new N(S.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(i=>i.length>0))}return new n(t)}static emptyPath(){return new n([])}},j_=/^[_a-zA-Z][_a-zA-Z0-9]*$/,Pe=class n extends Ji{construct(e,t,r){return new n(e,t,r)}static isValidIdentifier(e){return j_.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),n.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new n(["__name__"])}static fromServerFormat(e){let t=[],r="",i=0,o=()=>{if(r.length===0)throw new N(S.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""},a=!1;for(;i<e.length;){let u=e[i];if(u==="\\"){if(i+1===e.length)throw new N(S.INVALID_ARGUMENT,"Path has trailing escape character: "+e);let h=e[i+1];if(h!=="\\"&&h!=="."&&h!=="`")throw new N(S.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=h,i+=2}else u==="`"?(a=!a,i++):u!=="."||a?(r+=u,i++):(o(),i++)}if(o(),a)throw new N(S.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new n(t)}static emptyPath(){return new n([])}};var L=class n{constructor(e){this.path=e}static fromPath(e){return new n(Y.fromString(e))}static fromName(e){return new n(Y.fromString(e).popFirst(5))}static empty(){return new n(Y.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&Y.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return Y.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new n(new Y(e.slice()))}};var Sa=class{constructor(e,t,r,i){this.indexId=e,this.collectionGroup=t,this.fields=r,this.indexState=i}};Sa.UNKNOWN_ID=-1;function z_(n,e){let t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,i=F.fromTimestamp(r===1e9?new ue(t+1,0):new ue(t,r));return new zt(i,L.empty(),e)}function G_(n){return new zt(n.readTime,n.key,-1)}var zt=class n{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new n(F.min(),L.empty(),-1)}static max(){return new n(F.max(),L.empty(),-1)}};function K_(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=L.comparator(n.documentKey,e.documentKey),t!==0?t:H(n.largestBatchId,e.largestBatchId))}var $_="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.",Ra=class{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}};async function Fr(n){if(n.code!==S.FAILED_PRECONDITION||n.message!==$_)throw n;O("LocalStore","Unexpectedly lost primary lease")}var P=class n{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&M(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new n((r,i)=>{this.nextCallback=o=>{this.wrapSuccess(e,o).next(r,i)},this.catchCallback=o=>{this.wrapFailure(t,o).next(r,i)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{let t=e();return t instanceof n?t:n.resolve(t)}catch(t){return n.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):n.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):n.reject(t)}static resolve(e){return new n((t,r)=>{t(e)})}static reject(e){return new n((t,r)=>{r(e)})}static waitFor(e){return new n((t,r)=>{let i=0,o=0,a=!1;e.forEach(u=>{++i,u.next(()=>{++o,a&&o===i&&t()},h=>r(h))}),a=!0,o===i&&t()})}static or(e){let t=n.resolve(!1);for(let r of e)t=t.next(i=>i?n.resolve(i):r());return t}static forEach(e,t){let r=[];return e.forEach((i,o)=>{r.push(t.call(this,i,o))}),this.waitFor(r)}static mapArray(e,t){return new n((r,i)=>{let o=e.length,a=new Array(o),u=0;for(let h=0;h<o;h++){let d=h;t(e[d]).next(p=>{a[d]=p,++u,u===o&&r(a)},p=>i(p))}})}static doWhile(e,t){return new n((r,i)=>{let o=()=>{e()===!0?t().next(()=>{o()},i):r()};o()})}};function H_(n){let e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function Ur(n){return n.name==="IndexedDbTransactionError"}var Tr=class{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.ie(r),this.se=r=>t.writeSequenceNumber(r))}ie(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){let e=++this.previousValue;return this.se&&this.se(e),e}};Tr.oe=-1;function qr(n){return n==null}function Ar(n){return n===0&&1/n==-1/0}function W_(n){return typeof n=="number"&&Number.isInteger(n)&&!Ar(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}var Q_=["mutationQueues","mutations","documentMutations","remoteDocuments","targets","owner","targetGlobal","targetDocuments","clientMetadata","remoteDocumentGlobal","collectionParents","bundles","namedQueries"],ww=[...Q_,"documentOverlays"],J_=["mutationQueues","mutations","documentMutations","remoteDocumentsV14","targets","owner","targetGlobal","targetDocuments","clientMetadata","remoteDocumentGlobal","collectionParents","bundles","namedQueries","documentOverlays"],Y_=J_,Ew=[...Y_,"indexConfiguration","indexState","indexEntries"];function Xh(n){let e=0;for(let t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function Jt(n,e){for(let t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function Cd(n){for(let e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}var re=class n{constructor(e,t){this.comparator=e,this.root=t||Ke.EMPTY}insert(e,t){return new n(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Ke.BLACK,null,null))}remove(e){return new n(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Ke.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){let r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){let i=this.comparator(e,r.key);if(i===0)return t+r.left.size;i<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){let e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new pn(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new pn(this.root,e,this.comparator,!1)}getReverseIterator(){return new pn(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new pn(this.root,e,this.comparator,!0)}},pn=class{constructor(e,t,r,i){this.isReverse=i,this.nodeStack=[];let o=1;for(;!e.isEmpty();)if(o=t?r(e.key,t):1,t&&i&&(o*=-1),o<0)e=this.isReverse?e.left:e.right;else{if(o===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop(),t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;let e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}},Ke=class n{constructor(e,t,r,i,o){this.key=e,this.value=t,this.color=r!=null?r:n.RED,this.left=i!=null?i:n.EMPTY,this.right=o!=null?o:n.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,i,o){return new n(e!=null?e:this.key,t!=null?t:this.value,r!=null?r:this.color,i!=null?i:this.left,o!=null?o:this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let i=this,o=r(e,i.key);return i=o<0?i.copy(null,null,null,i.left.insert(e,t,r),null):o===0?i.copy(null,t,null,null,null):i.copy(null,null,null,null,i.right.insert(e,t,r)),i.fixUp()}removeMin(){if(this.left.isEmpty())return n.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,i=this;if(t(e,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(e,t),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),t(e,i.key)===0){if(i.right.isEmpty())return n.EMPTY;r=i.right.min(),i=i.copy(r.key,r.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(e,t))}return i.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){let e=this.copy(null,null,n.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){let e=this.copy(null,null,n.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){let e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){let e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw M();let e=this.left.check();if(e!==this.right.check())throw M();return e+(this.isRed()?0:1)}};Ke.EMPTY=null,Ke.RED=!0,Ke.BLACK=!1;Ke.EMPTY=new class{constructor(){this.size=0}get key(){throw M()}get value(){throw M()}get color(){throw M()}get left(){throw M()}get right(){throw M()}copy(e,t,r,i,o){return this}insert(e,t,r){return new Ke(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};var ye=class n{constructor(e){this.comparator=e,this.data=new re(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){let r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){let i=r.getNext();if(this.comparator(i.key,e[1])>=0)return;t(i.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){let t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new Yi(this.data.getIterator())}getIteratorFrom(e){return new Yi(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(r=>{t=t.add(r)}),t}isEqual(e){if(!(e instanceof n)||this.size!==e.size)return!1;let t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){let i=t.getNext().key,o=r.getNext().key;if(this.comparator(i,o)!==0)return!1}return!0}toArray(){let e=[];return this.forEach(t=>{e.push(t)}),e}toString(){let e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){let t=new n(this.comparator);return t.data=e,t}},Yi=class{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}};var ke=class n{constructor(e){this.fields=e,e.sort(Pe.comparator)}static empty(){return new n([])}unionWith(e){let t=new ye(Pe.comparator);for(let r of this.fields)t=t.add(r);for(let r of e)t=t.add(r);return new n(t.toArray())}covers(e){for(let t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return _n(this.fields,e.fields,(t,r)=>t.isEqual(r))}};var Xi=class extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}};var Ae=class n{constructor(e){this.binaryString=e}static fromBase64String(e){let t=function(i){try{return atob(i)}catch(o){throw typeof DOMException!="undefined"&&o instanceof DOMException?new Xi("Invalid base64 string: "+o):o}}(e);return new n(t)}static fromUint8Array(e){let t=function(i){let o="";for(let a=0;a<i.length;++a)o+=String.fromCharCode(i[a]);return o}(e);return new n(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){let r=new Uint8Array(t.length);for(let i=0;i<t.length;i++)r[i]=t.charCodeAt(i);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return H(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}};Ae.EMPTY_BYTE_STRING=new Ae("");var X_=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function st(n){if(W(!!n),typeof n=="string"){let e=0,t=X_.exec(n);if(W(!!t),t[1]){let i=t[1];i=(i+"000000000").substr(0,9),e=Number(i)}let r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:ne(n.seconds),nanos:ne(n.nanos)}}function ne(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function Tt(n){return typeof n=="string"?Ae.fromBase64String(n):Ae.fromUint8Array(n)}function nu(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="server_timestamp"}function ru(n){let e=n.mapValue.fields.__previous_value__;return nu(e)?ru(e):e}function br(n){let e=st(n.mapValue.fields.__local_write_time__.timestampValue);return new ue(e.seconds,e.nanos)}var Pa=class{constructor(e,t,r,i,o,a,u,h,d){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=i,this.ssl=o,this.forceLongPolling=a,this.autoDetectLongPolling=u,this.longPollingOptions=h,this.useFetchStreams=d}},Zi=class n{constructor(e,t){this.projectId=e,this.database=t||"(default)"}static empty(){return new n("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof n&&e.projectId===this.projectId&&e.database===this.database}};var Ki={mapValue:{fields:{__type__:{stringValue:"__max__"}}}};function Gt(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?nu(n)?4:Dd(n)?9007199254740991:10:M()}function He(n,e){if(n===e)return!0;let t=Gt(n);if(t!==Gt(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return br(n).isEqual(br(e));case 3:return function(i,o){if(typeof i.timestampValue=="string"&&typeof o.timestampValue=="string"&&i.timestampValue.length===o.timestampValue.length)return i.timestampValue===o.timestampValue;let a=st(i.timestampValue),u=st(o.timestampValue);return a.seconds===u.seconds&&a.nanos===u.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(i,o){return Tt(i.bytesValue).isEqual(Tt(o.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(i,o){return ne(i.geoPointValue.latitude)===ne(o.geoPointValue.latitude)&&ne(i.geoPointValue.longitude)===ne(o.geoPointValue.longitude)}(n,e);case 2:return function(i,o){if("integerValue"in i&&"integerValue"in o)return ne(i.integerValue)===ne(o.integerValue);if("doubleValue"in i&&"doubleValue"in o){let a=ne(i.doubleValue),u=ne(o.doubleValue);return a===u?Ar(a)===Ar(u):isNaN(a)&&isNaN(u)}return!1}(n,e);case 9:return _n(n.arrayValue.values||[],e.arrayValue.values||[],He);case 10:return function(i,o){let a=i.mapValue.fields||{},u=o.mapValue.fields||{};if(Xh(a)!==Xh(u))return!1;for(let h in a)if(a.hasOwnProperty(h)&&(u[h]===void 0||!He(a[h],u[h])))return!1;return!0}(n,e);default:return M()}}function Sr(n,e){return(n.values||[]).find(t=>He(t,e))!==void 0}function yn(n,e){if(n===e)return 0;let t=Gt(n),r=Gt(e);if(t!==r)return H(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return H(n.booleanValue,e.booleanValue);case 2:return function(o,a){let u=ne(o.integerValue||o.doubleValue),h=ne(a.integerValue||a.doubleValue);return u<h?-1:u>h?1:u===h?0:isNaN(u)?isNaN(h)?0:-1:1}(n,e);case 3:return Zh(n.timestampValue,e.timestampValue);case 4:return Zh(br(n),br(e));case 5:return H(n.stringValue,e.stringValue);case 6:return function(o,a){let u=Tt(o),h=Tt(a);return u.compareTo(h)}(n.bytesValue,e.bytesValue);case 7:return function(o,a){let u=o.split("/"),h=a.split("/");for(let d=0;d<u.length&&d<h.length;d++){let p=H(u[d],h[d]);if(p!==0)return p}return H(u.length,h.length)}(n.referenceValue,e.referenceValue);case 8:return function(o,a){let u=H(ne(o.latitude),ne(a.latitude));return u!==0?u:H(ne(o.longitude),ne(a.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return function(o,a){let u=o.values||[],h=a.values||[];for(let d=0;d<u.length&&d<h.length;++d){let p=yn(u[d],h[d]);if(p)return p}return H(u.length,h.length)}(n.arrayValue,e.arrayValue);case 10:return function(o,a){if(o===Ki.mapValue&&a===Ki.mapValue)return 0;if(o===Ki.mapValue)return 1;if(a===Ki.mapValue)return-1;let u=o.fields||{},h=Object.keys(u),d=a.fields||{},p=Object.keys(d);h.sort(),p.sort();for(let y=0;y<h.length&&y<p.length;++y){let T=H(h[y],p[y]);if(T!==0)return T;let R=yn(u[h[y]],d[p[y]]);if(R!==0)return R}return H(h.length,p.length)}(n.mapValue,e.mapValue);default:throw M()}}function Zh(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return H(n,e);let t=st(n),r=st(e),i=H(t.seconds,r.seconds);return i!==0?i:H(t.nanos,r.nanos)}function vn(n){return Ca(n)}function Ca(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(t){let r=st(t);return`time(${r.seconds},${r.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(t){return Tt(t).toBase64()}(n.bytesValue):"referenceValue"in n?function(t){return L.fromName(t).toString()}(n.referenceValue):"geoPointValue"in n?function(t){return`geo(${t.latitude},${t.longitude})`}(n.geoPointValue):"arrayValue"in n?function(t){let r="[",i=!0;for(let o of t.values||[])i?i=!1:r+=",",r+=Ca(o);return r+"]"}(n.arrayValue):"mapValue"in n?function(t){let r=Object.keys(t.fields||{}).sort(),i="{",o=!0;for(let a of r)o?o=!1:i+=",",i+=`${a}:${Ca(t.fields[a])}`;return i+"}"}(n.mapValue):M()}function ed(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function Da(n){return!!n&&"integerValue"in n}function iu(n){return!!n&&"arrayValue"in n}function td(n){return!!n&&"nullValue"in n}function nd(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function Hi(n){return!!n&&"mapValue"in n}function _r(n){if(n.geoPointValue)return{geoPointValue:Object.assign({},n.geoPointValue)};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:Object.assign({},n.timestampValue)};if(n.mapValue){let e={mapValue:{fields:{}}};return Jt(n.mapValue.fields,(t,r)=>e.mapValue.fields[t]=_r(r)),e}if(n.arrayValue){let e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=_r(n.arrayValue.values[t]);return e}return Object.assign({},n)}function Dd(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}var be=class n{constructor(e){this.value=e}static empty(){return new n({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!Hi(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=_r(t)}setAll(e){let t=Pe.emptyPath(),r={},i=[];e.forEach((a,u)=>{if(!t.isImmediateParentOf(u)){let h=this.getFieldsMap(t);this.applyChanges(h,r,i),r={},i=[],t=u.popLast()}a?r[u.lastSegment()]=_r(a):i.push(u.lastSegment())});let o=this.getFieldsMap(t);this.applyChanges(o,r,i)}delete(e){let t=this.field(e.popLast());Hi(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return He(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let i=t.mapValue.fields[e.get(r)];Hi(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=i),t=i}return t.mapValue.fields}applyChanges(e,t,r){Jt(t,(i,o)=>e[i]=o);for(let i of r)delete e[i]}clone(){return new n(_r(this.value))}};function Nd(n){let e=[];return Jt(n.fields,(t,r)=>{let i=new Pe([t]);if(Hi(r)){let o=Nd(r.mapValue).fields;if(o.length===0)e.push(i);else for(let a of o)e.push(i.child(a))}else e.push(i)}),new ke(e)}var De=class n{constructor(e,t,r,i,o,a,u){this.key=e,this.documentType=t,this.version=r,this.readTime=i,this.createTime=o,this.data=a,this.documentState=u}static newInvalidDocument(e){return new n(e,0,F.min(),F.min(),F.min(),be.empty(),0)}static newFoundDocument(e,t,r,i){return new n(e,1,t,F.min(),r,i,0)}static newNoDocument(e,t){return new n(e,2,t,F.min(),F.min(),be.empty(),0)}static newUnknownDocument(e,t){return new n(e,3,t,F.min(),F.min(),be.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(F.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=be.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=be.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=F.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof n&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new n(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}};var In=class{constructor(e,t){this.position=e,this.inclusive=t}};function rd(n,e,t){let r=0;for(let i=0;i<n.position.length;i++){let o=e[i],a=n.position[i];if(o.field.isKeyField()?r=L.comparator(L.fromName(a.referenceValue),t.key):r=yn(a,t.data.field(o.field)),o.dir==="desc"&&(r*=-1),r!==0)break}return r}function id(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!He(n.position[t],e.position[t]))return!1;return!0}var wn=class{constructor(e,t="asc"){this.field=e,this.dir=t}};function Z_(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}var es=class{},oe=class n extends es{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new ka(e,t,r):t==="array-contains"?new Va(e,r):t==="in"?new La(e,r):t==="not-in"?new Ma(e,r):t==="array-contains-any"?new Fa(e,r):new n(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new Oa(e,r):new xa(e,r)}matches(e){let t=e.data.field(this.field);return this.op==="!="?t!==null&&this.matchesComparison(yn(t,this.value)):t!==null&&Gt(this.value)===Gt(t)&&this.matchesComparison(yn(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return M()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}},Ue=class n extends es{constructor(e,t){super(),this.filters=e,this.op=t,this.ae=null}static create(e,t){return new n(e,t)}matches(e){return kd(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.ae!==null||(this.ae=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}};function kd(n){return n.op==="and"}function Od(n){return ey(n)&&kd(n)}function ey(n){for(let e of n.filters)if(e instanceof Ue)return!1;return!0}function Na(n){if(n instanceof oe)return n.field.canonicalString()+n.op.toString()+vn(n.value);if(Od(n))return n.filters.map(e=>Na(e)).join(",");{let e=n.filters.map(t=>Na(t)).join(",");return`${n.op}(${e})`}}function xd(n,e){return n instanceof oe?function(r,i){return i instanceof oe&&r.op===i.op&&r.field.isEqual(i.field)&&He(r.value,i.value)}(n,e):n instanceof Ue?function(r,i){return i instanceof Ue&&r.op===i.op&&r.filters.length===i.filters.length?r.filters.reduce((o,a,u)=>o&&xd(a,i.filters[u]),!0):!1}(n,e):void M()}function Vd(n){return n instanceof oe?function(t){return`${t.field.canonicalString()} ${t.op} ${vn(t.value)}`}(n):n instanceof Ue?function(t){return t.op.toString()+" {"+t.getFilters().map(Vd).join(" ,")+"}"}(n):"Filter"}var ka=class extends oe{constructor(e,t,r){super(e,t,r),this.key=L.fromName(r.referenceValue)}matches(e){let t=L.comparator(e.key,this.key);return this.matchesComparison(t)}},Oa=class extends oe{constructor(e,t){super(e,"in",t),this.keys=Ld("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}},xa=class extends oe{constructor(e,t){super(e,"not-in",t),this.keys=Ld("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}};function Ld(n,e){var t;return(((t=e.arrayValue)===null||t===void 0?void 0:t.values)||[]).map(r=>L.fromName(r.referenceValue))}var Va=class extends oe{constructor(e,t){super(e,"array-contains",t)}matches(e){let t=e.data.field(this.field);return iu(t)&&Sr(t.arrayValue,this.value)}},La=class extends oe{constructor(e,t){super(e,"in",t)}matches(e){let t=e.data.field(this.field);return t!==null&&Sr(this.value.arrayValue,t)}},Ma=class extends oe{constructor(e,t){super(e,"not-in",t)}matches(e){if(Sr(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;let t=e.data.field(this.field);return t!==null&&!Sr(this.value.arrayValue,t)}},Fa=class extends oe{constructor(e,t){super(e,"array-contains-any",t)}matches(e){let t=e.data.field(this.field);return!(!iu(t)||!t.arrayValue.values)&&t.arrayValue.values.some(r=>Sr(this.value.arrayValue,r))}};var Ua=class{constructor(e,t=null,r=[],i=[],o=null,a=null,u=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=i,this.limit=o,this.startAt=a,this.endAt=u,this.ue=null}};function sd(n,e=null,t=[],r=[],i=null,o=null,a=null){return new Ua(n,e,t,r,i,o,a)}function su(n){let e=U(n);if(e.ue===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(r=>Na(r)).join(","),t+="|ob:",t+=e.orderBy.map(r=>function(o){return o.field.canonicalString()+o.dir}(r)).join(","),qr(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(r=>vn(r)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(r=>vn(r)).join(",")),e.ue=t}return e.ue}function ou(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!Z_(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!xd(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!id(n.startAt,e.startAt)&&id(n.endAt,e.endAt)}function qa(n){return L.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}var At=class{constructor(e,t=null,r=[],i=[],o=null,a="F",u=null,h=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=i,this.limit=o,this.limitType=a,this.startAt=u,this.endAt=h,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}};function ty(n,e,t,r,i,o,a,u){return new At(n,e,t,r,i,o,a,u)}function Ss(n){return new At(n)}function od(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function Md(n){return n.collectionGroup!==null}function yr(n){let e=U(n);if(e.ce===null){e.ce=[];let t=new Set;for(let o of e.explicitOrderBy)e.ce.push(o),t.add(o.field.canonicalString());let r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let u=new ye(Pe.comparator);return a.filters.forEach(h=>{h.getFlattenedFilters().forEach(d=>{d.isInequality()&&(u=u.add(d.field))})}),u})(e).forEach(o=>{t.has(o.canonicalString())||o.isKeyField()||e.ce.push(new wn(o,r))}),t.has(Pe.keyField().canonicalString())||e.ce.push(new wn(Pe.keyField(),r))}return e.ce}function $e(n){let e=U(n);return e.le||(e.le=ny(e,yr(n))),e.le}function ny(n,e){if(n.limitType==="F")return sd(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map(i=>{let o=i.dir==="desc"?"asc":"desc";return new wn(i.field,o)});let t=n.endAt?new In(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new In(n.startAt.position,n.startAt.inclusive):null;return sd(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function Ba(n,e){let t=n.filters.concat([e]);return new At(n.path,n.collectionGroup,n.explicitOrderBy.slice(),t,n.limit,n.limitType,n.startAt,n.endAt)}function ja(n,e,t){return new At(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function Rs(n,e){return ou($e(n),$e(e))&&n.limitType===e.limitType}function Fd(n){return`${su($e(n))}|lt:${n.limitType}`}function hn(n){return`Query(target=${function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map(i=>Vd(i)).join(", ")}]`),qr(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map(i=>function(a){return`${a.field.canonicalString()} (${a.dir})`}(i)).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map(i=>vn(i)).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map(i=>vn(i)).join(",")),`Target(${r})`}($e(n))}; limitType=${n.limitType})`}function Ps(n,e){return e.isFoundDocument()&&function(r,i){let o=i.key.path;return r.collectionGroup!==null?i.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(o):L.isDocumentKey(r.path)?r.path.isEqual(o):r.path.isImmediateParentOf(o)}(n,e)&&function(r,i){for(let o of yr(r))if(!o.field.isKeyField()&&i.data.field(o.field)===null)return!1;return!0}(n,e)&&function(r,i){for(let o of r.filters)if(!o.matches(i))return!1;return!0}(n,e)&&function(r,i){return!(r.startAt&&!function(a,u,h){let d=rd(a,u,h);return a.inclusive?d<=0:d<0}(r.startAt,yr(r),i)||r.endAt&&!function(a,u,h){let d=rd(a,u,h);return a.inclusive?d>=0:d>0}(r.endAt,yr(r),i))}(n,e)}function ry(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function Ud(n){return(e,t)=>{let r=!1;for(let i of yr(n)){let o=iy(i,e,t);if(o!==0)return o;r=r||i.field.isKeyField()}return 0}}function iy(n,e,t){let r=n.field.isKeyField()?L.comparator(e.key,t.key):function(o,a,u){let h=a.data.field(o),d=u.data.field(o);return h!==null&&d!==null?yn(h,d):M()}(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return M()}}var bt=class{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){let t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(let[i,o]of r)if(this.equalsFn(i,e))return o}}has(e){return this.get(e)!==void 0}set(e,t){let r=this.mapKeyFn(e),i=this.inner[r];if(i===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let o=0;o<i.length;o++)if(this.equalsFn(i[o][0],e))return void(i[o]=[e,t]);i.push([e,t]),this.innerSize++}delete(e){let t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let i=0;i<r.length;i++)if(this.equalsFn(r[i][0],e))return r.length===1?delete this.inner[t]:r.splice(i,1),this.innerSize--,!0;return!1}forEach(e){Jt(this.inner,(t,r)=>{for(let[i,o]of r)e(i,o)})}isEmpty(){return Cd(this.inner)}size(){return this.innerSize}};var sy=new re(L.comparator);function ot(){return sy}var qd=new re(L.comparator);function gr(...n){let e=qd;for(let t of n)e=e.insert(t.key,t);return e}function Bd(n){let e=qd;return n.forEach((t,r)=>e=e.insert(t,r.overlayedDocument)),e}function qt(){return vr()}function jd(){return vr()}function vr(){return new bt(n=>n.toString(),(n,e)=>n.isEqual(e))}var oy=new re(L.comparator),ay=new ye(L.comparator);function j(...n){let e=ay;for(let t of n)e=e.add(t);return e}var cy=new ye(H);function uy(){return cy}function zd(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Ar(e)?"-0":e}}function Gd(n){return{integerValue:""+n}}function ly(n,e){return W_(e)?Gd(e):zd(n,e)}var En=class{constructor(){this._=void 0}};function hy(n,e,t){return n instanceof Kt?function(i,o){let a={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:i.seconds,nanos:i.nanoseconds}}}};return o&&nu(o)&&(o=ru(o)),o&&(a.fields.__previous_value__=o),{mapValue:a}}(t,e):n instanceof $t?$d(n,e):n instanceof Ht?Hd(n,e):function(i,o){let a=Kd(i,o),u=ad(a)+ad(i.Pe);return Da(a)&&Da(i.Pe)?Gd(u):zd(i.serializer,u)}(n,e)}function dy(n,e,t){return n instanceof $t?$d(n,e):n instanceof Ht?Hd(n,e):t}function Kd(n,e){return n instanceof Tn?function(r){return Da(r)||function(o){return!!o&&"doubleValue"in o}(r)}(e)?e:{integerValue:0}:null}var Kt=class extends En{},$t=class extends En{constructor(e){super(),this.elements=e}};function $d(n,e){let t=Wd(e);for(let r of n.elements)t.some(i=>He(i,r))||t.push(r);return{arrayValue:{values:t}}}var Ht=class extends En{constructor(e){super(),this.elements=e}};function Hd(n,e){let t=Wd(e);for(let r of n.elements)t=t.filter(i=>!He(i,r));return{arrayValue:{values:t}}}var Tn=class extends En{constructor(e,t){super(),this.serializer=e,this.Pe=t}};function ad(n){return ne(n.integerValue||n.doubleValue)}function Wd(n){return iu(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}var za=class{constructor(e,t){this.field=e,this.transform=t}};function fy(n,e){return n.field.isEqual(e.field)&&function(r,i){return r instanceof $t&&i instanceof $t||r instanceof Ht&&i instanceof Ht?_n(r.elements,i.elements,He):r instanceof Tn&&i instanceof Tn?He(r.Pe,i.Pe):r instanceof Kt&&i instanceof Kt}(n.transform,e.transform)}var Ga=class{constructor(e,t){this.version=e,this.transformResults=t}},Te=class n{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new n}static exists(e){return new n(void 0,e)}static updateTime(e){return new n(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}};function Wi(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}var An=class{};function Qd(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new bn(n.key,Te.none()):new Wt(n.key,n.data,Te.none());{let t=n.data,r=be.empty(),i=new ye(Pe.comparator);for(let o of e.fields)if(!i.has(o)){let a=t.field(o);a===null&&o.length>1&&(o=o.popLast(),a=t.field(o)),a===null?r.delete(o):r.set(o,a),i=i.add(o)}return new We(n.key,r,new ke(i.toArray()),Te.none())}}function py(n,e,t){n instanceof Wt?function(i,o,a){let u=i.value.clone(),h=ud(i.fieldTransforms,o,a.transformResults);u.setAll(h),o.convertToFoundDocument(a.version,u).setHasCommittedMutations()}(n,e,t):n instanceof We?function(i,o,a){if(!Wi(i.precondition,o))return void o.convertToUnknownDocument(a.version);let u=ud(i.fieldTransforms,o,a.transformResults),h=o.data;h.setAll(Jd(i)),h.setAll(u),o.convertToFoundDocument(a.version,h).setHasCommittedMutations()}(n,e,t):function(i,o,a){o.convertToNoDocument(a.version).setHasCommittedMutations()}(0,e,t)}function Ir(n,e,t,r){return n instanceof Wt?function(o,a,u,h){if(!Wi(o.precondition,a))return u;let d=o.value.clone(),p=ld(o.fieldTransforms,h,a);return d.setAll(p),a.convertToFoundDocument(a.version,d).setHasLocalMutations(),null}(n,e,t,r):n instanceof We?function(o,a,u,h){if(!Wi(o.precondition,a))return u;let d=ld(o.fieldTransforms,h,a),p=a.data;return p.setAll(Jd(o)),p.setAll(d),a.convertToFoundDocument(a.version,p).setHasLocalMutations(),u===null?null:u.unionWith(o.fieldMask.fields).unionWith(o.fieldTransforms.map(y=>y.field))}(n,e,t,r):function(o,a,u){return Wi(o.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):u}(n,e,t)}function my(n,e){let t=null;for(let r of n.fieldTransforms){let i=e.data.field(r.field),o=Kd(r.transform,i||null);o!=null&&(t===null&&(t=be.empty()),t.set(r.field,o))}return t||null}function cd(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!function(r,i){return r===void 0&&i===void 0||!(!r||!i)&&_n(r,i,(o,a)=>fy(o,a))}(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}var Wt=class extends An{constructor(e,t,r,i=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}},We=class extends An{constructor(e,t,r,i,o=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=i,this.fieldTransforms=o,this.type=1}getFieldMask(){return this.fieldMask}};function Jd(n){let e=new Map;return n.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){let r=n.data.field(t);e.set(t,r)}}),e}function ud(n,e,t){let r=new Map;W(n.length===t.length);for(let i=0;i<t.length;i++){let o=n[i],a=o.transform,u=e.data.field(o.field);r.set(o.field,dy(a,u,t[i]))}return r}function ld(n,e,t){let r=new Map;for(let i of n){let o=i.transform,a=t.data.field(i.field);r.set(i.field,hy(o,a,e))}return r}var bn=class extends An{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}},ts=class extends An{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}};var Ka=class{constructor(e,t,r,i){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=i}applyToRemoteDocument(e,t){let r=t.mutationResults;for(let i=0;i<this.mutations.length;i++){let o=this.mutations[i];o.key.isEqual(e.key)&&py(o,e,r[i])}}applyToLocalView(e,t){for(let r of this.baseMutations)r.key.isEqual(e.key)&&(t=Ir(r,e,t,this.localWriteTime));for(let r of this.mutations)r.key.isEqual(e.key)&&(t=Ir(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){let r=jd();return this.mutations.forEach(i=>{let o=e.get(i.key),a=o.overlayedDocument,u=this.applyToLocalView(a,o.mutatedFields);u=t.has(i.key)?null:u;let h=Qd(a,u);h!==null&&r.set(i.key,h),a.isValidDocument()||a.convertToNoDocument(F.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),j())}isEqual(e){return this.batchId===e.batchId&&_n(this.mutations,e.mutations,(t,r)=>cd(t,r))&&_n(this.baseMutations,e.baseMutations,(t,r)=>cd(t,r))}},$a=class n{constructor(e,t,r,i){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=i}static from(e,t,r){W(e.mutations.length===r.length);let i=function(){return oy}(),o=e.mutations;for(let a=0;a<o.length;a++)i=i.insert(o[a].key,r[a].version);return new n(e,t,r,i)}};var Ha=class{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}};var Wa=class{constructor(e,t){this.count=e,this.unchangedNames=t}};var ie,K;function Yd(n){switch(n){default:return M();case S.CANCELLED:case S.UNKNOWN:case S.DEADLINE_EXCEEDED:case S.RESOURCE_EXHAUSTED:case S.INTERNAL:case S.UNAVAILABLE:case S.UNAUTHENTICATED:return!1;case S.INVALID_ARGUMENT:case S.NOT_FOUND:case S.ALREADY_EXISTS:case S.PERMISSION_DENIED:case S.FAILED_PRECONDITION:case S.ABORTED:case S.OUT_OF_RANGE:case S.UNIMPLEMENTED:case S.DATA_LOSS:return!0}}function Xd(n){if(n===void 0)return it("GRPC error has no .code"),S.UNKNOWN;switch(n){case ie.OK:return S.OK;case ie.CANCELLED:return S.CANCELLED;case ie.UNKNOWN:return S.UNKNOWN;case ie.DEADLINE_EXCEEDED:return S.DEADLINE_EXCEEDED;case ie.RESOURCE_EXHAUSTED:return S.RESOURCE_EXHAUSTED;case ie.INTERNAL:return S.INTERNAL;case ie.UNAVAILABLE:return S.UNAVAILABLE;case ie.UNAUTHENTICATED:return S.UNAUTHENTICATED;case ie.INVALID_ARGUMENT:return S.INVALID_ARGUMENT;case ie.NOT_FOUND:return S.NOT_FOUND;case ie.ALREADY_EXISTS:return S.ALREADY_EXISTS;case ie.PERMISSION_DENIED:return S.PERMISSION_DENIED;case ie.FAILED_PRECONDITION:return S.FAILED_PRECONDITION;case ie.ABORTED:return S.ABORTED;case ie.OUT_OF_RANGE:return S.OUT_OF_RANGE;case ie.UNIMPLEMENTED:return S.UNIMPLEMENTED;case ie.DATA_LOSS:return S.DATA_LOSS;default:return M()}}(K=ie||(ie={}))[K.OK=0]="OK",K[K.CANCELLED=1]="CANCELLED",K[K.UNKNOWN=2]="UNKNOWN",K[K.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",K[K.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",K[K.NOT_FOUND=5]="NOT_FOUND",K[K.ALREADY_EXISTS=6]="ALREADY_EXISTS",K[K.PERMISSION_DENIED=7]="PERMISSION_DENIED",K[K.UNAUTHENTICATED=16]="UNAUTHENTICATED",K[K.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",K[K.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",K[K.ABORTED=10]="ABORTED",K[K.OUT_OF_RANGE=11]="OUT_OF_RANGE",K[K.UNIMPLEMENTED=12]="UNIMPLEMENTED",K[K.INTERNAL=13]="INTERNAL",K[K.UNAVAILABLE=14]="UNAVAILABLE",K[K.DATA_LOSS=15]="DATA_LOSS";var hd=null;function gy(){return new TextEncoder}var _y=new vt([4294967295,4294967295],0);function dd(n){let e=gy().encode(n),t=new ua;return t.update(e),new Uint8Array(t.digest())}function fd(n){let e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),i=e.getUint32(8,!0),o=e.getUint32(12,!0);return[new vt([t,r],0),new vt([i,o],0)]}var Qa=class n{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new Bt(`Invalid padding: ${t}`);if(r<0)throw new Bt(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Bt(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new Bt(`Invalid padding when bitmap length is 0: ${t}`);this.Ie=8*e.length-t,this.Te=vt.fromNumber(this.Ie)}Ee(e,t,r){let i=e.add(t.multiply(vt.fromNumber(r)));return i.compare(_y)===1&&(i=new vt([i.getBits(0),i.getBits(1)],0)),i.modulo(this.Te).toNumber()}de(e){return(this.bitmap[Math.floor(e/8)]&1<<e%8)!=0}mightContain(e){if(this.Ie===0)return!1;let t=dd(e),[r,i]=fd(t);for(let o=0;o<this.hashCount;o++){let a=this.Ee(r,i,o);if(!this.de(a))return!1}return!0}static create(e,t,r){let i=e%8==0?0:8-e%8,o=new Uint8Array(Math.ceil(e/8)),a=new n(o,i,t);return r.forEach(u=>a.insert(u)),a}insert(e){if(this.Ie===0)return;let t=dd(e),[r,i]=fd(t);for(let o=0;o<this.hashCount;o++){let a=this.Ee(r,i,o);this.Ae(a)}}Ae(e){let t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}},Bt=class extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}};var ns=class n{constructor(e,t,r,i,o){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=i,this.resolvedLimboDocuments=o}static createSynthesizedRemoteEventForCurrentChange(e,t,r){let i=new Map;return i.set(e,Rr.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new n(F.min(),i,new re(H),ot(),j())}},Rr=class n{constructor(e,t,r,i,o){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=i,this.removedDocuments=o}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new n(r,t,j(),j(),j())}};var mn=class{constructor(e,t,r,i){this.Re=e,this.removedTargetIds=t,this.key=r,this.Ve=i}},rs=class{constructor(e,t){this.targetId=e,this.me=t}},is=class{constructor(e,t,r=Ae.EMPTY_BYTE_STRING,i=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=i}},ss=class{constructor(){this.fe=0,this.ge=md(),this.pe=Ae.EMPTY_BYTE_STRING,this.ye=!1,this.we=!0}get current(){return this.ye}get resumeToken(){return this.pe}get Se(){return this.fe!==0}get be(){return this.we}De(e){e.approximateByteSize()>0&&(this.we=!0,this.pe=e)}Ce(){let e=j(),t=j(),r=j();return this.ge.forEach((i,o)=>{switch(o){case 0:e=e.add(i);break;case 2:t=t.add(i);break;case 1:r=r.add(i);break;default:M()}}),new Rr(this.pe,this.ye,e,t,r)}ve(){this.we=!1,this.ge=md()}Fe(e,t){this.we=!0,this.ge=this.ge.insert(e,t)}Me(e){this.we=!0,this.ge=this.ge.remove(e)}xe(){this.fe+=1}Oe(){this.fe-=1,W(this.fe>=0)}Ne(){this.we=!0,this.ye=!0}},Ja=class{constructor(e){this.Le=e,this.Be=new Map,this.ke=ot(),this.qe=pd(),this.Qe=new re(H)}Ke(e){for(let t of e.Re)e.Ve&&e.Ve.isFoundDocument()?this.$e(t,e.Ve):this.Ue(t,e.key,e.Ve);for(let t of e.removedTargetIds)this.Ue(t,e.key,e.Ve)}We(e){this.forEachTarget(e,t=>{let r=this.Ge(t);switch(e.state){case 0:this.ze(t)&&r.De(e.resumeToken);break;case 1:r.Oe(),r.Se||r.ve(),r.De(e.resumeToken);break;case 2:r.Oe(),r.Se||this.removeTarget(t);break;case 3:this.ze(t)&&(r.Ne(),r.De(e.resumeToken));break;case 4:this.ze(t)&&(this.je(t),r.De(e.resumeToken));break;default:M()}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.Be.forEach((r,i)=>{this.ze(i)&&t(i)})}He(e){let t=e.targetId,r=e.me.count,i=this.Je(t);if(i){let o=i.target;if(qa(o))if(r===0){let a=new L(o.path);this.Ue(t,a,De.newNoDocument(a,F.min()))}else W(r===1);else{let a=this.Ye(t);if(a!==r){let u=this.Ze(e),h=u?this.Xe(u,e,a):1;if(h!==0){this.je(t);let d=h===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Qe=this.Qe.insert(t,d)}hd==null||hd.et(function(p,y,T,R,k){var x,D,q,z,G,X;let Ie={localCacheCount:p,existenceFilterCount:y.count,databaseId:T.database,projectId:T.projectId},Q=y.unchangedNames;return Q&&(Ie.bloomFilter={applied:k===0,hashCount:(x=Q==null?void 0:Q.hashCount)!==null&&x!==void 0?x:0,bitmapLength:(z=(q=(D=Q==null?void 0:Q.bits)===null||D===void 0?void 0:D.bitmap)===null||q===void 0?void 0:q.length)!==null&&z!==void 0?z:0,padding:(X=(G=Q==null?void 0:Q.bits)===null||G===void 0?void 0:G.padding)!==null&&X!==void 0?X:0,mightContain:I=>{var m;return(m=R==null?void 0:R.mightContain(I))!==null&&m!==void 0&&m}}),Ie}(a,e.me,this.Le.tt(),u,h))}}}}Ze(e){let t=e.me.unchangedNames;if(!t||!t.bits)return null;let{bits:{bitmap:r="",padding:i=0},hashCount:o=0}=t,a,u;try{a=Tt(r).toUint8Array()}catch(h){if(h instanceof Xi)return Er("Decoding the base64 bloom filter in existence filter failed ("+h.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw h}try{u=new Qa(a,i,o)}catch(h){return Er(h instanceof Bt?"BloomFilter error: ":"Applying bloom filter failed: ",h),null}return u.Ie===0?null:u}Xe(e,t,r){return t.me.count===r-this.nt(e,t.targetId)?0:2}nt(e,t){let r=this.Le.getRemoteKeysForTarget(t),i=0;return r.forEach(o=>{let a=this.Le.tt(),u=`projects/${a.projectId}/databases/${a.database}/documents/${o.path.canonicalString()}`;e.mightContain(u)||(this.Ue(t,o,null),i++)}),i}rt(e){let t=new Map;this.Be.forEach((o,a)=>{let u=this.Je(a);if(u){if(o.current&&qa(u.target)){let h=new L(u.target.path);this.ke.get(h)!==null||this.it(a,h)||this.Ue(a,h,De.newNoDocument(h,e))}o.be&&(t.set(a,o.Ce()),o.ve())}});let r=j();this.qe.forEach((o,a)=>{let u=!0;a.forEachWhile(h=>{let d=this.Je(h);return!d||d.purpose==="TargetPurposeLimboResolution"||(u=!1,!1)}),u&&(r=r.add(o))}),this.ke.forEach((o,a)=>a.setReadTime(e));let i=new ns(e,t,this.Qe,this.ke,r);return this.ke=ot(),this.qe=pd(),this.Qe=new re(H),i}$e(e,t){if(!this.ze(e))return;let r=this.it(e,t.key)?2:0;this.Ge(e).Fe(t.key,r),this.ke=this.ke.insert(t.key,t),this.qe=this.qe.insert(t.key,this.st(t.key).add(e))}Ue(e,t,r){if(!this.ze(e))return;let i=this.Ge(e);this.it(e,t)?i.Fe(t,1):i.Me(t),this.qe=this.qe.insert(t,this.st(t).delete(e)),r&&(this.ke=this.ke.insert(t,r))}removeTarget(e){this.Be.delete(e)}Ye(e){let t=this.Ge(e).Ce();return this.Le.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}xe(e){this.Ge(e).xe()}Ge(e){let t=this.Be.get(e);return t||(t=new ss,this.Be.set(e,t)),t}st(e){let t=this.qe.get(e);return t||(t=new ye(H),this.qe=this.qe.insert(e,t)),t}ze(e){let t=this.Je(e)!==null;return t||O("WatchChangeAggregator","Detected inactive target",e),t}Je(e){let t=this.Be.get(e);return t&&t.Se?null:this.Le.ot(e)}je(e){this.Be.set(e,new ss),this.Le.getRemoteKeysForTarget(e).forEach(t=>{this.Ue(e,t,null)})}it(e,t){return this.Le.getRemoteKeysForTarget(e).has(t)}};function pd(){return new re(L.comparator)}function md(){return new re(L.comparator)}var yy={asc:"ASCENDING",desc:"DESCENDING"},vy={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},Iy={and:"AND",or:"OR"},Ya=class{constructor(e,t){this.databaseId=e,this.useProto3Json=t}};function Xa(n,e){return n.useProto3Json||qr(e)?e:{value:e}}function os(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Zd(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function wy(n,e){return os(n,e.toTimestamp())}function Ce(n){return W(!!n),F.fromTimestamp(function(t){let r=st(t);return new ue(r.seconds,r.nanos)}(n))}function au(n,e){return Za(n,e).canonicalString()}function Za(n,e){let t=function(i){return new Y(["projects",i.projectId,"databases",i.database])}(n).child("documents");return e===void 0?t:t.child(e)}function ef(n){let e=Y.fromString(n);return W(af(e)),e}function as(n,e){return au(n.databaseId,e.path)}function wr(n,e){let t=ef(e);if(t.get(1)!==n.databaseId.projectId)throw new N(S.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new N(S.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new L(nf(t))}function tf(n,e){return au(n.databaseId,e)}function Ey(n){let e=ef(n);return e.length===4?Y.emptyPath():nf(e)}function ec(n){return new Y(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function nf(n){return W(n.length>4&&n.get(4)==="documents"),n.popFirst(5)}function gd(n,e,t){return{name:as(n,e),fields:t.value.mapValue.fields}}function Ty(n,e){return"found"in e?function(r,i){W(!!i.found),i.found.name,i.found.updateTime;let o=wr(r,i.found.name),a=Ce(i.found.updateTime),u=i.found.createTime?Ce(i.found.createTime):F.min(),h=new be({mapValue:{fields:i.found.fields}});return De.newFoundDocument(o,a,u,h)}(n,e):"missing"in e?function(r,i){W(!!i.missing),W(!!i.readTime);let o=wr(r,i.missing),a=Ce(i.readTime);return De.newNoDocument(o,a)}(n,e):M()}function Ay(n,e){let t;if("targetChange"in e){e.targetChange;let r=function(d){return d==="NO_CHANGE"?0:d==="ADD"?1:d==="REMOVE"?2:d==="CURRENT"?3:d==="RESET"?4:M()}(e.targetChange.targetChangeType||"NO_CHANGE"),i=e.targetChange.targetIds||[],o=function(d,p){return d.useProto3Json?(W(p===void 0||typeof p=="string"),Ae.fromBase64String(p||"")):(W(p===void 0||p instanceof Buffer||p instanceof Uint8Array),Ae.fromUint8Array(p||new Uint8Array))}(n,e.targetChange.resumeToken),a=e.targetChange.cause,u=a&&function(d){let p=d.code===void 0?S.UNKNOWN:Xd(d.code);return new N(p,d.message||"")}(a);t=new is(r,i,o,u||null)}else if("documentChange"in e){e.documentChange;let r=e.documentChange;r.document,r.document.name,r.document.updateTime;let i=wr(n,r.document.name),o=Ce(r.document.updateTime),a=r.document.createTime?Ce(r.document.createTime):F.min(),u=new be({mapValue:{fields:r.document.fields}}),h=De.newFoundDocument(i,o,a,u),d=r.targetIds||[],p=r.removedTargetIds||[];t=new mn(d,p,h.key,h)}else if("documentDelete"in e){e.documentDelete;let r=e.documentDelete;r.document;let i=wr(n,r.document),o=r.readTime?Ce(r.readTime):F.min(),a=De.newNoDocument(i,o),u=r.removedTargetIds||[];t=new mn([],u,a.key,a)}else if("documentRemove"in e){e.documentRemove;let r=e.documentRemove;r.document;let i=wr(n,r.document),o=r.removedTargetIds||[];t=new mn([],o,i,null)}else{if(!("filter"in e))return M();{e.filter;let r=e.filter;r.targetId;let{count:i=0,unchangedNames:o}=r,a=new Wa(i,o),u=r.targetId;t=new rs(u,a)}}return t}function rf(n,e){let t;if(e instanceof Wt)t={update:gd(n,e.key,e.value)};else if(e instanceof bn)t={delete:as(n,e.key)};else if(e instanceof We)t={update:gd(n,e.key,e.data),updateMask:Oy(e.fieldMask)};else{if(!(e instanceof ts))return M();t={verify:as(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(r=>function(o,a){let u=a.transform;if(u instanceof Kt)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(u instanceof $t)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:u.elements}};if(u instanceof Ht)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:u.elements}};if(u instanceof Tn)return{fieldPath:a.field.canonicalString(),increment:u.Pe};throw M()}(0,r))),e.precondition.isNone||(t.currentDocument=function(i,o){return o.updateTime!==void 0?{updateTime:wy(i,o.updateTime)}:o.exists!==void 0?{exists:o.exists}:M()}(n,e.precondition)),t}function by(n,e){return n&&n.length>0?(W(e!==void 0),n.map(t=>function(i,o){let a=i.updateTime?Ce(i.updateTime):Ce(o);return a.isEqual(F.min())&&(a=Ce(o)),new Ga(a,i.transformResults||[])}(t,e))):[]}function Sy(n,e){return{documents:[tf(n,e.path)]}}function Ry(n,e){let t={structuredQuery:{}},r=e.path,i;e.collectionGroup!==null?(i=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(i=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=tf(n,i);let o=function(d){if(d.length!==0)return of(Ue.create(d,"and"))}(e.filters);o&&(t.structuredQuery.where=o);let a=function(d){if(d.length!==0)return d.map(p=>function(T){return{field:dn(T.field),direction:Dy(T.dir)}}(p))}(e.orderBy);a&&(t.structuredQuery.orderBy=a);let u=Xa(n,e.limit);return u!==null&&(t.structuredQuery.limit=u),e.startAt&&(t.structuredQuery.startAt=function(d){return{before:d.inclusive,values:d.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(d){return{before:!d.inclusive,values:d.position}}(e.endAt)),{_t:t,parent:i}}function Py(n){let e=Ey(n.parent),t=n.structuredQuery,r=t.from?t.from.length:0,i=null;if(r>0){W(r===1);let p=t.from[0];p.allDescendants?i=p.collectionId:e=e.child(p.collectionId)}let o=[];t.where&&(o=function(y){let T=sf(y);return T instanceof Ue&&Od(T)?T.getFilters():[T]}(t.where));let a=[];t.orderBy&&(a=function(y){return y.map(T=>function(k){return new wn(fn(k.field),function(D){switch(D){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(k.direction))}(T))}(t.orderBy));let u=null;t.limit&&(u=function(y){let T;return T=typeof y=="object"?y.value:y,qr(T)?null:T}(t.limit));let h=null;t.startAt&&(h=function(y){let T=!!y.before,R=y.values||[];return new In(R,T)}(t.startAt));let d=null;return t.endAt&&(d=function(y){let T=!y.before,R=y.values||[];return new In(R,T)}(t.endAt)),ty(e,i,a,o,u,"F",h,d)}function Cy(n,e){let t=function(i){switch(i){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return M()}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function sf(n){return n.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":let r=fn(t.unaryFilter.field);return oe.create(r,"==",{doubleValue:NaN});case"IS_NULL":let i=fn(t.unaryFilter.field);return oe.create(i,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":let o=fn(t.unaryFilter.field);return oe.create(o,"!=",{doubleValue:NaN});case"IS_NOT_NULL":let a=fn(t.unaryFilter.field);return oe.create(a,"!=",{nullValue:"NULL_VALUE"});default:return M()}}(n):n.fieldFilter!==void 0?function(t){return oe.create(fn(t.fieldFilter.field),function(i){switch(i){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return M()}}(t.fieldFilter.op),t.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(t){return Ue.create(t.compositeFilter.filters.map(r=>sf(r)),function(i){switch(i){case"AND":return"and";case"OR":return"or";default:return M()}}(t.compositeFilter.op))}(n):M()}function Dy(n){return yy[n]}function Ny(n){return vy[n]}function ky(n){return Iy[n]}function dn(n){return{fieldPath:n.canonicalString()}}function fn(n){return Pe.fromServerFormat(n.fieldPath)}function of(n){return n instanceof oe?function(t){if(t.op==="=="){if(nd(t.value))return{unaryFilter:{field:dn(t.field),op:"IS_NAN"}};if(td(t.value))return{unaryFilter:{field:dn(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(nd(t.value))return{unaryFilter:{field:dn(t.field),op:"IS_NOT_NAN"}};if(td(t.value))return{unaryFilter:{field:dn(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:dn(t.field),op:Ny(t.op),value:t.value}}}(n):n instanceof Ue?function(t){let r=t.getFilters().map(i=>of(i));return r.length===1?r[0]:{compositeFilter:{op:ky(t.op),filters:r}}}(n):M()}function Oy(n){let e=[];return n.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function af(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}var Pr=class n{constructor(e,t,r,i,o=F.min(),a=F.min(),u=Ae.EMPTY_BYTE_STRING,h=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=i,this.snapshotVersion=o,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=u,this.expectedCount=h}withSequenceNumber(e){return new n(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new n(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new n(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new n(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}};var tc=class{constructor(e){this.ct=e}};function xy(n){let e=Py({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?ja(e,e.limit,"L"):e}var cs=class{constructor(){}Pt(e,t){this.It(e,t),t.Tt()}It(e,t){if("nullValue"in e)this.Et(t,5);else if("booleanValue"in e)this.Et(t,10),t.dt(e.booleanValue?1:0);else if("integerValue"in e)this.Et(t,15),t.dt(ne(e.integerValue));else if("doubleValue"in e){let r=ne(e.doubleValue);isNaN(r)?this.Et(t,13):(this.Et(t,15),Ar(r)?t.dt(0):t.dt(r))}else if("timestampValue"in e){let r=e.timestampValue;this.Et(t,20),typeof r=="string"&&(r=st(r)),t.At(`${r.seconds||""}`),t.dt(r.nanos||0)}else if("stringValue"in e)this.Rt(e.stringValue,t),this.Vt(t);else if("bytesValue"in e)this.Et(t,30),t.ft(Tt(e.bytesValue)),this.Vt(t);else if("referenceValue"in e)this.gt(e.referenceValue,t);else if("geoPointValue"in e){let r=e.geoPointValue;this.Et(t,45),t.dt(r.latitude||0),t.dt(r.longitude||0)}else"mapValue"in e?Dd(e)?this.Et(t,Number.MAX_SAFE_INTEGER):(this.yt(e.mapValue,t),this.Vt(t)):"arrayValue"in e?(this.wt(e.arrayValue,t),this.Vt(t)):M()}Rt(e,t){this.Et(t,25),this.St(e,t)}St(e,t){t.At(e)}yt(e,t){let r=e.fields||{};this.Et(t,55);for(let i of Object.keys(r))this.Rt(i,t),this.It(r[i],t)}wt(e,t){let r=e.values||[];this.Et(t,50);for(let i of r)this.It(i,t)}gt(e,t){this.Et(t,37),L.fromName(e).path.forEach(r=>{this.Et(t,60),this.St(r,t)})}Et(e,t){e.dt(t)}Vt(e){e.dt(2)}};cs.bt=new cs;var nc=class{constructor(){this._n=new rc}addToCollectionParentIndex(e,t){return this._n.add(t),P.resolve()}getCollectionParents(e,t){return P.resolve(this._n.getEntries(t))}addFieldIndex(e,t){return P.resolve()}deleteFieldIndex(e,t){return P.resolve()}deleteAllFieldIndexes(e){return P.resolve()}createTargetIndexes(e,t){return P.resolve()}getDocumentsMatchingTarget(e,t){return P.resolve(null)}getIndexType(e,t){return P.resolve(0)}getFieldIndexes(e,t){return P.resolve([])}getNextCollectionGroupToUpdate(e){return P.resolve(null)}getMinOffset(e,t){return P.resolve(zt.min())}getMinOffsetFromCollectionGroup(e,t){return P.resolve(zt.min())}updateCollectionGroup(e,t,r){return P.resolve()}updateIndexEntries(e,t){return P.resolve()}},rc=class{constructor(){this.index={}}add(e){let t=e.lastSegment(),r=e.popLast(),i=this.index[t]||new ye(Y.comparator),o=!i.has(r);return this.index[t]=i.add(r),o}has(e){let t=e.lastSegment(),r=e.popLast(),i=this.index[t];return i&&i.has(r)}getEntries(e){return(this.index[e]||new ye(Y.comparator)).toArray()}};var Aw=new Uint8Array(0);var Ge=class n{constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}static withCacheSize(e){return new n(e,n.DEFAULT_COLLECTION_PERCENTILE,n.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}};Ge.DEFAULT_COLLECTION_PERCENTILE=10,Ge.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Ge.DEFAULT=new Ge(41943040,Ge.DEFAULT_COLLECTION_PERCENTILE,Ge.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Ge.DISABLED=new Ge(-1,0,0);var Cr=class n{constructor(e){this.On=e}next(){return this.On+=2,this.On}static Nn(){return new n(0)}static Ln(){return new n(-1)}};var ic=class{constructor(){this.changes=new bt(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,De.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();let r=this.changes.get(t);return r!==void 0?P.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}};var sc=class{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}};var oc=class{constructor(e,t,r,i){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=i}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(i=>(r=i,this.remoteDocumentCache.getEntry(e,t))).next(i=>(r!==null&&Ir(r.mutation,i,ke.empty(),ue.now()),i))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.getLocalViewOfDocuments(e,r,j()).next(()=>r))}getLocalViewOfDocuments(e,t,r=j()){let i=qt();return this.populateOverlays(e,i,t).next(()=>this.computeViews(e,t,i,r).next(o=>{let a=gr();return o.forEach((u,h)=>{a=a.insert(u,h.overlayedDocument)}),a}))}getOverlayedDocuments(e,t){let r=qt();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,j()))}populateOverlays(e,t,r){let i=[];return r.forEach(o=>{t.has(o)||i.push(o)}),this.documentOverlayCache.getOverlays(e,i).next(o=>{o.forEach((a,u)=>{t.set(a,u)})})}computeViews(e,t,r,i){let o=ot(),a=vr(),u=function(){return vr()}();return t.forEach((h,d)=>{let p=r.get(d.key);i.has(d.key)&&(p===void 0||p.mutation instanceof We)?o=o.insert(d.key,d):p!==void 0?(a.set(d.key,p.mutation.getFieldMask()),Ir(p.mutation,d,p.mutation.getFieldMask(),ue.now())):a.set(d.key,ke.empty())}),this.recalculateAndSaveOverlays(e,o).next(h=>(h.forEach((d,p)=>a.set(d,p)),t.forEach((d,p)=>{var y;return u.set(d,new sc(p,(y=a.get(d))!==null&&y!==void 0?y:null))}),u))}recalculateAndSaveOverlays(e,t){let r=vr(),i=new re((a,u)=>a-u),o=j();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(a=>{for(let u of a)u.keys().forEach(h=>{let d=t.get(h);if(d===null)return;let p=r.get(h)||ke.empty();p=u.applyToLocalView(d,p),r.set(h,p);let y=(i.get(u.batchId)||j()).add(h);i=i.insert(u.batchId,y)})}).next(()=>{let a=[],u=i.getReverseIterator();for(;u.hasNext();){let h=u.getNext(),d=h.key,p=h.value,y=jd();p.forEach(T=>{if(!o.has(T)){let R=Qd(t.get(T),r.get(T));R!==null&&y.set(T,R),o=o.add(T)}}),a.push(this.documentOverlayCache.saveOverlays(e,d,y))}return P.waitFor(a)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,t,r,i){return function(a){return L.isDocumentKey(a.path)&&a.collectionGroup===null&&a.filters.length===0}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):Md(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,i):this.getDocumentsMatchingCollectionQuery(e,t,r,i)}getNextDocuments(e,t,r,i){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,i).next(o=>{let a=i-o.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,i-o.size):P.resolve(qt()),u=-1,h=o;return a.next(d=>P.forEach(d,(p,y)=>(u<y.largestBatchId&&(u=y.largestBatchId),o.get(p)?P.resolve():this.remoteDocumentCache.getEntry(e,p).next(T=>{h=h.insert(p,T)}))).next(()=>this.populateOverlays(e,d,o)).next(()=>this.computeViews(e,h,d,j())).next(p=>({batchId:u,changes:Bd(p)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new L(t)).next(r=>{let i=gr();return r.isFoundDocument()&&(i=i.insert(r.key,r)),i})}getDocumentsMatchingCollectionGroupQuery(e,t,r,i){let o=t.collectionGroup,a=gr();return this.indexManager.getCollectionParents(e,o).next(u=>P.forEach(u,h=>{let d=function(y,T){return new At(T,null,y.explicitOrderBy.slice(),y.filters.slice(),y.limit,y.limitType,y.startAt,y.endAt)}(t,h.child(o));return this.getDocumentsMatchingCollectionQuery(e,d,r,i).next(p=>{p.forEach((y,T)=>{a=a.insert(y,T)})})}).next(()=>a))}getDocumentsMatchingCollectionQuery(e,t,r,i){let o;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(a=>(o=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,o,i))).next(a=>{o.forEach((h,d)=>{let p=d.getKey();a.get(p)===null&&(a=a.insert(p,De.newInvalidDocument(p)))});let u=gr();return a.forEach((h,d)=>{let p=o.get(h);p!==void 0&&Ir(p.mutation,d,ke.empty(),ue.now()),Ps(t,d)&&(u=u.insert(h,d))}),u})}};var ac=class{constructor(e){this.serializer=e,this.cr=new Map,this.lr=new Map}getBundleMetadata(e,t){return P.resolve(this.cr.get(t))}saveBundleMetadata(e,t){return this.cr.set(t.id,function(i){return{id:i.id,version:i.version,createTime:Ce(i.createTime)}}(t)),P.resolve()}getNamedQuery(e,t){return P.resolve(this.lr.get(t))}saveNamedQuery(e,t){return this.lr.set(t.name,function(i){return{name:i.name,query:xy(i.bundledQuery),readTime:Ce(i.readTime)}}(t)),P.resolve()}};var cc=class{constructor(){this.overlays=new re(L.comparator),this.hr=new Map}getOverlay(e,t){return P.resolve(this.overlays.get(t))}getOverlays(e,t){let r=qt();return P.forEach(t,i=>this.getOverlay(e,i).next(o=>{o!==null&&r.set(i,o)})).next(()=>r)}saveOverlays(e,t,r){return r.forEach((i,o)=>{this.ht(e,t,o)}),P.resolve()}removeOverlaysForBatchId(e,t,r){let i=this.hr.get(r);return i!==void 0&&(i.forEach(o=>this.overlays=this.overlays.remove(o)),this.hr.delete(r)),P.resolve()}getOverlaysForCollection(e,t,r){let i=qt(),o=t.length+1,a=new L(t.child("")),u=this.overlays.getIteratorFrom(a);for(;u.hasNext();){let h=u.getNext().value,d=h.getKey();if(!t.isPrefixOf(d.path))break;d.path.length===o&&h.largestBatchId>r&&i.set(h.getKey(),h)}return P.resolve(i)}getOverlaysForCollectionGroup(e,t,r,i){let o=new re((d,p)=>d-p),a=this.overlays.getIterator();for(;a.hasNext();){let d=a.getNext().value;if(d.getKey().getCollectionGroup()===t&&d.largestBatchId>r){let p=o.get(d.largestBatchId);p===null&&(p=qt(),o=o.insert(d.largestBatchId,p)),p.set(d.getKey(),d)}}let u=qt(),h=o.getIterator();for(;h.hasNext()&&(h.getNext().value.forEach((d,p)=>u.set(d,p)),!(u.size()>=i)););return P.resolve(u)}ht(e,t,r){let i=this.overlays.get(r.key);if(i!==null){let a=this.hr.get(i.largestBatchId).delete(r.key);this.hr.set(i.largestBatchId,a)}this.overlays=this.overlays.insert(r.key,new Ha(t,r));let o=this.hr.get(t);o===void 0&&(o=j(),this.hr.set(t,o)),this.hr.set(t,o.add(r.key))}};var Dr=class{constructor(){this.Pr=new ye(se.Ir),this.Tr=new ye(se.Er)}isEmpty(){return this.Pr.isEmpty()}addReference(e,t){let r=new se(e,t);this.Pr=this.Pr.add(r),this.Tr=this.Tr.add(r)}dr(e,t){e.forEach(r=>this.addReference(r,t))}removeReference(e,t){this.Ar(new se(e,t))}Rr(e,t){e.forEach(r=>this.removeReference(r,t))}Vr(e){let t=new L(new Y([])),r=new se(t,e),i=new se(t,e+1),o=[];return this.Tr.forEachInRange([r,i],a=>{this.Ar(a),o.push(a.key)}),o}mr(){this.Pr.forEach(e=>this.Ar(e))}Ar(e){this.Pr=this.Pr.delete(e),this.Tr=this.Tr.delete(e)}gr(e){let t=new L(new Y([])),r=new se(t,e),i=new se(t,e+1),o=j();return this.Tr.forEachInRange([r,i],a=>{o=o.add(a.key)}),o}containsKey(e){let t=new se(e,0),r=this.Pr.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}},se=class{constructor(e,t){this.key=e,this.pr=t}static Ir(e,t){return L.comparator(e.key,t.key)||H(e.pr,t.pr)}static Er(e,t){return H(e.pr,t.pr)||L.comparator(e.key,t.key)}};var uc=class{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.yr=1,this.wr=new ye(se.Ir)}checkEmpty(e){return P.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,i){let o=this.yr;this.yr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];let a=new Ka(o,t,r,i);this.mutationQueue.push(a);for(let u of i)this.wr=this.wr.add(new se(u.key,o)),this.indexManager.addToCollectionParentIndex(e,u.key.path.popLast());return P.resolve(a)}lookupMutationBatch(e,t){return P.resolve(this.Sr(t))}getNextMutationBatchAfterBatchId(e,t){let r=t+1,i=this.br(r),o=i<0?0:i;return P.resolve(this.mutationQueue.length>o?this.mutationQueue[o]:null)}getHighestUnacknowledgedBatchId(){return P.resolve(this.mutationQueue.length===0?-1:this.yr-1)}getAllMutationBatches(e){return P.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){let r=new se(t,0),i=new se(t,Number.POSITIVE_INFINITY),o=[];return this.wr.forEachInRange([r,i],a=>{let u=this.Sr(a.pr);o.push(u)}),P.resolve(o)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new ye(H);return t.forEach(i=>{let o=new se(i,0),a=new se(i,Number.POSITIVE_INFINITY);this.wr.forEachInRange([o,a],u=>{r=r.add(u.pr)})}),P.resolve(this.Dr(r))}getAllMutationBatchesAffectingQuery(e,t){let r=t.path,i=r.length+1,o=r;L.isDocumentKey(o)||(o=o.child(""));let a=new se(new L(o),0),u=new ye(H);return this.wr.forEachWhile(h=>{let d=h.key.path;return!!r.isPrefixOf(d)&&(d.length===i&&(u=u.add(h.pr)),!0)},a),P.resolve(this.Dr(u))}Dr(e){let t=[];return e.forEach(r=>{let i=this.Sr(r);i!==null&&t.push(i)}),t}removeMutationBatch(e,t){W(this.Cr(t.batchId,"removed")===0),this.mutationQueue.shift();let r=this.wr;return P.forEach(t.mutations,i=>{let o=new se(i.key,t.batchId);return r=r.delete(o),this.referenceDelegate.markPotentiallyOrphaned(e,i.key)}).next(()=>{this.wr=r})}Mn(e){}containsKey(e,t){let r=new se(t,0),i=this.wr.firstAfterOrEqual(r);return P.resolve(t.isEqual(i&&i.key))}performConsistencyCheck(e){return this.mutationQueue.length,P.resolve()}Cr(e,t){return this.br(e)}br(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Sr(e){let t=this.br(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}};var lc=class{constructor(e){this.vr=e,this.docs=function(){return new re(L.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){let r=t.key,i=this.docs.get(r),o=i?i.size:0,a=this.vr(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:a}),this.size+=a-o,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){let t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){let r=this.docs.get(t);return P.resolve(r?r.document.mutableCopy():De.newInvalidDocument(t))}getEntries(e,t){let r=ot();return t.forEach(i=>{let o=this.docs.get(i);r=r.insert(i,o?o.document.mutableCopy():De.newInvalidDocument(i))}),P.resolve(r)}getDocumentsMatchingQuery(e,t,r,i){let o=ot(),a=t.path,u=new L(a.child("")),h=this.docs.getIteratorFrom(u);for(;h.hasNext();){let{key:d,value:{document:p}}=h.getNext();if(!a.isPrefixOf(d.path))break;d.path.length>a.length+1||K_(G_(p),r)<=0||(i.has(p.key)||Ps(t,p))&&(o=o.insert(p.key,p.mutableCopy()))}return P.resolve(o)}getAllFromCollectionGroup(e,t,r,i){M()}Fr(e,t){return P.forEach(this.docs,r=>t(r))}newChangeBuffer(e){return new hc(this)}getSize(e){return P.resolve(this.size)}},hc=class extends ic{constructor(e){super(),this.ar=e}applyChanges(e){let t=[];return this.changes.forEach((r,i)=>{i.isValidDocument()?t.push(this.ar.addEntry(e,i)):this.ar.removeEntry(r)}),P.waitFor(t)}getFromCache(e,t){return this.ar.getEntry(e,t)}getAllFromCache(e,t){return this.ar.getEntries(e,t)}};var dc=class{constructor(e){this.persistence=e,this.Mr=new bt(t=>su(t),ou),this.lastRemoteSnapshotVersion=F.min(),this.highestTargetId=0,this.Or=0,this.Nr=new Dr,this.targetCount=0,this.Lr=Cr.Nn()}forEachTarget(e,t){return this.Mr.forEach((r,i)=>t(i)),P.resolve()}getLastRemoteSnapshotVersion(e){return P.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return P.resolve(this.Or)}allocateTargetId(e){return this.highestTargetId=this.Lr.next(),P.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.Or&&(this.Or=t),P.resolve()}qn(e){this.Mr.set(e.target,e);let t=e.targetId;t>this.highestTargetId&&(this.Lr=new Cr(t),this.highestTargetId=t),e.sequenceNumber>this.Or&&(this.Or=e.sequenceNumber)}addTargetData(e,t){return this.qn(t),this.targetCount+=1,P.resolve()}updateTargetData(e,t){return this.qn(t),P.resolve()}removeTargetData(e,t){return this.Mr.delete(t.target),this.Nr.Vr(t.targetId),this.targetCount-=1,P.resolve()}removeTargets(e,t,r){let i=0,o=[];return this.Mr.forEach((a,u)=>{u.sequenceNumber<=t&&r.get(u.targetId)===null&&(this.Mr.delete(a),o.push(this.removeMatchingKeysForTargetId(e,u.targetId)),i++)}),P.waitFor(o).next(()=>i)}getTargetCount(e){return P.resolve(this.targetCount)}getTargetData(e,t){let r=this.Mr.get(t)||null;return P.resolve(r)}addMatchingKeys(e,t,r){return this.Nr.dr(t,r),P.resolve()}removeMatchingKeys(e,t,r){this.Nr.Rr(t,r);let i=this.persistence.referenceDelegate,o=[];return i&&t.forEach(a=>{o.push(i.markPotentiallyOrphaned(e,a))}),P.waitFor(o)}removeMatchingKeysForTargetId(e,t){return this.Nr.Vr(t),P.resolve()}getMatchingKeysForTargetId(e,t){let r=this.Nr.gr(t);return P.resolve(r)}containsKey(e,t){return P.resolve(this.Nr.containsKey(t))}};var fc=class{constructor(e,t){this.Br={},this.overlays={},this.kr=new Tr(0),this.qr=!1,this.qr=!0,this.referenceDelegate=e(this),this.Qr=new dc(this),this.indexManager=new nc,this.remoteDocumentCache=function(i){return new lc(i)}(r=>this.referenceDelegate.Kr(r)),this.serializer=new tc(t),this.$r=new ac(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.qr=!1,Promise.resolve()}get started(){return this.qr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new cc,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.Br[e.toKey()];return r||(r=new uc(t,this.referenceDelegate),this.Br[e.toKey()]=r),r}getTargetCache(){return this.Qr}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.$r}runTransaction(e,t,r){O("MemoryPersistence","Starting transaction:",e);let i=new pc(this.kr.next());return this.referenceDelegate.Ur(),r(i).next(o=>this.referenceDelegate.Wr(i).next(()=>o)).toPromise().then(o=>(i.raiseOnCommittedEvent(),o))}Gr(e,t){return P.or(Object.values(this.Br).map(r=>()=>r.containsKey(e,t)))}},pc=class extends Ra{constructor(e){super(),this.currentSequenceNumber=e}},mc=class n{constructor(e){this.persistence=e,this.zr=new Dr,this.jr=null}static Hr(e){return new n(e)}get Jr(){if(this.jr)return this.jr;throw M()}addReference(e,t,r){return this.zr.addReference(r,t),this.Jr.delete(r.toString()),P.resolve()}removeReference(e,t,r){return this.zr.removeReference(r,t),this.Jr.add(r.toString()),P.resolve()}markPotentiallyOrphaned(e,t){return this.Jr.add(t.toString()),P.resolve()}removeTarget(e,t){this.zr.Vr(t.targetId).forEach(i=>this.Jr.add(i.toString()));let r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(i=>{i.forEach(o=>this.Jr.add(o.toString()))}).next(()=>r.removeTargetData(e,t))}Ur(){this.jr=new Set}Wr(e){let t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return P.forEach(this.Jr,r=>{let i=L.fromPath(r);return this.Yr(e,i).next(o=>{o||t.removeEntry(i,F.min())})}).next(()=>(this.jr=null,t.apply(e)))}updateLimboDocument(e,t){return this.Yr(e,t).next(r=>{r?this.Jr.delete(t.toString()):this.Jr.add(t.toString())})}Kr(e){return 0}Yr(e,t){return P.or([()=>P.resolve(this.zr.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Gr(e,t)])}};var gc=class n{constructor(e,t,r,i){this.targetId=e,this.fromCache=t,this.qi=r,this.Qi=i}static Ki(e,t){let r=j(),i=j();for(let o of t.docChanges)switch(o.type){case 0:r=r.add(o.doc.key);break;case 1:i=i.add(o.doc.key)}return new n(e,t.fromCache,r,i)}};var _c=class{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}};var yc=class{constructor(){this.$i=!1,this.Ui=!1,this.Wi=100,this.Gi=function(){return Ol()?8:H_(ae())>0?6:4}()}initialize(e,t){this.zi=e,this.indexManager=t,this.$i=!0}getDocumentsMatchingQuery(e,t,r,i){let o={result:null};return this.ji(e,t).next(a=>{o.result=a}).next(()=>{if(!o.result)return this.Hi(e,t,i,r).next(a=>{o.result=a})}).next(()=>{if(o.result)return;let a=new _c;return this.Ji(e,t,a).next(u=>{if(o.result=u,this.Ui)return this.Yi(e,t,a,u.size)})}).next(()=>o.result)}Yi(e,t,r,i){return r.documentReadCount<this.Wi?(mr()<=B.DEBUG&&O("QueryEngine","SDK will not create cache indexes for query:",hn(t),"since it only creates cache indexes for collection contains","more than or equal to",this.Wi,"documents"),P.resolve()):(mr()<=B.DEBUG&&O("QueryEngine","Query:",hn(t),"scans",r.documentReadCount,"local documents and returns",i,"documents as results."),r.documentReadCount>this.Gi*i?(mr()<=B.DEBUG&&O("QueryEngine","The SDK decides to create cache indexes for query:",hn(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,$e(t))):P.resolve())}ji(e,t){if(od(t))return P.resolve(null);let r=$e(t);return this.indexManager.getIndexType(e,r).next(i=>i===0?null:(t.limit!==null&&i===1&&(t=ja(t,null,"F"),r=$e(t)),this.indexManager.getDocumentsMatchingTarget(e,r).next(o=>{let a=j(...o);return this.zi.getDocuments(e,a).next(u=>this.indexManager.getMinOffset(e,r).next(h=>{let d=this.Zi(t,u);return this.Xi(t,d,a,h.readTime)?this.ji(e,ja(t,null,"F")):this.es(e,d,t,h)}))})))}Hi(e,t,r,i){return od(t)||i.isEqual(F.min())?P.resolve(null):this.zi.getDocuments(e,r).next(o=>{let a=this.Zi(t,o);return this.Xi(t,a,r,i)?P.resolve(null):(mr()<=B.DEBUG&&O("QueryEngine","Re-using previous result from %s to execute query: %s",i.toString(),hn(t)),this.es(e,a,t,z_(i,-1)).next(u=>u))})}Zi(e,t){let r=new ye(Ud(e));return t.forEach((i,o)=>{Ps(e,o)&&(r=r.add(o))}),r}Xi(e,t,r,i){if(e.limit===null)return!1;if(r.size!==t.size)return!0;let o=e.limitType==="F"?t.last():t.first();return!!o&&(o.hasPendingWrites||o.version.compareTo(i)>0)}Ji(e,t,r){return mr()<=B.DEBUG&&O("QueryEngine","Using full collection scan to execute query:",hn(t)),this.zi.getDocumentsMatchingQuery(e,t,zt.min(),r)}es(e,t,r,i){return this.zi.getDocumentsMatchingQuery(e,r,i).next(o=>(t.forEach(a=>{o=o.insert(a.key,a)}),o))}};var vc=class{constructor(e,t,r,i){this.persistence=e,this.ts=t,this.serializer=i,this.ns=new re(H),this.rs=new bt(o=>su(o),ou),this.ss=new Map,this.os=e.getRemoteDocumentCache(),this.Qr=e.getTargetCache(),this.$r=e.getBundleCache(),this._s(r)}_s(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new oc(this.os,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.os.setIndexManager(this.indexManager),this.ts.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.ns))}};function Vy(n,e,t,r){return new vc(n,e,t,r)}async function cf(n,e){let t=U(n);return await t.persistence.runTransaction("Handle user change","readonly",r=>{let i;return t.mutationQueue.getAllMutationBatches(r).next(o=>(i=o,t._s(e),t.mutationQueue.getAllMutationBatches(r))).next(o=>{let a=[],u=[],h=j();for(let d of i){a.push(d.batchId);for(let p of d.mutations)h=h.add(p.key)}for(let d of o){u.push(d.batchId);for(let p of d.mutations)h=h.add(p.key)}return t.localDocuments.getDocuments(r,h).next(d=>({us:d,removedBatchIds:a,addedBatchIds:u}))})})}function Ly(n,e){let t=U(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{let i=e.batch.keys(),o=t.os.newChangeBuffer({trackRemovals:!0});return function(u,h,d,p){let y=d.batch,T=y.keys(),R=P.resolve();return T.forEach(k=>{R=R.next(()=>p.getEntry(h,k)).next(x=>{let D=d.docVersions.get(k);W(D!==null),x.version.compareTo(D)<0&&(y.applyToRemoteDocument(x,d),x.isValidDocument()&&(x.setReadTime(d.commitVersion),p.addEntry(x)))})}),R.next(()=>u.mutationQueue.removeMutationBatch(h,y))}(t,r,e,o).next(()=>o.apply(r)).next(()=>t.mutationQueue.performConsistencyCheck(r)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(r,i,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(u){let h=j();for(let d=0;d<u.mutationResults.length;++d)u.mutationResults[d].transformResults.length>0&&(h=h.add(u.batch.mutations[d].key));return h}(e))).next(()=>t.localDocuments.getDocuments(r,i))})}function uf(n){let e=U(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.Qr.getLastRemoteSnapshotVersion(t))}function My(n,e){let t=U(n),r=e.snapshotVersion,i=t.ns;return t.persistence.runTransaction("Apply remote event","readwrite-primary",o=>{let a=t.os.newChangeBuffer({trackRemovals:!0});i=t.ns;let u=[];e.targetChanges.forEach((p,y)=>{let T=i.get(y);if(!T)return;u.push(t.Qr.removeMatchingKeys(o,p.removedDocuments,y).next(()=>t.Qr.addMatchingKeys(o,p.addedDocuments,y)));let R=T.withSequenceNumber(o.currentSequenceNumber);e.targetMismatches.get(y)!==null?R=R.withResumeToken(Ae.EMPTY_BYTE_STRING,F.min()).withLastLimboFreeSnapshotVersion(F.min()):p.resumeToken.approximateByteSize()>0&&(R=R.withResumeToken(p.resumeToken,r)),i=i.insert(y,R),function(x,D,q){return x.resumeToken.approximateByteSize()===0||D.snapshotVersion.toMicroseconds()-x.snapshotVersion.toMicroseconds()>=3e8?!0:q.addedDocuments.size+q.modifiedDocuments.size+q.removedDocuments.size>0}(T,R,p)&&u.push(t.Qr.updateTargetData(o,R))});let h=ot(),d=j();if(e.documentUpdates.forEach(p=>{e.resolvedLimboDocuments.has(p)&&u.push(t.persistence.referenceDelegate.updateLimboDocument(o,p))}),u.push(Fy(o,a,e.documentUpdates).next(p=>{h=p.cs,d=p.ls})),!r.isEqual(F.min())){let p=t.Qr.getLastRemoteSnapshotVersion(o).next(y=>t.Qr.setTargetsMetadata(o,o.currentSequenceNumber,r));u.push(p)}return P.waitFor(u).next(()=>a.apply(o)).next(()=>t.localDocuments.getLocalViewOfDocuments(o,h,d)).next(()=>h)}).then(o=>(t.ns=i,o))}function Fy(n,e,t){let r=j(),i=j();return t.forEach(o=>r=r.add(o)),e.getEntries(n,r).next(o=>{let a=ot();return t.forEach((u,h)=>{let d=o.get(u);h.isFoundDocument()!==d.isFoundDocument()&&(i=i.add(u)),h.isNoDocument()&&h.version.isEqual(F.min())?(e.removeEntry(u,h.readTime),a=a.insert(u,h)):!d.isValidDocument()||h.version.compareTo(d.version)>0||h.version.compareTo(d.version)===0&&d.hasPendingWrites?(e.addEntry(h),a=a.insert(u,h)):O("LocalStore","Ignoring outdated watch update for ",u,". Current version:",d.version," Watch version:",h.version)}),{cs:a,ls:i}})}function Uy(n,e){let t=U(n);return t.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=-1),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function qy(n,e){let t=U(n);return t.persistence.runTransaction("Allocate target","readwrite",r=>{let i;return t.Qr.getTargetData(r,e).next(o=>o?(i=o,P.resolve(i)):t.Qr.allocateTargetId(r).next(a=>(i=new Pr(e,a,"TargetPurposeListen",r.currentSequenceNumber),t.Qr.addTargetData(r,i).next(()=>i))))}).then(r=>{let i=t.ns.get(r.targetId);return(i===null||r.snapshotVersion.compareTo(i.snapshotVersion)>0)&&(t.ns=t.ns.insert(r.targetId,r),t.rs.set(e,r.targetId)),r})}async function Ic(n,e,t){let r=U(n),i=r.ns.get(e),o=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",o,a=>r.persistence.referenceDelegate.removeTarget(a,i))}catch(a){if(!Ur(a))throw a;O("LocalStore",`Failed to update sequence numbers for target ${e}: ${a}`)}r.ns=r.ns.remove(e),r.rs.delete(i.target)}function _d(n,e,t){let r=U(n),i=F.min(),o=j();return r.persistence.runTransaction("Execute query","readwrite",a=>function(h,d,p){let y=U(h),T=y.rs.get(p);return T!==void 0?P.resolve(y.ns.get(T)):y.Qr.getTargetData(d,p)}(r,a,$e(e)).next(u=>{if(u)return i=u.lastLimboFreeSnapshotVersion,r.Qr.getMatchingKeysForTargetId(a,u.targetId).next(h=>{o=h})}).next(()=>r.ts.getDocumentsMatchingQuery(a,e,t?i:F.min(),t?o:j())).next(u=>(By(r,ry(e),u),{documents:u,hs:o})))}function By(n,e,t){let r=n.ss.get(e)||F.min();t.forEach((i,o)=>{o.readTime.compareTo(r)>0&&(r=o.readTime)}),n.ss.set(e,r)}var us=class{constructor(){this.activeTargetIds=uy()}As(e){this.activeTargetIds=this.activeTargetIds.add(e)}Rs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}ds(){let e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}};var wc=class{constructor(){this.no=new us,this.ro={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e){return this.no.As(e),this.ro[e]||"not-current"}updateQueryState(e,t,r){this.ro[e]=t}removeLocalQueryTarget(e){this.no.Rs(e)}isLocalQueryTarget(e){return this.no.activeTargetIds.has(e)}clearQueryState(e){delete this.ro[e]}getAllActiveQueryTargets(){return this.no.activeTargetIds}isActiveQueryTarget(e){return this.no.activeTargetIds.has(e)}start(){return this.no=new us,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}};var Ec=class{io(e){}shutdown(){}};var ls=class{constructor(){this.so=()=>this.oo(),this._o=()=>this.ao(),this.uo=[],this.co()}io(e){this.uo.push(e)}shutdown(){window.removeEventListener("online",this.so),window.removeEventListener("offline",this._o)}co(){window.addEventListener("online",this.so),window.addEventListener("offline",this._o)}oo(){O("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(let e of this.uo)e(0)}ao(){O("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(let e of this.uo)e(1)}static D(){return typeof window!="undefined"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}};var $i=null;function ga(){return $i===null?$i=function(){return 268435456+Math.round(2147483648*Math.random())}():$i++,"0x"+$i.toString(16)}var jy={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};var Tc=class{constructor(e){this.lo=e.lo,this.ho=e.ho}Po(e){this.Io=e}To(e){this.Eo=e}Ao(e){this.Ro=e}onMessage(e){this.Vo=e}close(){this.ho()}send(e){this.lo(e)}mo(){this.Io()}fo(){this.Eo()}po(e){this.Ro(e)}yo(e){this.Vo(e)}};var ge="WebChannelConnection",Ac=class extends class{constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;let r=t.ssl?"https":"http",i=encodeURIComponent(this.databaseId.projectId),o=encodeURIComponent(this.databaseId.database);this.wo=r+"://"+t.host,this.So=`projects/${i}/databases/${o}`,this.bo=this.databaseId.database==="(default)"?`project_id=${i}`:`project_id=${i}&database_id=${o}`}get Do(){return!1}Co(t,r,i,o,a){let u=ga(),h=this.vo(t,r.toUriEncodedString());O("RestConnection",`Sending RPC '${t}' ${u}:`,h,i);let d={"google-cloud-resource-prefix":this.So,"x-goog-request-params":this.bo};return this.Fo(d,o,a),this.Mo(t,h,d,i).then(p=>(O("RestConnection",`Received RPC '${t}' ${u}: `,p),p),p=>{throw Er("RestConnection",`RPC '${t}' ${u} failed with error: `,p,"url: ",h,"request:",i),p})}xo(t,r,i,o,a,u){return this.Co(t,r,i,o,a)}Fo(t,r,i){t["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+kn}(),t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),r&&r.headers.forEach((o,a)=>t[a]=o),i&&i.headers.forEach((o,a)=>t[a]=o)}vo(t,r){let i=jy[t];return`${this.wo}/v1/${r}:${i}`}terminate(){}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}Mo(e,t,r,i){let o=ga();return new Promise((a,u)=>{let h=new la;h.setWithCredentials(!0),h.listenOnce(da.COMPLETE,()=>{try{switch(h.getLastErrorCode()){case pr.NO_ERROR:let p=h.getResponseJson();O(ge,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(p)),a(p);break;case pr.TIMEOUT:O(ge,`RPC '${e}' ${o} timed out`),u(new N(S.DEADLINE_EXCEEDED,"Request time out"));break;case pr.HTTP_ERROR:let y=h.getStatus();if(O(ge,`RPC '${e}' ${o} failed with status:`,y,"response text:",h.getResponseText()),y>0){let T=h.getResponseJson();Array.isArray(T)&&(T=T[0]);let R=T==null?void 0:T.error;if(R&&R.status&&R.message){let k=function(D){let q=D.toLowerCase().replace(/_/g,"-");return Object.values(S).indexOf(q)>=0?q:S.UNKNOWN}(R.status);u(new N(k,R.message))}else u(new N(S.UNKNOWN,"Server responded with status "+h.getStatus()))}else u(new N(S.UNAVAILABLE,"Connection failed."));break;default:M()}}finally{O(ge,`RPC '${e}' ${o} completed.`)}});let d=JSON.stringify(i);O(ge,`RPC '${e}' ${o} sending request:`,i),h.send(t,"POST",d,r,15)})}Oo(e,t,r){let i=ga(),o=[this.wo,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=ma(),u=pa(),h={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},d=this.longPollingOptions.timeoutSeconds;d!==void 0&&(h.longPollingTimeout=Math.round(1e3*d)),this.useFetchStreams&&(h.xmlHttpFactory=new ha({})),this.Fo(h.initMessageHeaders,t,r),h.encodeInitMessageHeaders=!0;let p=o.join("");O(ge,`Creating RPC '${e}' stream ${i}: ${p}`,h);let y=a.createWebChannel(p,h),T=!1,R=!1,k=new Tc({lo:D=>{R?O(ge,`Not sending because RPC '${e}' stream ${i} is closed:`,D):(T||(O(ge,`Opening RPC '${e}' stream ${i} transport.`),y.open(),T=!0),O(ge,`RPC '${e}' stream ${i} sending:`,D),y.send(D))},ho:()=>y.close()}),x=(D,q,z)=>{D.listen(q,G=>{try{z(G)}catch(X){setTimeout(()=>{throw X},0)}})};return x(y,ln.EventType.OPEN,()=>{R||(O(ge,`RPC '${e}' stream ${i} transport opened.`),k.mo())}),x(y,ln.EventType.CLOSE,()=>{R||(R=!0,O(ge,`RPC '${e}' stream ${i} transport closed`),k.po())}),x(y,ln.EventType.ERROR,D=>{R||(R=!0,Er(ge,`RPC '${e}' stream ${i} transport errored:`,D),k.po(new N(S.UNAVAILABLE,"The operation could not be completed")))}),x(y,ln.EventType.MESSAGE,D=>{var q;if(!R){let z=D.data[0];W(!!z);let G=z,X=G.error||((q=G[0])===null||q===void 0?void 0:q.error);if(X){O(ge,`RPC '${e}' stream ${i} received error:`,X);let Ie=X.status,Q=function(_){let v=ie[_];if(v!==void 0)return Xd(v)}(Ie),I=X.message;Q===void 0&&(Q=S.INTERNAL,I="Unknown error status: "+Ie+" with message "+X.message),R=!0,k.po(new N(Q,I)),y.close()}else O(ge,`RPC '${e}' stream ${i} received:`,z),k.yo(z)}}),x(u,fa.STAT_EVENT,D=>{D.stat===Gi.PROXY?O(ge,`RPC '${e}' stream ${i} detected buffering proxy`):D.stat===Gi.NOPROXY&&O(ge,`RPC '${e}' stream ${i} detected no buffering proxy`)}),setTimeout(()=>{k.fo()},0),k}};function _a(){return typeof document!="undefined"?document:null}function Cs(n){return new Ya(n,!0)}var Nr=class{constructor(e,t,r=1e3,i=1.5,o=6e4){this.oi=e,this.timerId=t,this.No=r,this.Lo=i,this.Bo=o,this.ko=0,this.qo=null,this.Qo=Date.now(),this.reset()}reset(){this.ko=0}Ko(){this.ko=this.Bo}$o(e){this.cancel();let t=Math.floor(this.ko+this.Uo()),r=Math.max(0,Date.now()-this.Qo),i=Math.max(0,t-r);i>0&&O("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.ko} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.qo=this.oi.enqueueAfterDelay(this.timerId,i,()=>(this.Qo=Date.now(),e())),this.ko*=this.Lo,this.ko<this.No&&(this.ko=this.No),this.ko>this.Bo&&(this.ko=this.Bo)}Wo(){this.qo!==null&&(this.qo.skipDelay(),this.qo=null)}cancel(){this.qo!==null&&(this.qo.cancel(),this.qo=null)}Uo(){return(Math.random()-.5)*this.ko}};var hs=class{constructor(e,t,r,i,o,a,u,h){this.oi=e,this.Go=r,this.zo=i,this.connection=o,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=u,this.listener=h,this.state=0,this.jo=0,this.Ho=null,this.Jo=null,this.stream=null,this.Yo=new Nr(e,t)}Zo(){return this.state===1||this.state===5||this.Xo()}Xo(){return this.state===2||this.state===3}start(){this.state!==4?this.auth():this.e_()}async stop(){this.Zo()&&await this.close(0)}t_(){this.state=0,this.Yo.reset()}n_(){this.Xo()&&this.Ho===null&&(this.Ho=this.oi.enqueueAfterDelay(this.Go,6e4,()=>this.r_()))}i_(e){this.s_(),this.stream.send(e)}async r_(){if(this.Xo())return this.close(0)}s_(){this.Ho&&(this.Ho.cancel(),this.Ho=null)}o_(){this.Jo&&(this.Jo.cancel(),this.Jo=null)}async close(e,t){this.s_(),this.o_(),this.Yo.cancel(),this.jo++,e!==4?this.Yo.reset():t&&t.code===S.RESOURCE_EXHAUSTED?(it(t.toString()),it("Using maximum backoff delay to prevent overloading the backend."),this.Yo.Ko()):t&&t.code===S.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.__(),this.stream.close(),this.stream=null),this.state=e,await this.listener.Ao(t)}__(){}auth(){this.state=1;let e=this.a_(this.jo),t=this.jo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,i])=>{this.jo===t&&this.u_(r,i)},r=>{e(()=>{let i=new N(S.UNKNOWN,"Fetching auth token failed: "+r.message);return this.c_(i)})})}u_(e,t){let r=this.a_(this.jo);this.stream=this.l_(e,t),this.stream.Po(()=>{r(()=>this.listener.Po())}),this.stream.To(()=>{r(()=>(this.state=2,this.Jo=this.oi.enqueueAfterDelay(this.zo,1e4,()=>(this.Xo()&&(this.state=3),Promise.resolve())),this.listener.To()))}),this.stream.Ao(i=>{r(()=>this.c_(i))}),this.stream.onMessage(i=>{r(()=>this.onMessage(i))})}e_(){this.state=5,this.Yo.$o(async()=>{this.state=0,this.start()})}c_(e){return O("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}a_(e){return t=>{this.oi.enqueueAndForget(()=>this.jo===e?t():(O("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}},bc=class extends hs{constructor(e,t,r,i,o,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,i,a),this.serializer=o}l_(e,t){return this.connection.Oo("Listen",e,t)}onMessage(e){this.Yo.reset();let t=Ay(this.serializer,e),r=function(o){if(!("targetChange"in o))return F.min();let a=o.targetChange;return a.targetIds&&a.targetIds.length?F.min():a.readTime?Ce(a.readTime):F.min()}(e);return this.listener.h_(t,r)}P_(e){let t={};t.database=ec(this.serializer),t.addTarget=function(o,a){let u,h=a.target;if(u=qa(h)?{documents:Sy(o,h)}:{query:Ry(o,h)._t},u.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){u.resumeToken=Zd(o,a.resumeToken);let d=Xa(o,a.expectedCount);d!==null&&(u.expectedCount=d)}else if(a.snapshotVersion.compareTo(F.min())>0){u.readTime=os(o,a.snapshotVersion.toTimestamp());let d=Xa(o,a.expectedCount);d!==null&&(u.expectedCount=d)}return u}(this.serializer,e);let r=Cy(this.serializer,e);r&&(t.labels=r),this.i_(t)}I_(e){let t={};t.database=ec(this.serializer),t.removeTarget=e,this.i_(t)}},Sc=class extends hs{constructor(e,t,r,i,o,a){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,i,a),this.serializer=o,this.T_=!1}get E_(){return this.T_}start(){this.T_=!1,this.lastStreamToken=void 0,super.start()}__(){this.T_&&this.d_([])}l_(e,t){return this.connection.Oo("Write",e,t)}onMessage(e){if(W(!!e.streamToken),this.lastStreamToken=e.streamToken,this.T_){this.Yo.reset();let t=by(e.writeResults,e.commitTime),r=Ce(e.commitTime);return this.listener.A_(r,t)}return W(!e.writeResults||e.writeResults.length===0),this.T_=!0,this.listener.R_()}V_(){let e={};e.database=ec(this.serializer),this.i_(e)}d_(e){let t={streamToken:this.lastStreamToken,writes:e.map(r=>rf(this.serializer,r))};this.i_(t)}};var Rc=class extends class{}{constructor(e,t,r,i){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=i,this.m_=!1}f_(){if(this.m_)throw new N(S.FAILED_PRECONDITION,"The client has already been terminated.")}Co(e,t,r,i){return this.f_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,a])=>this.connection.Co(e,Za(t,r),i,o,a)).catch(o=>{throw o.name==="FirebaseError"?(o.code===S.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new N(S.UNKNOWN,o.toString())})}xo(e,t,r,i,o){return this.f_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([a,u])=>this.connection.xo(e,Za(t,r),i,a,u,o)).catch(a=>{throw a.name==="FirebaseError"?(a.code===S.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new N(S.UNKNOWN,a.toString())})}terminate(){this.m_=!0,this.connection.terminate()}},Pc=class{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.g_=0,this.p_=null,this.y_=!0}w_(){this.g_===0&&(this.S_("Unknown"),this.p_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.p_=null,this.b_("Backend didn't respond within 10 seconds."),this.S_("Offline"),Promise.resolve())))}D_(e){this.state==="Online"?this.S_("Unknown"):(this.g_++,this.g_>=1&&(this.C_(),this.b_(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.S_("Offline")))}set(e){this.C_(),this.g_=0,e==="Online"&&(this.y_=!1),this.S_(e)}S_(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}b_(e){let t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.y_?(it(t),this.y_=!1):O("OnlineStateTracker",t)}C_(){this.p_!==null&&(this.p_.cancel(),this.p_=null)}};var Cc=class{constructor(e,t,r,i,o){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.v_=[],this.F_=new Map,this.M_=new Set,this.x_=[],this.O_=o,this.O_.io(a=>{r.enqueueAndForget(async()=>{Yt(this)&&(O("RemoteStore","Restarting streams for network reachability change."),await async function(h){let d=U(h);d.M_.add(4),await Br(d),d.N_.set("Unknown"),d.M_.delete(4),await Ds(d)}(this))})}),this.N_=new Pc(r,i)}};async function Ds(n){if(Yt(n))for(let e of n.x_)await e(!0)}async function Br(n){for(let e of n.x_)await e(!1)}function lf(n,e){let t=U(n);t.F_.has(e.targetId)||(t.F_.set(e.targetId,e),hu(t)?lu(t):On(t).Xo()&&uu(t,e))}function cu(n,e){let t=U(n),r=On(t);t.F_.delete(e),r.Xo()&&hf(t,e),t.F_.size===0&&(r.Xo()?r.n_():Yt(t)&&t.N_.set("Unknown"))}function uu(n,e){if(n.L_.xe(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(F.min())>0){let t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}On(n).P_(e)}function hf(n,e){n.L_.xe(e),On(n).I_(e)}function lu(n){n.L_=new Ja({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),ot:e=>n.F_.get(e)||null,tt:()=>n.datastore.serializer.databaseId}),On(n).start(),n.N_.w_()}function hu(n){return Yt(n)&&!On(n).Zo()&&n.F_.size>0}function Yt(n){return U(n).M_.size===0}function df(n){n.L_=void 0}async function zy(n){n.N_.set("Online")}async function Gy(n){n.F_.forEach((e,t)=>{uu(n,e)})}async function Ky(n,e){df(n),hu(n)?(n.N_.D_(e),lu(n)):n.N_.set("Unknown")}async function $y(n,e,t){if(n.N_.set("Online"),e instanceof is&&e.state===2&&e.cause)try{await async function(i,o){let a=o.cause;for(let u of o.targetIds)i.F_.has(u)&&(await i.remoteSyncer.rejectListen(u,a),i.F_.delete(u),i.L_.removeTarget(u))}(n,e)}catch(r){O("RemoteStore","Failed to remove targets %s: %s ",e.targetIds.join(","),r),await ds(n,r)}else if(e instanceof mn?n.L_.Ke(e):e instanceof rs?n.L_.He(e):n.L_.We(e),!t.isEqual(F.min()))try{let r=await uf(n.localStore);t.compareTo(r)>=0&&await function(o,a){let u=o.L_.rt(a);return u.targetChanges.forEach((h,d)=>{if(h.resumeToken.approximateByteSize()>0){let p=o.F_.get(d);p&&o.F_.set(d,p.withResumeToken(h.resumeToken,a))}}),u.targetMismatches.forEach((h,d)=>{let p=o.F_.get(h);if(!p)return;o.F_.set(h,p.withResumeToken(Ae.EMPTY_BYTE_STRING,p.snapshotVersion)),hf(o,h);let y=new Pr(p.target,h,d,p.sequenceNumber);uu(o,y)}),o.remoteSyncer.applyRemoteEvent(u)}(n,t)}catch(r){O("RemoteStore","Failed to raise snapshot:",r),await ds(n,r)}}async function ds(n,e,t){if(!Ur(e))throw e;n.M_.add(1),await Br(n),n.N_.set("Offline"),t||(t=()=>uf(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{O("RemoteStore","Retrying IndexedDB access"),await t(),n.M_.delete(1),await Ds(n)})}function ff(n,e){return e().catch(t=>ds(n,t,e))}async function Ns(n){let e=U(n),t=St(e),r=e.v_.length>0?e.v_[e.v_.length-1].batchId:-1;for(;Hy(e);)try{let i=await Uy(e.localStore,r);if(i===null){e.v_.length===0&&t.n_();break}r=i.batchId,Wy(e,i)}catch(i){await ds(e,i)}pf(e)&&mf(e)}function Hy(n){return Yt(n)&&n.v_.length<10}function Wy(n,e){n.v_.push(e);let t=St(n);t.Xo()&&t.E_&&t.d_(e.mutations)}function pf(n){return Yt(n)&&!St(n).Zo()&&n.v_.length>0}function mf(n){St(n).start()}async function Qy(n){St(n).V_()}async function Jy(n){let e=St(n);for(let t of n.v_)e.d_(t.mutations)}async function Yy(n,e,t){let r=n.v_.shift(),i=$a.from(r,e,t);await ff(n,()=>n.remoteSyncer.applySuccessfulWrite(i)),await Ns(n)}async function Xy(n,e){e&&St(n).E_&&await async function(r,i){if(function(a){return Yd(a)&&a!==S.ABORTED}(i.code)){let o=r.v_.shift();St(r).t_(),await ff(r,()=>r.remoteSyncer.rejectFailedWrite(o.batchId,i)),await Ns(r)}}(n,e),pf(n)&&mf(n)}async function yd(n,e){let t=U(n);t.asyncQueue.verifyOperationInProgress(),O("RemoteStore","RemoteStore received new credentials");let r=Yt(t);t.M_.add(3),await Br(t),r&&t.N_.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.M_.delete(3),await Ds(t)}async function Zy(n,e){let t=U(n);e?(t.M_.delete(2),await Ds(t)):e||(t.M_.add(2),await Br(t),t.N_.set("Unknown"))}function On(n){return n.B_||(n.B_=function(t,r,i){let o=U(t);return o.f_(),new bc(r,o.connection,o.authCredentials,o.appCheckCredentials,o.serializer,i)}(n.datastore,n.asyncQueue,{Po:zy.bind(null,n),To:Gy.bind(null,n),Ao:Ky.bind(null,n),h_:$y.bind(null,n)}),n.x_.push(async e=>{e?(n.B_.t_(),hu(n)?lu(n):n.N_.set("Unknown")):(await n.B_.stop(),df(n))})),n.B_}function St(n){return n.k_||(n.k_=function(t,r,i){let o=U(t);return o.f_(),new Sc(r,o.connection,o.authCredentials,o.appCheckCredentials,o.serializer,i)}(n.datastore,n.asyncQueue,{Po:()=>Promise.resolve(),To:Qy.bind(null,n),Ao:Xy.bind(null,n),R_:Jy.bind(null,n),A_:Yy.bind(null,n)}),n.x_.push(async e=>{e?(n.k_.t_(),await Ns(n)):(await n.k_.stop(),n.v_.length>0&&(O("RemoteStore",`Stopping write stream with ${n.v_.length} pending writes`),n.v_=[]))})),n.k_}var Dc=class n{constructor(e,t,r,i,o){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=i,this.removalCallback=o,this.deferred=new Oe,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(a=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,i,o){let a=Date.now()+r,u=new n(e,t,a,i,o);return u.start(r),u}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new N(S.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}};function du(n,e){if(it("AsyncQueue",`${e}: ${n}`),Ur(n))return new N(S.UNAVAILABLE,`${e}: ${n}`);throw n}var fs=class n{constructor(e){this.comparator=e?(t,r)=>e(t,r)||L.comparator(t.key,r.key):(t,r)=>L.comparator(t.key,r.key),this.keyedMap=gr(),this.sortedSet=new re(this.comparator)}static emptySet(e){return new n(e.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){let t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){let t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){let t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof n)||this.size!==e.size)return!1;let t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){let i=t.getNext().key,o=r.getNext().key;if(!i.isEqual(o))return!1}return!0}toString(){let e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){let r=new n;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}};var ps=class{constructor(){this.q_=new re(L.comparator)}track(e){let t=e.doc.key,r=this.q_.get(t);r?e.type!==0&&r.type===3?this.q_=this.q_.insert(t,e):e.type===3&&r.type!==1?this.q_=this.q_.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.q_=this.q_.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.q_=this.q_.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.q_=this.q_.remove(t):e.type===1&&r.type===2?this.q_=this.q_.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.q_=this.q_.insert(t,{type:2,doc:e.doc}):M():this.q_=this.q_.insert(t,e)}Q_(){let e=[];return this.q_.inorderTraversal((t,r)=>{e.push(r)}),e}},Sn=class n{constructor(e,t,r,i,o,a,u,h,d){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=i,this.mutatedKeys=o,this.fromCache=a,this.syncStateChanged=u,this.excludesMetadataChanges=h,this.hasCachedResults=d}static fromInitialDocuments(e,t,r,i,o){let a=[];return t.forEach(u=>{a.push({type:0,doc:u})}),new n(e,t,fs.emptySet(t),a,r,i,!0,!1,o)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Rs(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;let t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let i=0;i<t.length;i++)if(t[i].type!==r[i].type||!t[i].doc.isEqual(r[i].doc))return!1;return!0}};var Nc=class{constructor(){this.K_=void 0,this.U_=[]}W_(){return this.U_.some(e=>e.G_())}},kc=class{constructor(){this.queries=new bt(e=>Fd(e),Rs),this.onlineState="Unknown",this.z_=new Set}};async function fu(n,e){let t=U(n),r=3,i=e.query,o=t.queries.get(i);o?!o.W_()&&e.G_()&&(r=2):(o=new Nc,r=e.G_()?0:1);try{switch(r){case 0:o.K_=await t.onListen(i,!0);break;case 1:o.K_=await t.onListen(i,!1);break;case 2:await t.onFirstRemoteStoreListen(i)}}catch(a){let u=du(a,`Initialization of query '${hn(e.query)}' failed`);return void e.onError(u)}t.queries.set(i,o),o.U_.push(e),e.j_(t.onlineState),o.K_&&e.H_(o.K_)&&mu(t)}async function pu(n,e){let t=U(n),r=e.query,i=3,o=t.queries.get(r);if(o){let a=o.U_.indexOf(e);a>=0&&(o.U_.splice(a,1),o.U_.length===0?i=e.G_()?0:1:!o.W_()&&e.G_()&&(i=2))}switch(i){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function ev(n,e){let t=U(n),r=!1;for(let i of e){let o=i.query,a=t.queries.get(o);if(a){for(let u of a.U_)u.H_(i)&&(r=!0);a.K_=i}}r&&mu(t)}function tv(n,e,t){let r=U(n),i=r.queries.get(e);if(i)for(let o of i.U_)o.onError(t);r.queries.delete(e)}function mu(n){n.z_.forEach(e=>{e.next()})}var Oc,vd;(vd=Oc||(Oc={})).J_="default",vd.Cache="cache";var kr=class{constructor(e,t,r){this.query=e,this.Y_=t,this.Z_=!1,this.X_=null,this.onlineState="Unknown",this.options=r||{}}H_(e){if(!this.options.includeMetadataChanges){let r=[];for(let i of e.docChanges)i.type!==3&&r.push(i);e=new Sn(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.Z_?this.ea(e)&&(this.Y_.next(e),t=!0):this.ta(e,this.onlineState)&&(this.na(e),t=!0),this.X_=e,t}onError(e){this.Y_.error(e)}j_(e){this.onlineState=e;let t=!1;return this.X_&&!this.Z_&&this.ta(this.X_,e)&&(this.na(this.X_),t=!0),t}ta(e,t){if(!e.fromCache||!this.G_())return!0;let r=t!=="Offline";return(!this.options.ra||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}ea(e){if(e.docChanges.length>0)return!0;let t=this.X_&&this.X_.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}na(e){e=Sn.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Z_=!0,this.Y_.next(e)}G_(){return this.options.source!==Oc.Cache}};var ms=class{constructor(e){this.key=e}},gs=class{constructor(e){this.key=e}},xc=class{constructor(e,t){this.query=e,this.la=t,this.ha=null,this.hasCachedResults=!1,this.current=!1,this.Pa=j(),this.mutatedKeys=j(),this.Ia=Ud(e),this.Ta=new fs(this.Ia)}get Ea(){return this.la}da(e,t){let r=t?t.Aa:new ps,i=t?t.Ta:this.Ta,o=t?t.mutatedKeys:this.mutatedKeys,a=i,u=!1,h=this.query.limitType==="F"&&i.size===this.query.limit?i.last():null,d=this.query.limitType==="L"&&i.size===this.query.limit?i.first():null;if(e.inorderTraversal((p,y)=>{let T=i.get(p),R=Ps(this.query,y)?y:null,k=!!T&&this.mutatedKeys.has(T.key),x=!!R&&(R.hasLocalMutations||this.mutatedKeys.has(R.key)&&R.hasCommittedMutations),D=!1;T&&R?T.data.isEqual(R.data)?k!==x&&(r.track({type:3,doc:R}),D=!0):this.Ra(T,R)||(r.track({type:2,doc:R}),D=!0,(h&&this.Ia(R,h)>0||d&&this.Ia(R,d)<0)&&(u=!0)):!T&&R?(r.track({type:0,doc:R}),D=!0):T&&!R&&(r.track({type:1,doc:T}),D=!0,(h||d)&&(u=!0)),D&&(R?(a=a.add(R),o=x?o.add(p):o.delete(p)):(a=a.delete(p),o=o.delete(p)))}),this.query.limit!==null)for(;a.size>this.query.limit;){let p=this.query.limitType==="F"?a.last():a.first();a=a.delete(p.key),o=o.delete(p.key),r.track({type:1,doc:p})}return{Ta:a,Aa:r,Xi:u,mutatedKeys:o}}Ra(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,i){let o=this.Ta;this.Ta=e.Ta,this.mutatedKeys=e.mutatedKeys;let a=e.Aa.Q_();a.sort((p,y)=>function(R,k){let x=D=>{switch(D){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return M()}};return x(R)-x(k)}(p.type,y.type)||this.Ia(p.doc,y.doc)),this.Va(r),i=i!=null&&i;let u=t&&!i?this.ma():[],h=this.Pa.size===0&&this.current&&!i?1:0,d=h!==this.ha;return this.ha=h,a.length!==0||d?{snapshot:new Sn(this.query,e.Ta,o,a,e.mutatedKeys,h===0,d,!1,!!r&&r.resumeToken.approximateByteSize()>0),fa:u}:{fa:u}}j_(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ta:this.Ta,Aa:new ps,mutatedKeys:this.mutatedKeys,Xi:!1},!1)):{fa:[]}}ga(e){return!this.la.has(e)&&!!this.Ta.has(e)&&!this.Ta.get(e).hasLocalMutations}Va(e){e&&(e.addedDocuments.forEach(t=>this.la=this.la.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.la=this.la.delete(t)),this.current=e.current)}ma(){if(!this.current)return[];let e=this.Pa;this.Pa=j(),this.Ta.forEach(r=>{this.ga(r.key)&&(this.Pa=this.Pa.add(r.key))});let t=[];return e.forEach(r=>{this.Pa.has(r)||t.push(new gs(r))}),this.Pa.forEach(r=>{e.has(r)||t.push(new ms(r))}),t}pa(e){this.la=e.hs,this.Pa=j();let t=this.da(e.documents);return this.applyChanges(t,!0)}ya(){return Sn.fromInitialDocuments(this.query,this.Ta,this.mutatedKeys,this.ha===0,this.hasCachedResults)}},Vc=class{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}},Lc=class{constructor(e){this.key=e,this.wa=!1}},Mc=class{constructor(e,t,r,i,o,a){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=i,this.currentUser=o,this.maxConcurrentLimboResolutions=a,this.Sa={},this.ba=new bt(u=>Fd(u),Rs),this.Da=new Map,this.Ca=new Set,this.va=new re(L.comparator),this.Fa=new Map,this.Ma=new Dr,this.xa={},this.Oa=new Map,this.Na=Cr.Ln(),this.onlineState="Unknown",this.La=void 0}get isPrimaryClient(){return this.La===!0}};async function nv(n,e,t=!0){let r=wf(n),i,o=r.ba.get(e);return o?(r.sharedClientState.addLocalQueryTarget(o.targetId),i=o.view.ya()):i=await gf(r,e,t,!0),i}async function rv(n,e){let t=wf(n);await gf(t,e,!0,!1)}async function gf(n,e,t,r){let i=await qy(n.localStore,$e(e)),o=i.targetId,a=t?n.sharedClientState.addLocalQueryTarget(o):"not-current",u;return r&&(u=await iv(n,e,o,a==="current",i.resumeToken)),n.isPrimaryClient&&t&&lf(n.remoteStore,i),u}async function iv(n,e,t,r,i){n.Ba=(y,T,R)=>async function(x,D,q,z){let G=D.view.da(q);G.Xi&&(G=await _d(x.localStore,D.query,!1).then(({documents:I})=>D.view.da(I,G)));let X=z&&z.targetChanges.get(D.targetId),Ie=z&&z.targetMismatches.get(D.targetId)!=null,Q=D.view.applyChanges(G,x.isPrimaryClient,X,Ie);return wd(x,D.targetId,Q.fa),Q.snapshot}(n,y,T,R);let o=await _d(n.localStore,e,!0),a=new xc(e,o.hs),u=a.da(o.documents),h=Rr.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",i),d=a.applyChanges(u,n.isPrimaryClient,h);wd(n,t,d.fa);let p=new Vc(e,t,a);return n.ba.set(e,p),n.Da.has(t)?n.Da.get(t).push(e):n.Da.set(t,[e]),d.snapshot}async function sv(n,e,t){let r=U(n),i=r.ba.get(e),o=r.Da.get(i.targetId);if(o.length>1)return r.Da.set(i.targetId,o.filter(a=>!Rs(a,e))),void r.ba.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(i.targetId),r.sharedClientState.isActiveQueryTarget(i.targetId)||await Ic(r.localStore,i.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(i.targetId),t&&cu(r.remoteStore,i.targetId),Fc(r,i.targetId)}).catch(Fr)):(Fc(r,i.targetId),await Ic(r.localStore,i.targetId,!0))}async function ov(n,e){let t=U(n),r=t.ba.get(e),i=t.Da.get(r.targetId);t.isPrimaryClient&&i.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),cu(t.remoteStore,r.targetId))}async function av(n,e,t){let r=pv(n);try{let i=await function(a,u){let h=U(a),d=ue.now(),p=u.reduce((R,k)=>R.add(k.key),j()),y,T;return h.persistence.runTransaction("Locally write mutations","readwrite",R=>{let k=ot(),x=j();return h.os.getEntries(R,p).next(D=>{k=D,k.forEach((q,z)=>{z.isValidDocument()||(x=x.add(q))})}).next(()=>h.localDocuments.getOverlayedDocuments(R,k)).next(D=>{y=D;let q=[];for(let z of u){let G=my(z,y.get(z.key).overlayedDocument);G!=null&&q.push(new We(z.key,G,Nd(G.value.mapValue),Te.exists(!0)))}return h.mutationQueue.addMutationBatch(R,d,q,u)}).next(D=>{T=D;let q=D.applyToLocalDocumentSet(y,x);return h.documentOverlayCache.saveOverlays(R,D.batchId,q)})}).then(()=>({batchId:T.batchId,changes:Bd(y)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(i.batchId),function(a,u,h){let d=a.xa[a.currentUser.toKey()];d||(d=new re(H)),d=d.insert(u,h),a.xa[a.currentUser.toKey()]=d}(r,i.batchId,t),await jr(r,i.changes),await Ns(r.remoteStore)}catch(i){let o=du(i,"Failed to persist write");t.reject(o)}}async function _f(n,e){let t=U(n);try{let r=await My(t.localStore,e);e.targetChanges.forEach((i,o)=>{let a=t.Fa.get(o);a&&(W(i.addedDocuments.size+i.modifiedDocuments.size+i.removedDocuments.size<=1),i.addedDocuments.size>0?a.wa=!0:i.modifiedDocuments.size>0?W(a.wa):i.removedDocuments.size>0&&(W(a.wa),a.wa=!1))}),await jr(t,r,e)}catch(r){await Fr(r)}}function Id(n,e,t){let r=U(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){let i=[];r.ba.forEach((o,a)=>{let u=a.view.j_(e);u.snapshot&&i.push(u.snapshot)}),function(a,u){let h=U(a);h.onlineState=u;let d=!1;h.queries.forEach((p,y)=>{for(let T of y.U_)T.j_(u)&&(d=!0)}),d&&mu(h)}(r.eventManager,e),i.length&&r.Sa.h_(i),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function cv(n,e,t){let r=U(n);r.sharedClientState.updateQueryState(e,"rejected",t);let i=r.Fa.get(e),o=i&&i.key;if(o){let a=new re(L.comparator);a=a.insert(o,De.newNoDocument(o,F.min()));let u=j().add(o),h=new ns(F.min(),new Map,new re(H),a,u);await _f(r,h),r.va=r.va.remove(o),r.Fa.delete(e),gu(r)}else await Ic(r.localStore,e,!1).then(()=>Fc(r,e,t)).catch(Fr)}async function uv(n,e){let t=U(n),r=e.batch.batchId;try{let i=await Ly(t.localStore,e);vf(t,r,null),yf(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await jr(t,i)}catch(i){await Fr(i)}}async function lv(n,e,t){let r=U(n);try{let i=await function(a,u){let h=U(a);return h.persistence.runTransaction("Reject batch","readwrite-primary",d=>{let p;return h.mutationQueue.lookupMutationBatch(d,u).next(y=>(W(y!==null),p=y.keys(),h.mutationQueue.removeMutationBatch(d,y))).next(()=>h.mutationQueue.performConsistencyCheck(d)).next(()=>h.documentOverlayCache.removeOverlaysForBatchId(d,p,u)).next(()=>h.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(d,p)).next(()=>h.localDocuments.getDocuments(d,p))})}(r.localStore,e);vf(r,e,t),yf(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await jr(r,i)}catch(i){await Fr(i)}}function yf(n,e){(n.Oa.get(e)||[]).forEach(t=>{t.resolve()}),n.Oa.delete(e)}function vf(n,e,t){let r=U(n),i=r.xa[r.currentUser.toKey()];if(i){let o=i.get(e);o&&(t?o.reject(t):o.resolve(),i=i.remove(e)),r.xa[r.currentUser.toKey()]=i}}function Fc(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(let r of n.Da.get(e))n.ba.delete(r),t&&n.Sa.ka(r,t);n.Da.delete(e),n.isPrimaryClient&&n.Ma.Vr(e).forEach(r=>{n.Ma.containsKey(r)||If(n,r)})}function If(n,e){n.Ca.delete(e.path.canonicalString());let t=n.va.get(e);t!==null&&(cu(n.remoteStore,t),n.va=n.va.remove(e),n.Fa.delete(t),gu(n))}function wd(n,e,t){for(let r of t)r instanceof ms?(n.Ma.addReference(r.key,e),hv(n,r)):r instanceof gs?(O("SyncEngine","Document no longer in limbo: "+r.key),n.Ma.removeReference(r.key,e),n.Ma.containsKey(r.key)||If(n,r.key)):M()}function hv(n,e){let t=e.key,r=t.path.canonicalString();n.va.get(t)||n.Ca.has(r)||(O("SyncEngine","New document in limbo: "+t),n.Ca.add(r),gu(n))}function gu(n){for(;n.Ca.size>0&&n.va.size<n.maxConcurrentLimboResolutions;){let e=n.Ca.values().next().value;n.Ca.delete(e);let t=new L(Y.fromString(e)),r=n.Na.next();n.Fa.set(r,new Lc(t)),n.va=n.va.insert(t,r),lf(n.remoteStore,new Pr($e(Ss(t.path)),r,"TargetPurposeLimboResolution",Tr.oe))}}async function jr(n,e,t){let r=U(n),i=[],o=[],a=[];r.ba.isEmpty()||(r.ba.forEach((u,h)=>{a.push(r.Ba(h,e,t).then(d=>{if((d||t)&&r.isPrimaryClient){let p=d&&!d.fromCache;r.sharedClientState.updateQueryState(h.targetId,p?"current":"not-current")}if(d){i.push(d);let p=gc.Ki(h.targetId,d);o.push(p)}}))}),await Promise.all(a),r.Sa.h_(i),await async function(h,d){let p=U(h);try{await p.persistence.runTransaction("notifyLocalViewChanges","readwrite",y=>P.forEach(d,T=>P.forEach(T.qi,R=>p.persistence.referenceDelegate.addReference(y,T.targetId,R)).next(()=>P.forEach(T.Qi,R=>p.persistence.referenceDelegate.removeReference(y,T.targetId,R)))))}catch(y){if(!Ur(y))throw y;O("LocalStore","Failed to update sequence numbers: "+y)}for(let y of d){let T=y.targetId;if(!y.fromCache){let R=p.ns.get(T),k=R.snapshotVersion,x=R.withLastLimboFreeSnapshotVersion(k);p.ns=p.ns.insert(T,x)}}}(r.localStore,o))}async function dv(n,e){let t=U(n);if(!t.currentUser.isEqual(e)){O("SyncEngine","User change. New user:",e.toKey());let r=await cf(t.localStore,e);t.currentUser=e,function(o,a){o.Oa.forEach(u=>{u.forEach(h=>{h.reject(new N(S.CANCELLED,a))})}),o.Oa.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await jr(t,r.us)}}function fv(n,e){let t=U(n),r=t.Fa.get(e);if(r&&r.wa)return j().add(r.key);{let i=j(),o=t.Da.get(e);if(!o)return i;for(let a of o){let u=t.ba.get(a);i=i.unionWith(u.view.Ea)}return i}}function wf(n){let e=U(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=_f.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=fv.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=cv.bind(null,e),e.Sa.h_=ev.bind(null,e.eventManager),e.Sa.ka=tv.bind(null,e.eventManager),e}function pv(n){let e=U(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=uv.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=lv.bind(null,e),e}var Or=class{constructor(){this.synchronizeTabs=!1}async initialize(e){this.serializer=Cs(e.databaseInfo.databaseId),this.sharedClientState=this.createSharedClientState(e),this.persistence=this.createPersistence(e),await this.persistence.start(),this.localStore=this.createLocalStore(e),this.gcScheduler=this.createGarbageCollectionScheduler(e,this.localStore),this.indexBackfillerScheduler=this.createIndexBackfillerScheduler(e,this.localStore)}createGarbageCollectionScheduler(e,t){return null}createIndexBackfillerScheduler(e,t){return null}createLocalStore(e){return Vy(this.persistence,new yc,e.initialUser,this.serializer)}createPersistence(e){return new fc(mc.Hr,this.serializer)}createSharedClientState(e){return new wc}async terminate(){var e,t;(e=this.gcScheduler)===null||e===void 0||e.stop(),(t=this.indexBackfillerScheduler)===null||t===void 0||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}};var _s=class{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Id(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=dv.bind(null,this.syncEngine),await Zy(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new kc}()}createDatastore(e){let t=Cs(e.databaseInfo.databaseId),r=function(o){return new Ac(o)}(e.databaseInfo);return function(o,a,u,h){return new Rc(o,a,u,h)}(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return function(r,i,o,a,u){return new Cc(r,i,o,a,u)}(this.localStore,this.datastore,e.asyncQueue,t=>Id(this.syncEngine,t,0),function(){return ls.D()?new ls:new Ec}())}createSyncEngine(e,t){return function(i,o,a,u,h,d,p){let y=new Mc(i,o,a,u,h,d);return p&&(y.La=!0),y}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e;await async function(r){let i=U(r);O("RemoteStore","RemoteStore shutting down."),i.M_.add(5),await Br(i),i.O_.shutdown(),i.N_.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate()}};var xr=class{constructor(e){this.observer=e,this.muted=!1}next(e){this.observer.next&&this.Ka(this.observer.next,e)}error(e){this.observer.error?this.Ka(this.observer.error,e):it("Uncaught Error in snapshot listener:",e.toString())}$a(){this.muted=!0}Ka(e,t){this.muted||setTimeout(()=>{this.muted||e(t)},0)}};var Uc=class{constructor(e){this.datastore=e,this.readVersions=new Map,this.mutations=[],this.committed=!1,this.lastTransactionError=null,this.writtenDocs=new Set}async lookup(e){if(this.ensureCommitNotCalled(),this.mutations.length>0)throw this.lastTransactionError=new N(S.INVALID_ARGUMENT,"Firestore transactions require all reads to be executed before all writes."),this.lastTransactionError;let t=await async function(i,o){let a=U(i),u={documents:o.map(y=>as(a.serializer,y))},h=await a.xo("BatchGetDocuments",a.serializer.databaseId,Y.emptyPath(),u,o.length),d=new Map;h.forEach(y=>{let T=Ty(a.serializer,y);d.set(T.key.toString(),T)});let p=[];return o.forEach(y=>{let T=d.get(y.toString());W(!!T),p.push(T)}),p}(this.datastore,e);return t.forEach(r=>this.recordVersion(r)),t}set(e,t){this.write(t.toMutation(e,this.precondition(e))),this.writtenDocs.add(e.toString())}update(e,t){try{this.write(t.toMutation(e,this.preconditionForUpdate(e)))}catch(r){this.lastTransactionError=r}this.writtenDocs.add(e.toString())}delete(e){this.write(new bn(e,this.precondition(e))),this.writtenDocs.add(e.toString())}async commit(){if(this.ensureCommitNotCalled(),this.lastTransactionError)throw this.lastTransactionError;let e=this.readVersions;this.mutations.forEach(t=>{e.delete(t.key.toString())}),e.forEach((t,r)=>{let i=L.fromPath(r);this.mutations.push(new ts(i,this.precondition(i)))}),await async function(r,i){let o=U(r),a={writes:i.map(u=>rf(o.serializer,u))};await o.Co("Commit",o.serializer.databaseId,Y.emptyPath(),a)}(this.datastore,this.mutations),this.committed=!0}recordVersion(e){let t;if(e.isFoundDocument())t=e.version;else{if(!e.isNoDocument())throw M();t=F.min()}let r=this.readVersions.get(e.key.toString());if(r){if(!t.isEqual(r))throw new N(S.ABORTED,"Document version changed between two reads.")}else this.readVersions.set(e.key.toString(),t)}precondition(e){let t=this.readVersions.get(e.toString());return!this.writtenDocs.has(e.toString())&&t?t.isEqual(F.min())?Te.exists(!1):Te.updateTime(t):Te.none()}preconditionForUpdate(e){let t=this.readVersions.get(e.toString());if(!this.writtenDocs.has(e.toString())&&t){if(t.isEqual(F.min()))throw new N(S.INVALID_ARGUMENT,"Can't update a document that doesn't exist.");return Te.updateTime(t)}return Te.exists(!0)}write(e){this.ensureCommitNotCalled(),this.mutations.push(e)}ensureCommitNotCalled(){}};var qc=class{constructor(e,t,r,i,o){this.asyncQueue=e,this.datastore=t,this.options=r,this.updateFunction=i,this.deferred=o,this.Za=r.maxAttempts,this.Yo=new Nr(this.asyncQueue,"transaction_retry")}Xa(){this.Za-=1,this.eu()}eu(){this.Yo.$o(async()=>{let e=new Uc(this.datastore),t=this.tu(e);t&&t.then(r=>{this.asyncQueue.enqueueAndForget(()=>e.commit().then(()=>{this.deferred.resolve(r)}).catch(i=>{this.nu(i)}))}).catch(r=>{this.nu(r)})})}tu(e){try{let t=this.updateFunction(e);return!qr(t)&&t.catch&&t.then?t:(this.deferred.reject(Error("Transaction callback must return a Promise")),null)}catch(t){return this.deferred.reject(t),null}}nu(e){this.Za>0&&this.ru(e)?(this.Za-=1,this.asyncQueue.enqueueAndForget(()=>(this.eu(),Promise.resolve()))):this.deferred.reject(e)}ru(e){if(e.name==="FirebaseError"){let t=e.code;return t==="aborted"||t==="failed-precondition"||t==="already-exists"||!Yd(t)}return!1}};var Bc=class{constructor(e,t,r,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this.databaseInfo=i,this.user=_e.UNAUTHENTICATED,this.clientId=Qi.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this.authCredentials.start(r,async o=>{O("FirestoreClient","Received user=",o.uid),await this.authCredentialListener(o),this.user=o}),this.appCheckCredentials.start(r,o=>(O("FirestoreClient","Received new app check token=",o),this.appCheckCredentialListener(o,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}verifyNotTerminated(){if(this.asyncQueue.isShuttingDown)throw new N(S.FAILED_PRECONDITION,"The client has already been terminated.")}terminate(){this.asyncQueue.enterRestrictedMode();let e=new Oe;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){let r=du(t,"Failed to shutdown persistence");e.reject(r)}}),e.promise}};async function ya(n,e){n.asyncQueue.verifyOperationInProgress(),O("FirestoreClient","Initializing OfflineComponentProvider");let t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener(async i=>{r.isEqual(i)||(await cf(e.localStore,i),r=i)}),e.persistence.setDatabaseDeletedListener(()=>n.terminate()),n._offlineComponents=e}async function Ed(n,e){n.asyncQueue.verifyOperationInProgress();let t=await gv(n);O("FirestoreClient","Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener(r=>yd(e.remoteStore,r)),n.setAppCheckTokenChangeListener((r,i)=>yd(e.remoteStore,i)),n._onlineComponents=e}function mv(n){return n.name==="FirebaseError"?n.code===S.FAILED_PRECONDITION||n.code===S.UNIMPLEMENTED:!(typeof DOMException!="undefined"&&n instanceof DOMException)||n.code===22||n.code===20||n.code===11}async function gv(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){O("FirestoreClient","Using user provided OfflineComponentProvider");try{await ya(n,n._uninitializedComponentsProvider._offline)}catch(e){let t=e;if(!mv(t))throw t;Er("Error using user provided cache. Falling back to memory cache: "+t),await ya(n,new Or)}}else O("FirestoreClient","Using default OfflineComponentProvider"),await ya(n,new Or);return n._offlineComponents}async function _u(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(O("FirestoreClient","Using user provided OnlineComponentProvider"),await Ed(n,n._uninitializedComponentsProvider._online)):(O("FirestoreClient","Using default OnlineComponentProvider"),await Ed(n,new _s))),n._onlineComponents}function _v(n){return _u(n).then(e=>e.syncEngine)}function yv(n){return _u(n).then(e=>e.datastore)}async function ys(n){let e=await _u(n),t=e.eventManager;return t.onListen=nv.bind(null,e.syncEngine),t.onUnlisten=sv.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=rv.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=ov.bind(null,e.syncEngine),t}function vv(n,e,t={}){let r=new Oe;return n.asyncQueue.enqueueAndForget(async()=>function(o,a,u,h,d){let p=new xr({next:T=>{a.enqueueAndForget(()=>pu(o,y));let R=T.docs.has(u);!R&&T.fromCache?d.reject(new N(S.UNAVAILABLE,"Failed to get document because the client is offline.")):R&&T.fromCache&&h&&h.source==="server"?d.reject(new N(S.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):d.resolve(T)},error:T=>d.reject(T)}),y=new kr(Ss(u.path),p,{includeMetadataChanges:!0,ra:!0});return fu(o,y)}(await ys(n),n.asyncQueue,e,t,r)),r.promise}function Iv(n,e,t={}){let r=new Oe;return n.asyncQueue.enqueueAndForget(async()=>function(o,a,u,h,d){let p=new xr({next:T=>{a.enqueueAndForget(()=>pu(o,y)),T.fromCache&&h.source==="server"?d.reject(new N(S.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):d.resolve(T)},error:T=>d.reject(T)}),y=new kr(u,p,{includeMetadataChanges:!0,ra:!0});return fu(o,y)}(await ys(n),n.asyncQueue,e,t,r)),r.promise}function Ef(n){let e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}var Td=new Map;function yu(n,e,t){if(!t)throw new N(S.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function wv(n,e,t,r){if(e===!0&&r===!0)throw new N(S.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function Ad(n){if(!L.isDocumentKey(n))throw new N(S.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function bd(n){if(L.isDocumentKey(n))throw new N(S.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function ks(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{let e=function(r){return r.constructor?r.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":M()}function xe(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new N(S.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{let t=ks(n);throw new N(S.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}var vs=class{constructor(e){var t,r;if(e.host===void 0){if(e.ssl!==void 0)throw new N(S.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(t=e.ssl)===null||t===void 0||t;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new N(S.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}wv("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Ef((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(o){if(o.timeoutSeconds!==void 0){if(isNaN(o.timeoutSeconds))throw new N(S.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (must not be NaN)`);if(o.timeoutSeconds<5)throw new N(S.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (minimum allowed value is 5)`);if(o.timeoutSeconds>30)throw new N(S.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,i){return r.timeoutSeconds===i.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}},Rn=class{constructor(e,t,r,i){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new vs({}),this._settingsFrozen=!1}get app(){if(!this._app)throw new N(S.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!==void 0}_setSettings(e){if(this._settingsFrozen)throw new N(S.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new vs(e),e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new Ia;switch(r.type){case"firstParty":return new Ta(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new N(S.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask||(this._terminateTask=this._terminate()),this._terminateTask}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){let r=Td.get(t);r&&(O("ComponentProvider","Removing Datastore"),Td.delete(t),r.terminate())}(this),Promise.resolve()}};var Rt=class n{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new n(this.firestore,e,this._query)}},ve=class n{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Et(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new n(this.firestore,e,this._key)}},Et=class n extends Rt{constructor(e,t,r){super(e,t,Ss(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){let e=this._path.popLast();return e.isEmpty()?null:new ve(this.firestore,null,new L(e))}withConverter(e){return new n(this.firestore,e,this._path)}};function Tf(n,e,...t){if(n=ee(n),yu("collection","path",e),n instanceof Rn){let r=Y.fromString(e,...t);return bd(r),new Et(n,null,r)}{if(!(n instanceof ve||n instanceof Et))throw new N(S.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");let r=n._path.child(Y.fromString(e,...t));return bd(r),new Et(n.firestore,null,r)}}function Af(n,e){if(n=xe(n,Rn),yu("collectionGroup","collection id",e),e.indexOf("/")>=0)throw new N(S.INVALID_ARGUMENT,`Invalid collection ID '${e}' passed to function collectionGroup(). Collection IDs must not contain '/'.`);return new Rt(n,null,function(r){return new At(Y.emptyPath(),r)}(e))}function bf(n,e,...t){if(n=ee(n),arguments.length===1&&(e=Qi.newId()),yu("doc","path",e),n instanceof Rn){let r=Y.fromString(e,...t);return Ad(r),new ve(n,null,new L(r))}{if(!(n instanceof ve||n instanceof Et))throw new N(S.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");let r=n._path.child(Y.fromString(e,...t));return Ad(r),new ve(n.firestore,n instanceof Et?n.converter:null,new L(r))}}var jc=class{constructor(){this.iu=Promise.resolve(),this.su=[],this.ou=!1,this._u=[],this.au=null,this.uu=!1,this.cu=!1,this.lu=[],this.Yo=new Nr(this,"async_queue_retry"),this.hu=()=>{let t=_a();t&&O("AsyncQueue","Visibility state changed to "+t.visibilityState),this.Yo.Wo()};let e=_a();e&&typeof e.addEventListener=="function"&&e.addEventListener("visibilitychange",this.hu)}get isShuttingDown(){return this.ou}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Pu(),this.Iu(e)}enterRestrictedMode(e){if(!this.ou){this.ou=!0,this.cu=e||!1;let t=_a();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.hu)}}enqueue(e){if(this.Pu(),this.ou)return new Promise(()=>{});let t=new Oe;return this.Iu(()=>this.ou&&this.cu?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.su.push(e),this.Tu()))}async Tu(){if(this.su.length!==0){try{await this.su[0](),this.su.shift(),this.Yo.reset()}catch(e){if(!Ur(e))throw e;O("AsyncQueue","Operation failed with retryable error: "+e)}this.su.length>0&&this.Yo.$o(()=>this.Tu())}}Iu(e){let t=this.iu.then(()=>(this.uu=!0,e().catch(r=>{this.au=r,this.uu=!1;let i=function(a){let u=a.message||"";return a.stack&&(u=a.stack.includes(a.message)?a.stack:a.message+`
`+a.stack),u}(r);throw it("INTERNAL UNHANDLED ERROR: ",i),r}).then(r=>(this.uu=!1,r))));return this.iu=t,t}enqueueAfterDelay(e,t,r){this.Pu(),this.lu.indexOf(e)>-1&&(t=0);let i=Dc.createAndSchedule(this,e,t,r,o=>this.Eu(o));return this._u.push(i),i}Pu(){this.au&&M()}verifyOperationInProgress(){}async du(){let e;do e=this.iu,await e;while(e!==this.iu)}Au(e){for(let t of this._u)if(t.timerId===e)return!0;return!1}Ru(e){return this.du().then(()=>{this._u.sort((t,r)=>t.targetTimeMs-r.targetTimeMs);for(let t of this._u)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.du()})}Vu(e){this.lu.push(e)}Eu(e){let t=this._u.indexOf(e);this._u.splice(t,1)}};function Sd(n){return function(t,r){if(typeof t!="object"||t===null)return!1;let i=t;for(let o of r)if(o in i&&typeof i[o]=="function")return!0;return!1}(n,["next","error","complete"])}var Qe=class extends Rn{constructor(e,t,r,i){super(e,t,r,i),this.type="firestore",this._queue=function(){return new jc}(),this._persistenceKey=(i==null?void 0:i.name)||"[DEFAULT]"}_terminate(){return this._firestoreClient||Rf(this),this._firestoreClient.terminate()}};function Sf(n,e,t){t||(t="(default)");let r=tr(n,"firestore");if(r.isInitialized(t)){let i=r.getImmediate({identifier:t}),o=r.getOptions(t);if(ht(o,e))return i;throw new N(S.FAILED_PRECONDITION,"initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.")}if(e.cacheSizeBytes!==void 0&&e.localCache!==void 0)throw new N(S.INVALID_ARGUMENT,"cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");if(e.cacheSizeBytes!==void 0&&e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new N(S.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");return r.initialize({options:e,instanceIdentifier:t})}function xn(n){return n._firestoreClient||Rf(n),n._firestoreClient.verifyNotTerminated(),n._firestoreClient}function Rf(n){var e,t,r;let i=n._freezeSettings(),o=function(u,h,d,p){return new Pa(u,h,d,p.host,p.ssl,p.experimentalForceLongPolling,p.experimentalAutoDetectLongPolling,Ef(p.experimentalLongPollingOptions),p.useFetchStreams)}(n._databaseId,((e=n._app)===null||e===void 0?void 0:e.options.appId)||"",n._persistenceKey,i);n._firestoreClient=new Bc(n._authCredentials,n._appCheckCredentials,n._queue,o),!((t=i.localCache)===null||t===void 0)&&t._offlineComponentProvider&&(!((r=i.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(n._firestoreClient._uninitializedComponentsProvider={_offlineKind:i.localCache.kind,_offline:i.localCache._offlineComponentProvider,_online:i.localCache._onlineComponentProvider})}var Pn=class n{constructor(e){this._byteString=e}static fromBase64String(e){try{return new n(Ae.fromBase64String(e))}catch(t){throw new N(S.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new n(Ae.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}};var Qt=class{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new N(S.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Pe(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}};var Cn=class{constructor(e){this._methodName=e}};var Vr=class{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new N(S.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new N(S.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return H(this._lat,e._lat)||H(this._long,e._long)}};var Ev=/^__.*__$/,zc=class{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new We(e,this.data,this.fieldMask,t,this.fieldTransforms):new Wt(e,this.data,t,this.fieldTransforms)}},Is=class{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new We(e,this.data,this.fieldMask,t,this.fieldTransforms)}};function Pf(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw M()}}var Gc=class n{constructor(e,t,r,i,o,a){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=i,o===void 0&&this.mu(),this.fieldTransforms=o||[],this.fieldMask=a||[]}get path(){return this.settings.path}get fu(){return this.settings.fu}gu(e){return new n(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}pu(e){var t;let r=(t=this.path)===null||t===void 0?void 0:t.child(e),i=this.gu({path:r,yu:!1});return i.wu(e),i}Su(e){var t;let r=(t=this.path)===null||t===void 0?void 0:t.child(e),i=this.gu({path:r,yu:!1});return i.mu(),i}bu(e){return this.gu({path:void 0,yu:!0})}Du(e){return Es(e,this.settings.methodName,this.settings.Cu||!1,this.path,this.settings.vu)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}mu(){if(this.path)for(let e=0;e<this.path.length;e++)this.wu(this.path.get(e))}wu(e){if(e.length===0)throw this.Du("Document fields must not be empty");if(Pf(this.fu)&&Ev.test(e))throw this.Du('Document fields cannot begin and end with "__"')}},Kc=class{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||Cs(e)}Fu(e,t,r,i=!1){return new Gc({fu:e,methodName:t,vu:r,path:Pe.emptyPath(),yu:!1,Cu:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}};function Os(n){let e=n._freezeSettings(),t=Cs(n._databaseId);return new Kc(n._databaseId,!!e.ignoreUndefinedProperties,t)}function vu(n,e,t,r,i,o={}){let a=n.Fu(o.merge||o.mergeFields?2:0,e,t,i);Iu("Data must be an object, but it was:",a,r);let u=Nf(r,a),h,d;if(o.merge)h=new ke(a.fieldMask),d=a.fieldTransforms;else if(o.mergeFields){let p=[];for(let y of o.mergeFields){let T=Hc(e,y,t);if(!a.contains(T))throw new N(S.INVALID_ARGUMENT,`Field '${T}' is specified in your field mask but missing from your input data.`);Of(p,T)||p.push(T)}h=new ke(p),d=a.fieldTransforms.filter(y=>h.covers(y.field))}else h=null,d=a.fieldTransforms;return new zc(new be(u),h,d)}var ws=class n extends Cn{_toFieldTransform(e){if(e.fu!==2)throw e.fu===1?e.Du(`${this._methodName}() can only appear at the top level of your update data`):e.Du(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof n}};var $c=class n extends Cn{_toFieldTransform(e){return new za(e.path,new Kt)}isEqual(e){return e instanceof n}};function Cf(n,e,t,r){let i=n.Fu(1,e,t);Iu("Data must be an object, but it was:",i,r);let o=[],a=be.empty();Jt(r,(h,d)=>{let p=wu(e,h,t);d=ee(d);let y=i.Su(p);if(d instanceof ws)o.push(p);else{let T=zr(d,y);T!=null&&(o.push(p),a.set(p,T))}});let u=new ke(o);return new Is(a,u,i.fieldTransforms)}function Df(n,e,t,r,i,o){let a=n.Fu(1,e,t),u=[Hc(e,r,t)],h=[i];if(o.length%2!=0)throw new N(S.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let T=0;T<o.length;T+=2)u.push(Hc(e,o[T])),h.push(o[T+1]);let d=[],p=be.empty();for(let T=u.length-1;T>=0;--T)if(!Of(d,u[T])){let R=u[T],k=h[T];k=ee(k);let x=a.Su(R);if(k instanceof ws)d.push(R);else{let D=zr(k,x);D!=null&&(d.push(R),p.set(R,D))}}let y=new ke(d);return new Is(p,y,a.fieldTransforms)}function Tv(n,e,t,r=!1){return zr(t,n.Fu(r?4:3,e))}function zr(n,e){if(kf(n=ee(n)))return Iu("Unsupported field value:",e,n),Nf(n,e);if(n instanceof Cn)return function(r,i){if(!Pf(i.fu))throw i.Du(`${r._methodName}() can only be used with update() and set()`);if(!i.path)throw i.Du(`${r._methodName}() is not currently supported inside arrays`);let o=r._toFieldTransform(i);o&&i.fieldTransforms.push(o)}(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.yu&&e.fu!==4)throw e.Du("Nested arrays are not supported");return function(r,i){let o=[],a=0;for(let u of r){let h=zr(u,i.bu(a));h==null&&(h={nullValue:"NULL_VALUE"}),o.push(h),a++}return{arrayValue:{values:o}}}(n,e)}return function(r,i){if((r=ee(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return ly(i.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){let o=ue.fromDate(r);return{timestampValue:os(i.serializer,o)}}if(r instanceof ue){let o=new ue(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:os(i.serializer,o)}}if(r instanceof Vr)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof Pn)return{bytesValue:Zd(i.serializer,r._byteString)};if(r instanceof ve){let o=i.databaseId,a=r.firestore._databaseId;if(!a.isEqual(o))throw i.Du(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${o.projectId}/${o.database}`);return{referenceValue:au(r.firestore._databaseId||i.databaseId,r._key.path)}}throw i.Du(`Unsupported field value: ${ks(r)}`)}(n,e)}function Nf(n,e){let t={};return Cd(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Jt(n,(r,i)=>{let o=zr(i,e.pu(r));o!=null&&(t[r]=o)}),{mapValue:{fields:t}}}function kf(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof ue||n instanceof Vr||n instanceof Pn||n instanceof ve||n instanceof Cn)}function Iu(n,e,t){if(!kf(t)||!function(i){return typeof i=="object"&&i!==null&&(Object.getPrototypeOf(i)===Object.prototype||Object.getPrototypeOf(i)===null)}(t)){let r=ks(t);throw r==="an object"?e.Du(n+" a custom object"):e.Du(n+" "+r)}}function Hc(n,e,t){if((e=ee(e))instanceof Qt)return e._internalPath;if(typeof e=="string")return wu(n,e);throw Es("Field path arguments must be of type string or ",n,!1,void 0,t)}var Av=new RegExp("[~\\*/\\[\\]]");function wu(n,e,t){if(e.search(Av)>=0)throw Es(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new Qt(...e.split("."))._internalPath}catch{throw Es(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function Es(n,e,t,r,i){let o=r&&!r.isEmpty(),a=i!==void 0,u=`Function ${e}() called with invalid data`;t&&(u+=" (via `toFirestore()`)"),u+=". ";let h="";return(o||a)&&(h+=" (found",o&&(h+=` in field ${r}`),a&&(h+=` in document ${i}`),h+=")"),new N(S.INVALID_ARGUMENT,u+n+h)}function Of(n,e){return n.some(t=>t.isEqual(e))}var Dn=class{constructor(e,t,r,i,o){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=i,this._converter=o}get id(){return this._key.path.lastSegment()}get ref(){return new ve(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){let e=new Wc(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){let t=this._document.data.field(Eu("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}},Wc=class extends Dn{data(){return super.data()}};function Eu(n,e){return typeof e=="string"?wu(n,e):e instanceof Qt?e._internalPath:e._delegate._internalPath}function xf(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new N(S.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}var Lr=class{},Qc=class extends Lr{};function Vf(n,e,...t){let r=[];e instanceof Lr&&r.push(e),r=r.concat(t),function(o){let a=o.filter(h=>h instanceof Jc).length,u=o.filter(h=>h instanceof Ts).length;if(a>1||a>0&&u>0)throw new N(S.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(let i of r)n=i._apply(n);return n}var Ts=class n extends Qc{constructor(e,t,r){super(),this._field=e,this._op=t,this._value=r,this.type="where"}static _create(e,t,r){return new n(e,t,r)}_apply(e){let t=this._parse(e);return Mf(e._query,t),new Rt(e.firestore,e.converter,Ba(e._query,t))}_parse(e){let t=Os(e.firestore);return function(o,a,u,h,d,p,y){let T;if(d.isKeyField()){if(p==="array-contains"||p==="array-contains-any")throw new N(S.INVALID_ARGUMENT,`Invalid Query. You can't perform '${p}' queries on documentId().`);if(p==="in"||p==="not-in"){Pd(y,p);let R=[];for(let k of y)R.push(Rd(h,o,k));T={arrayValue:{values:R}}}else T=Rd(h,o,y)}else p!=="in"&&p!=="not-in"&&p!=="array-contains-any"||Pd(y,p),T=Tv(u,a,y,p==="in"||p==="not-in");return oe.create(d,p,T)}(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}};function Lf(n,e,t){let r=e,i=Eu("where",n);return Ts._create(i,r,t)}var Jc=class n extends Lr{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new n(e,t)}_parse(e){let t=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return t.length===1?t[0]:Ue.create(t,this._getOperator())}_apply(e){let t=this._parse(e);return t.getFilters().length===0?e:(function(i,o){let a=i,u=o.getFlattenedFilters();for(let h of u)Mf(a,h),a=Ba(a,h)}(e._query,t),new Rt(e.firestore,e.converter,Ba(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}};function Rd(n,e,t){if(typeof(t=ee(t))=="string"){if(t==="")throw new N(S.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Md(e)&&t.indexOf("/")!==-1)throw new N(S.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);let r=e.path.child(Y.fromString(t));if(!L.isDocumentKey(r))throw new N(S.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return ed(n,new L(r))}if(t instanceof ve)return ed(n,t._key);throw new N(S.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${ks(t)}.`)}function Pd(n,e){if(!Array.isArray(n)||n.length===0)throw new N(S.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function Mf(n,e){let t=function(i,o){for(let a of i)for(let u of a.getFlattenedFilters())if(o.indexOf(u.op)>=0)return u.op;return null}(n.filters,function(i){switch(i){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(t!==null)throw t===e.op?new N(S.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new N(S.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}var As=class{convertValue(e,t="none"){switch(Gt(e)){case 0:return null;case 1:return e.booleanValue;case 2:return ne(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(Tt(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 10:return this.convertObject(e.mapValue,t);default:throw M()}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){let r={};return Jt(e,(i,o)=>{r[i]=this.convertValue(o,t)}),r}convertGeoPoint(e){return new Vr(ne(e.latitude),ne(e.longitude))}convertArray(e,t){return(e.values||[]).map(r=>this.convertValue(r,t))}convertServerTimestamp(e,t){switch(t){case"previous":let r=ru(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(br(e));default:return null}}convertTimestamp(e){let t=st(e);return new ue(t.seconds,t.nanos)}convertDocumentKey(e,t){let r=Y.fromString(e);W(af(r));let i=new Zi(r.get(1),r.get(3)),o=new L(r.popFirst(5));return i.isEqual(t)||it(`Document ${o} contains a document reference within a different database (${i.projectId}/${i.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),o}};function Tu(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}var Yc=class extends As{constructor(e){super(),this.firestore=e}convertBytes(e){return new Pn(e)}convertReference(e){let t=this.convertDocumentKey(e,this.firestore._databaseId);return new ve(this.firestore,null,t)}};var wt=class{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}},Mr=class extends Dn{constructor(e,t,r,i,o,a){super(e,t,r,i,a),this._firestore=e,this._firestoreImpl=e,this.metadata=o}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){let t=new gn(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){let r=this._document.data.field(Eu("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}},gn=class extends Mr{data(e={}){return super.data(e)}},bs=class{constructor(e,t,r,i){this._firestore=e,this._userDataWriter=t,this._snapshot=i,this.metadata=new wt(i.hasPendingWrites,i.fromCache),this.query=r}get docs(){let e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(r=>{e.call(t,new gn(this._firestore,this._userDataWriter,r.key,r,new wt(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){let t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new N(S.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(i,o){if(i._snapshot.oldDocs.isEmpty()){let a=0;return i._snapshot.docChanges.map(u=>{let h=new gn(i._firestore,i._userDataWriter,u.doc.key,u.doc,new wt(i._snapshot.mutatedKeys.has(u.doc.key),i._snapshot.fromCache),i.query.converter);return u.doc,{type:"added",doc:h,oldIndex:-1,newIndex:a++}})}{let a=i._snapshot.oldDocs;return i._snapshot.docChanges.filter(u=>o||u.type!==3).map(u=>{let h=new gn(i._firestore,i._userDataWriter,u.doc.key,u.doc,new wt(i._snapshot.mutatedKeys.has(u.doc.key),i._snapshot.fromCache),i.query.converter),d=-1,p=-1;return u.type!==0&&(d=a.indexOf(u.doc.key),a=a.delete(u.doc.key)),u.type!==1&&(a=a.add(u.doc),p=a.indexOf(u.doc.key)),{type:bv(u.type),doc:h,oldIndex:d,newIndex:p}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}};function bv(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return M()}}function Ff(n){n=xe(n,ve);let e=xe(n.firestore,Qe);return vv(xn(e),n._key).then(t=>zf(e,n,t))}var Nn=class extends As{constructor(e){super(),this.firestore=e}convertBytes(e){return new Pn(e)}convertReference(e){let t=this.convertDocumentKey(e,this.firestore._databaseId);return new ve(this.firestore,null,t)}};function Uf(n){n=xe(n,Rt);let e=xe(n.firestore,Qe),t=xn(e),r=new Nn(e);return xf(n._query),Iv(t,n._query).then(i=>new bs(e,r,n,i))}function qf(n,e,t){n=xe(n,ve);let r=xe(n.firestore,Qe),i=Tu(n.converter,e,t);return jf(r,[vu(Os(r),"setDoc",n._key,i,n.converter!==null,t).toMutation(n._key,Te.none())])}function Bf(n,...e){var t,r,i;n=ee(n);let o={includeMetadataChanges:!1,source:"default"},a=0;typeof e[a]!="object"||Sd(e[a])||(o=e[a],a++);let u={includeMetadataChanges:o.includeMetadataChanges,source:o.source};if(Sd(e[a])){let y=e[a];e[a]=(t=y.next)===null||t===void 0?void 0:t.bind(y),e[a+1]=(r=y.error)===null||r===void 0?void 0:r.bind(y),e[a+2]=(i=y.complete)===null||i===void 0?void 0:i.bind(y)}let h,d,p;if(n instanceof ve)d=xe(n.firestore,Qe),p=Ss(n._key.path),h={next:y=>{e[a]&&e[a](zf(d,n,y))},error:e[a+1],complete:e[a+2]};else{let y=xe(n,Rt);d=xe(y.firestore,Qe),p=y._query;let T=new Nn(d);h={next:R=>{e[a]&&e[a](new bs(d,T,y,R))},error:e[a+1],complete:e[a+2]},xf(n._query)}return function(T,R,k,x){let D=new xr(x),q=new kr(R,D,k);return T.asyncQueue.enqueueAndForget(async()=>fu(await ys(T),q)),()=>{D.$a(),T.asyncQueue.enqueueAndForget(async()=>pu(await ys(T),q))}}(xn(d),p,u,h)}function jf(n,e){return function(r,i){let o=new Oe;return r.asyncQueue.enqueueAndForget(async()=>av(await _v(r),i,o)),o.promise}(xn(n),e)}function zf(n,e,t){let r=t.docs.get(e._key),i=new Nn(n);return new Mr(n,i,e._key,r,new wt(t.hasPendingWrites,t.fromCache),e.converter)}var Xc=class{constructor(e){this.kind="memory",this._onlineComponentProvider=new _s,e!=null&&e.garbageCollector?this._offlineComponentProvider=e.garbageCollector._offlineComponentProvider:this._offlineComponentProvider=new Or}toJSON(){return{kind:this.kind}}};function Gf(n){return new Xc(n)}var Sv={maxAttempts:5};var Zc=class{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=Os(e)}set(e,t,r){this._verifyNotCommitted();let i=It(e,this._firestore),o=Tu(i.converter,t,r),a=vu(this._dataReader,"WriteBatch.set",i._key,o,i.converter!==null,r);return this._mutations.push(a.toMutation(i._key,Te.none())),this}update(e,t,r,...i){this._verifyNotCommitted();let o=It(e,this._firestore),a;return a=typeof(t=ee(t))=="string"||t instanceof Qt?Df(this._dataReader,"WriteBatch.update",o._key,t,r,i):Cf(this._dataReader,"WriteBatch.update",o._key,t),this._mutations.push(a.toMutation(o._key,Te.exists(!0))),this}delete(e){this._verifyNotCommitted();let t=It(e,this._firestore);return this._mutations=this._mutations.concat(new bn(t._key,Te.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new N(S.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}};function It(n,e){if((n=ee(n)).firestore!==e)throw new N(S.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return n}var eu=class extends class{constructor(t,r){this._firestore=t,this._transaction=r,this._dataReader=Os(t)}get(t){let r=It(t,this._firestore),i=new Yc(this._firestore);return this._transaction.lookup([r._key]).then(o=>{if(!o||o.length!==1)return M();let a=o[0];if(a.isFoundDocument())return new Dn(this._firestore,i,a.key,a,r.converter);if(a.isNoDocument())return new Dn(this._firestore,i,r._key,null,r.converter);throw M()})}set(t,r,i){let o=It(t,this._firestore),a=Tu(o.converter,r,i),u=vu(this._dataReader,"Transaction.set",o._key,a,o.converter!==null,i);return this._transaction.set(o._key,u),this}update(t,r,i,...o){let a=It(t,this._firestore),u;return u=typeof(r=ee(r))=="string"||r instanceof Qt?Df(this._dataReader,"Transaction.update",a._key,r,i,o):Cf(this._dataReader,"Transaction.update",a._key,r),this._transaction.update(a._key,u),this}delete(t){let r=It(t,this._firestore);return this._transaction.delete(r._key),this}}{constructor(e,t){super(e,t),this._firestore=e}get(e){let t=It(e,this._firestore),r=new Nn(this._firestore);return super.get(e).then(i=>new Mr(this._firestore,r,t._key,i._document,new wt(!1,!1),t.converter))}};function Kf(n,e,t){n=xe(n,Qe);let r=Object.assign(Object.assign({},Sv),t);return function(o){if(o.maxAttempts<1)throw new N(S.INVALID_ARGUMENT,"Max attempts must be at least 1")}(r),function(o,a,u){let h=new Oe;return o.asyncQueue.enqueueAndForget(async()=>{let d=await yv(o);new qc(o.asyncQueue,d,u,a,h).Xa()}),h.promise}(xn(n),i=>e(new eu(n,i)),r)}function $f(){return new $c("serverTimestamp")}function Hf(n){return xn(n=xe(n,Qe)),new Zc(n,e=>jf(n,e))}(function(e,t=!0){(function(i){kn=i})(mt),pt(new Ne("firestore",(r,{instanceIdentifier:i,options:o})=>{let a=r.getProvider("app").getImmediate(),u=new Qe(new wa(r.getProvider("auth-internal")),new ba(r.getProvider("app-check-internal")),function(d,p){if(!Object.prototype.hasOwnProperty.apply(d.options,["projectId"]))throw new N(S.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Zi(d.options.projectId,p)}(a,i),a);return o=Object.assign({useFetchStreams:t},o),u._setSettings(o),u},"PUBLIC").setMultipleInstances(!0)),Le(Yh,"4.6.3",e),Le(Yh,"4.6.3","esm2017")})();window.PHFirebase={initializeApp:Po,getAuth:ca,onAuthStateChanged:ia,signInWithEmailAndPassword:na,createUserWithEmailAndPassword:ta,updateProfile:ra,signOut:sa,initializeFirestore:Sf,memoryLocalCache:Gf,doc:bf,collection:Tf,collectionGroup:Af,query:Vf,where:Lf,getDoc:Ff,getDocs:Uf,setDoc:qf,writeBatch:Hf,onSnapshot:Bf,runTransaction:Kf,serverTimestamp:$f,Timestamp:ue};})();
/*! Bundled license information:

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/util/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/component/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/logger/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/app/dist/esm/index.esm2017.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

firebase/app/dist/esm/index.esm.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/auth/dist/esm2017/index-454a0f5f.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/webchannel-wrapper/dist/bloom-blob/esm/bloom_blob_es2018.js:
  (** @license
  Copyright The Closure Library Authors.
  SPDX-License-Identifier: Apache-2.0
  *)
  (** @license
  
   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  *)

@firebase/webchannel-wrapper/dist/webchannel-blob/esm/webchannel_blob_es2018.js:
  (** @license
  Copyright The Closure Library Authors.
  SPDX-License-Identifier: Apache-2.0
  *)
  (** @license
  
   Copyright The Closure Library Authors.
   SPDX-License-Identifier: Apache-2.0
  *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
  * @license
  * Copyright 2020 Google LLC
  *
  * Licensed under the Apache License, Version 2.0 (the "License");
  * you may not use this file except in compliance with the License.
  * You may obtain a copy of the License at
  *
  *   http://www.apache.org/licenses/LICENSE-2.0
  *
  * Unless required by applicable law or agreed to in writing, software
  * distributed under the License is distributed on an "AS IS" BASIS,
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2018 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)

@firebase/firestore/dist/index.esm2017.js:
  (**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *)
*/
