
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty) {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return lets;
        }
        return $$scope.dirty;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(html, anchor = null) {
            this.e = element('div');
            this.a = anchor;
            this.u(html);
        }
        m(target, anchor = null) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(target, this.n[i], anchor);
            }
            this.t = target;
        }
        u(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        p(html) {
            this.d();
            this.u(html);
            this.m(this.t, this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let stylesheet;
    let active = 0;
    let current_rules = {};
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        if (!current_rules[name]) {
            if (!stylesheet) {
                const style = element('style');
                document.head.appendChild(style);
                stylesheet = style.sheet;
            }
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        node.style.animation = (node.style.animation || '')
            .split(', ')
            .filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        )
            .join(', ');
        if (name && !--active)
            clear_rules();
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            current_rules = {};
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            $$.fragment && $$.fragment.p($$.ctx, $$.dirty);
            $$.dirty = [-1];
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.16.4 */

    function create_fragment(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty[0] & /*$$scope*/ 32768) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[15], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let $routes;
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, value => $$invalidate(8, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false;
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(7, $location = value));

    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(6, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;
    		route._path = path;
    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ["basepath", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("$$scope" in $$props) $$invalidate(15, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {
    			basepath,
    			url,
    			hasActiveRoute,
    			$base,
    			$location,
    			$routes
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
    		if ("$base" in $$props) base.set($base = $$props.$base);
    		if ("$location" in $$props) location.set($location = $$props.$location);
    		if ("$routes" in $$props) routes.set($routes = $$props.$routes);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*$base*/ 64) {
    			 {
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$routes, $location*/ 384) {
    			 {
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		routes,
    		location,
    		base,
    		basepath,
    		url,
    		hasActiveRoute,
    		$base,
    		$location,
    		$routes,
    		locationContext,
    		routerContext,
    		activeRoute,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$$scope,
    		$$slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.16.4 */

    const get_default_slot_changes = dirty => ({
    	params: dirty[0] & /*routeParams*/ 2,
    	location: dirty[0] & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[1],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot && default_slot.p && dirty[0] & /*$$scope, routeParams, $location*/ 4114) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[12], get_default_slot_context), get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, get_default_slot_changes));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[1],
    		/*routeProps*/ ctx[2]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty[0] & /*$location, routeParams, routeProps*/ 22)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty[0] & /*$location*/ 16 && ({ location: /*$location*/ ctx[4] }),
    					dirty[0] & /*routeParams*/ 2 && get_spread_object(/*routeParams*/ ctx[1]),
    					dirty[0] & /*routeProps*/ 4 && get_spread_object(/*routeProps*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, value => $$invalidate(3, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));
    	const route = { path, default: path === "" };
    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(12, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {
    			path,
    			component,
    			routeParams,
    			routeProps,
    			$activeRoute,
    			$location
    		};
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), $$new_props));
    		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("routeParams" in $$props) $$invalidate(1, routeParams = $$new_props.routeParams);
    		if ("routeProps" in $$props) $$invalidate(2, routeProps = $$new_props.routeProps);
    		if ("$activeRoute" in $$props) activeRoute.set($activeRoute = $$new_props.$activeRoute);
    		if ("$location" in $$props) location.set($location = $$new_props.$location);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*$activeRoute*/ 8) {
    			 if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(1, routeParams = $activeRoute.params);
    			}
    		}

    		 {
    			const { path, component, ...rest } = $$props;
    			$$invalidate(2, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		registerRoute,
    		unregisterRoute,
    		$$props,
    		$$scope,
    		$$slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/utils.svelte generated by Svelte v3.16.4 */

    const paymentDate = "01/01/2020";

    function capitalize(s) {
    	if (typeof s !== "string") return "";
    	return s.charAt(0).toUpperCase() + s.slice(1);
    }

    function getCurrentMonth() {
    	const options = { month: "long", year: "numeric" };
    	return capitalize(new Date(paymentDate).toLocaleDateString("es-ES", options));
    }

    /* src/components/Payments/PaymentSummary.svelte generated by Svelte v3.16.4 */

    const file = "src/components/Payments/PaymentSummary.svelte";

    // (13:51) {:else}
    function create_else_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("con");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(13:51) {:else}",
    		ctx
    	});

    	return block;
    }

    // (13:6) {#if type === 'Efectivo' || type === 'BTC'}
    function create_if_block_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("en");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(13:6) {#if type === 'Efectivo' || type === 'BTC'}",
    		ctx
    	});

    	return block;
    }

    // (26:6) {#if type === 'BTC'}
    function create_if_block_4(ctx) {
    	let p;
    	let span0;
    	let t1;
    	let span1;
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			span0 = element("span");
    			span0.textContent = "Wallet:";
    			t1 = space();
    			span1 = element("span");
    			t2 = text(/*BTCWallet*/ ctx[4]);
    			attr_dev(span0, "class", "font-light");
    			add_location(span0, file, 27, 10, 1020);
    			attr_dev(span1, "class", "font-medium text-light-gray-us");
    			add_location(span1, file, 28, 10, 1070);
    			attr_dev(p, "class", "sm:mb-3 mb-4 text-summary-details text-lg");
    			add_location(p, file, 26, 8, 956);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, span0);
    			append_dev(p, t1);
    			append_dev(p, span1);
    			append_dev(span1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*BTCWallet*/ 16) set_data_dev(t2, /*BTCWallet*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(26:6) {#if type === 'BTC'}",
    		ctx
    	});

    	return block;
    }

    // (36:8) {:else}
    function create_else_block$1(ctx) {
    	let span;
    	let t0;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text("$");
    			t1 = text(/*amount*/ ctx[3]);
    			t2 = text(" ARS");
    			attr_dev(span, "class", "font-bold text-cyan-us");
    			add_location(span, file, 36, 10, 1376);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*amount*/ 8) set_data_dev(t1, /*amount*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(36:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (34:8) {#if type === 'BTC'}
    function create_if_block_3(ctx) {
    	let span;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(/*amount*/ ctx[3]);
    			t1 = text(" BTC");
    			attr_dev(span, "class", "font-bold text-cyan-us");
    			add_location(span, file, 34, 10, 1293);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*amount*/ 8) set_data_dev(t0, /*amount*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(34:8) {#if type === 'BTC'}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {#if type === 'Tarjeta de Crédito'}
    function create_if_block_2(ctx) {
    	let p;
    	let t;
    	let html_tag;
    	let raw_value = `<span class="font-medium">recargo del 8%.</span>` + "";

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text("*Los pagos con tarjeta de crédito tienen un\n      ");
    			html_tag = new HtmlTag(raw_value, null);
    			attr_dev(p, "class", "text-sm text-left -mt-8 mb-12 font-payment-summary");
    			add_location(p, file, 43, 4, 1522);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    			html_tag.m(p);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(43:2) {#if type === 'Tarjeta de Crédito'}",
    		ctx
    	});

    	return block;
    }

    // (55:84) 
    function create_if_block_1$1(ctx) {
    	let p;
    	let t;
    	let html_tag;
    	let raw_value = `<span class="font-semibold">MercadoPago</span>. 😁` + "";

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text("El pago se va a completar a través de\n      ");
    			html_tag = new HtmlTag(raw_value, null);
    			attr_dev(p, "class", "text-xl font-payment-summary");
    			add_location(p, file, 55, 4, 1993);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    			html_tag.m(p);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(55:84) ",
    		ctx
    	});

    	return block;
    }

    // (50:2) {#if type === 'Efectivo'}
    function create_if_block$1(ctx) {
    	let p;
    	let t;
    	let html_tag;
    	let raw_value = `<span class="font-semibold">la próxima clase</span>. 😁` + "";

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text("Podés realizar el pago en\n      ");
    			html_tag = new HtmlTag(raw_value, null);
    			attr_dev(p, "class", "text-xl font-payment-summary");
    			add_location(p, file, 50, 4, 1750);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    			html_tag.m(p);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(50:2) {#if type === 'Efectivo'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div2;
    	let div1;
    	let h1;
    	let t0;
    	let t1;
    	let span0;
    	let t2;
    	let t3;
    	let t4;
    	let div0;
    	let p0;
    	let span1;
    	let t6;
    	let span2;
    	let t7;
    	let t8;
    	let p1;
    	let span3;
    	let t10;
    	let span4;
    	let t11;
    	let p1_class_value;
    	let t12;
    	let t13;
    	let p2;
    	let span5;
    	let t15;
    	let t16;
    	let t17;
    	let show_if;

    	function select_block_type(ctx, dirty) {
    		if (/*type*/ ctx[0] === "Efectivo" || /*type*/ ctx[0] === "BTC") return create_if_block_5;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*type*/ ctx[0] === "BTC" && create_if_block_4(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*type*/ ctx[0] === "BTC") return create_if_block_3;
    		return create_else_block$1;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block2 = current_block_type_1(ctx);
    	let if_block3 = /*type*/ ctx[0] === "Tarjeta de Crédito" && create_if_block_2(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (/*type*/ ctx[0] === "Efectivo") return create_if_block$1;
    		if (show_if == null || dirty[0] & /*type*/ 1) show_if = !!["Tarjeta de Débito", "Tarjeta de Crédito", "Código QR"].includes(/*type*/ ctx[0]);
    		if (show_if) return create_if_block_1$1;
    	}

    	let current_block_type_2 = select_block_type_2(ctx, -1);
    	let if_block4 = current_block_type_2 && current_block_type_2(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			t0 = text("Pago\n      ");
    			if_block0.c();
    			t1 = space();
    			span0 = element("span");
    			t2 = text(/*type*/ ctx[0]);
    			t3 = text(".");
    			t4 = space();
    			div0 = element("div");
    			p0 = element("p");
    			span1 = element("span");
    			span1.textContent = "Curso:";
    			t6 = space();
    			span2 = element("span");
    			t7 = text(/*course*/ ctx[1]);
    			t8 = space();
    			p1 = element("p");
    			span3 = element("span");
    			span3.textContent = "Mes:";
    			t10 = space();
    			span4 = element("span");
    			t11 = text(/*currentMonth*/ ctx[2]);
    			t12 = space();
    			if (if_block1) if_block1.c();
    			t13 = space();
    			p2 = element("p");
    			span5 = element("span");
    			span5.textContent = "Total:";
    			t15 = space();
    			if_block2.c();
    			t16 = space();
    			if (if_block3) if_block3.c();
    			t17 = space();
    			if (if_block4) if_block4.c();
    			attr_dev(span0, "class", "font-semibold text-cyan-us");
    			add_location(span0, file, 13, 6, 391);
    			attr_dev(h1, "class", "leading-tight sm:mb-12 mb-24 sm:text-3xl text-4xl text-white-us font-raleway text-center sm:text-left");
    			add_location(h1, file, 10, 4, 192);
    			attr_dev(span1, "class", "font-light");
    			add_location(span1, file, 18, 8, 593);
    			attr_dev(span2, "class", "font-medium text-light-gray-us");
    			add_location(span2, file, 19, 8, 640);
    			attr_dev(p0, "class", "mb-1 text-summary-details text-lg");
    			add_location(p0, file, 17, 6, 539);
    			attr_dev(span3, "class", "font-light");
    			add_location(span3, file, 22, 8, 810);
    			attr_dev(span4, "class", "text-light-gray-us");
    			add_location(span4, file, 23, 8, 855);
    			attr_dev(p1, "class", p1_class_value = "" + ((/*type*/ ctx[0] === "BTC" ? "mb-1" : "sm:mb-3 mb-4") + " text-summary-details text-lg"));
    			add_location(p1, file, 21, 6, 718);
    			attr_dev(span5, "class", "font-normal");
    			add_location(span5, file, 32, 8, 1214);
    			attr_dev(p2, "class", "text-summary-details text-xl");
    			add_location(p2, file, 31, 6, 1165);
    			attr_dev(div0, "class", "shadow-md bg-blue-us border-1 border-blue-us rounded p-2");
    			add_location(div0, file, 16, 4, 462);
    			attr_dev(div1, "class", "mb-10");
    			add_location(div1, file, 9, 2, 168);
    			attr_dev(div2, "class", "sm:mb-12 mb-20");
    			add_location(div2, file, 8, 0, 137);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(h1, t0);
    			if_block0.m(h1, null);
    			append_dev(h1, t1);
    			append_dev(h1, span0);
    			append_dev(span0, t2);
    			append_dev(span0, t3);
    			append_dev(div1, t4);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(p0, span1);
    			append_dev(p0, t6);
    			append_dev(p0, span2);
    			append_dev(span2, t7);
    			append_dev(div0, t8);
    			append_dev(div0, p1);
    			append_dev(p1, span3);
    			append_dev(p1, t10);
    			append_dev(p1, span4);
    			append_dev(span4, t11);
    			append_dev(div0, t12);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div0, t13);
    			append_dev(div0, p2);
    			append_dev(p2, span5);
    			append_dev(p2, t15);
    			if_block2.m(p2, null);
    			append_dev(div2, t16);
    			if (if_block3) if_block3.m(div2, null);
    			append_dev(div2, t17);
    			if (if_block4) if_block4.m(div2, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(h1, t1);
    				}
    			}

    			if (dirty[0] & /*type*/ 1) set_data_dev(t2, /*type*/ ctx[0]);
    			if (dirty[0] & /*course*/ 2) set_data_dev(t7, /*course*/ ctx[1]);
    			if (dirty[0] & /*currentMonth*/ 4) set_data_dev(t11, /*currentMonth*/ ctx[2]);

    			if (dirty[0] & /*type*/ 1 && p1_class_value !== (p1_class_value = "" + ((/*type*/ ctx[0] === "BTC" ? "mb-1" : "sm:mb-3 mb-4") + " text-summary-details text-lg"))) {
    				attr_dev(p1, "class", p1_class_value);
    			}

    			if (/*type*/ ctx[0] === "BTC") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					if_block1.m(div0, t13);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type_1(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(p2, null);
    				}
    			}

    			if (/*type*/ ctx[0] === "Tarjeta de Crédito") {
    				if (!if_block3) {
    					if_block3 = create_if_block_2(ctx);
    					if_block3.c();
    					if_block3.m(div2, t17);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (current_block_type_2 !== (current_block_type_2 = select_block_type_2(ctx, dirty))) {
    				if (if_block4) if_block4.d(1);
    				if_block4 = current_block_type_2 && current_block_type_2(ctx);

    				if (if_block4) {
    					if_block4.c();
    					if_block4.m(div2, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    			if_block2.d();
    			if (if_block3) if_block3.d();

    			if (if_block4) {
    				if_block4.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { type } = $$props;
    	let { course } = $$props;
    	let { currentMonth } = $$props;
    	let { amount } = $$props;
    	let { BTCWallet = "" } = $$props;
    	const writable_props = ["type", "course", "currentMonth", "amount", "BTCWallet"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PaymentSummary> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("course" in $$props) $$invalidate(1, course = $$props.course);
    		if ("currentMonth" in $$props) $$invalidate(2, currentMonth = $$props.currentMonth);
    		if ("amount" in $$props) $$invalidate(3, amount = $$props.amount);
    		if ("BTCWallet" in $$props) $$invalidate(4, BTCWallet = $$props.BTCWallet);
    	};

    	$$self.$capture_state = () => {
    		return {
    			type,
    			course,
    			currentMonth,
    			amount,
    			BTCWallet
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("course" in $$props) $$invalidate(1, course = $$props.course);
    		if ("currentMonth" in $$props) $$invalidate(2, currentMonth = $$props.currentMonth);
    		if ("amount" in $$props) $$invalidate(3, amount = $$props.amount);
    		if ("BTCWallet" in $$props) $$invalidate(4, BTCWallet = $$props.BTCWallet);
    	};

    	return [type, course, currentMonth, amount, BTCWallet];
    }

    class PaymentSummary extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			type: 0,
    			course: 1,
    			currentMonth: 2,
    			amount: 3,
    			BTCWallet: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PaymentSummary",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*type*/ ctx[0] === undefined && !("type" in props)) {
    			console.warn("<PaymentSummary> was created without expected prop 'type'");
    		}

    		if (/*course*/ ctx[1] === undefined && !("course" in props)) {
    			console.warn("<PaymentSummary> was created without expected prop 'course'");
    		}

    		if (/*currentMonth*/ ctx[2] === undefined && !("currentMonth" in props)) {
    			console.warn("<PaymentSummary> was created without expected prop 'currentMonth'");
    		}

    		if (/*amount*/ ctx[3] === undefined && !("amount" in props)) {
    			console.warn("<PaymentSummary> was created without expected prop 'amount'");
    		}
    	}

    	get type() {
    		throw new Error("<PaymentSummary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<PaymentSummary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get course() {
    		throw new Error("<PaymentSummary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set course(value) {
    		throw new Error("<PaymentSummary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentMonth() {
    		throw new Error("<PaymentSummary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentMonth(value) {
    		throw new Error("<PaymentSummary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get amount() {
    		throw new Error("<PaymentSummary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set amount(value) {
    		throw new Error("<PaymentSummary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get BTCWallet() {
    		throw new Error("<PaymentSummary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set BTCWallet(value) {
    		throw new Error("<PaymentSummary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Buttons/GoBackButton.svelte generated by Svelte v3.16.4 */
    const file$1 = "src/components/Buttons/GoBackButton.svelte";

    function create_fragment$3(ctx) {
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Cancelar";
    			attr_dev(button, "class", "focus:outline-none focus:shadow-outline cancel-button text-center text-light-gray-us w-1/3 mr-2 rounded");
    			attr_dev(button, "type", "reset");
    			add_location(button, file$1, 4, 0, 65);
    			dispose = listen_dev(button, "click", /*click_handler*/ ctx[0], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self) {
    	const click_handler = () => navigate("/", { replace: true });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		
    	};

    	return [click_handler];
    }

    class GoBackButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GoBackButton",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/Buttons/PayButton.svelte generated by Svelte v3.16.4 */

    const file$2 = "src/components/Buttons/PayButton.svelte";

    function create_fragment$4(ctx) {
    	let form;
    	let button;
    	let t;

    	const block = {
    		c: function create() {
    			form = element("form");
    			button = element("button");
    			t = text(/*value*/ ctx[1]);
    			attr_dev(button, "class", "submit-button text-center w-full rounded focus:outline-none focus:shadow-outline shadow-md");
    			attr_dev(button, "type", "submit");
    			add_location(button, file$2, 6, 2, 93);
    			attr_dev(form, "class", "w-2/3");
    			attr_dev(form, "action", /*action*/ ctx[0]);
    			add_location(form, file$2, 5, 0, 61);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, button);
    			append_dev(button, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*value*/ 2) set_data_dev(t, /*value*/ ctx[1]);

    			if (dirty[0] & /*action*/ 1) {
    				attr_dev(form, "action", /*action*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { action } = $$props;
    	let { value } = $$props;
    	const writable_props = ["action", "value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PayButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("action" in $$props) $$invalidate(0, action = $$props.action);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    	};

    	$$self.$capture_state = () => {
    		return { action, value };
    	};

    	$$self.$inject_state = $$props => {
    		if ("action" in $$props) $$invalidate(0, action = $$props.action);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    	};

    	return [action, value];
    }

    class PayButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { action: 0, value: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PayButton",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*action*/ ctx[0] === undefined && !("action" in props)) {
    			console.warn("<PayButton> was created without expected prop 'action'");
    		}

    		if (/*value*/ ctx[1] === undefined && !("value" in props)) {
    			console.warn("<PayButton> was created without expected prop 'value'");
    		}
    	}

    	get action() {
    		throw new Error("<PayButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set action(value) {
    		throw new Error("<PayButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<PayButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<PayButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src/routes/Cash.svelte generated by Svelte v3.16.4 */
    const file$3 = "src/routes/Cash.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let div1;
    	let form;
    	let t0;
    	let div0;
    	let t1;
    	let main_intro;
    	let current;

    	const paymentsummary = new PaymentSummary({
    			props: {
    				type: /*type*/ ctx[0],
    				course: /*course*/ ctx[1],
    				currentMonth: /*currentMonth*/ ctx[2],
    				amount: /*amount*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const gobackbutton = new GoBackButton({ $$inline: true });

    	const paybutton = new PayButton({
    			props: {
    				action: "https://undefinedschool.io",
    				value: "¡Ok!"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			form = element("form");
    			create_component(paymentsummary.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			create_component(gobackbutton.$$.fragment);
    			t1 = space();
    			create_component(paybutton.$$.fragment);
    			attr_dev(div0, "class", "flex");
    			add_location(div0, file$3, 18, 6, 593);
    			add_location(form, file$3, 15, 4, 514);
    			attr_dev(div1, "class", "max-w-xl flex flex-col h-screen justify-center m-auto");
    			add_location(div1, file$3, 14, 2, 442);
    			attr_dev(main, "class", "p-5");
    			add_location(main, file$3, 13, 0, 413);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, form);
    			mount_component(paymentsummary, form, null);
    			append_dev(form, t0);
    			append_dev(form, div0);
    			mount_component(gobackbutton, div0, null);
    			append_dev(div0, t1);
    			mount_component(paybutton, div0, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paymentsummary_changes = {};
    			if (dirty[0] & /*type*/ 1) paymentsummary_changes.type = /*type*/ ctx[0];
    			if (dirty[0] & /*course*/ 2) paymentsummary_changes.course = /*course*/ ctx[1];
    			if (dirty[0] & /*currentMonth*/ 4) paymentsummary_changes.currentMonth = /*currentMonth*/ ctx[2];
    			if (dirty[0] & /*amount*/ 8) paymentsummary_changes.amount = /*amount*/ ctx[3];
    			paymentsummary.$set(paymentsummary_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paymentsummary.$$.fragment, local);
    			transition_in(gobackbutton.$$.fragment, local);
    			transition_in(paybutton.$$.fragment, local);

    			if (!main_intro) {
    				add_render_callback(() => {
    					main_intro = create_in_transition(main, fade, {});
    					main_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paymentsummary.$$.fragment, local);
    			transition_out(gobackbutton.$$.fragment, local);
    			transition_out(paybutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(paymentsummary);
    			destroy_component(gobackbutton);
    			destroy_component(paybutton);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { type } = $$props;
    	let { course } = $$props;
    	let { currentMonth } = $$props;
    	let { amount } = $$props;
    	const writable_props = ["type", "course", "currentMonth", "amount"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Cash> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("course" in $$props) $$invalidate(1, course = $$props.course);
    		if ("currentMonth" in $$props) $$invalidate(2, currentMonth = $$props.currentMonth);
    		if ("amount" in $$props) $$invalidate(3, amount = $$props.amount);
    	};

    	$$self.$capture_state = () => {
    		return { type, course, currentMonth, amount };
    	};

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("course" in $$props) $$invalidate(1, course = $$props.course);
    		if ("currentMonth" in $$props) $$invalidate(2, currentMonth = $$props.currentMonth);
    		if ("amount" in $$props) $$invalidate(3, amount = $$props.amount);
    	};

    	return [type, course, currentMonth, amount];
    }

    class Cash extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			type: 0,
    			course: 1,
    			currentMonth: 2,
    			amount: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cash",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*type*/ ctx[0] === undefined && !("type" in props)) {
    			console.warn("<Cash> was created without expected prop 'type'");
    		}

    		if (/*course*/ ctx[1] === undefined && !("course" in props)) {
    			console.warn("<Cash> was created without expected prop 'course'");
    		}

    		if (/*currentMonth*/ ctx[2] === undefined && !("currentMonth" in props)) {
    			console.warn("<Cash> was created without expected prop 'currentMonth'");
    		}

    		if (/*amount*/ ctx[3] === undefined && !("amount" in props)) {
    			console.warn("<Cash> was created without expected prop 'amount'");
    		}
    	}

    	get type() {
    		throw new Error("<Cash>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Cash>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get course() {
    		throw new Error("<Cash>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set course(value) {
    		throw new Error("<Cash>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentMonth() {
    		throw new Error("<Cash>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentMonth(value) {
    		throw new Error("<Cash>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get amount() {
    		throw new Error("<Cash>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set amount(value) {
    		throw new Error("<Cash>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/Card.svelte generated by Svelte v3.16.4 */
    const file$4 = "src/routes/Card.svelte";

    function create_fragment$6(ctx) {
    	let main;
    	let div1;
    	let form;
    	let t0;
    	let div0;
    	let t1;
    	let main_intro;
    	let current;

    	const paymentsummary = new PaymentSummary({
    			props: {
    				type: /*type*/ ctx[0],
    				course: /*course*/ ctx[1],
    				currentMonth: /*currentMonth*/ ctx[2],
    				amount: /*amount*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const gobackbutton = new GoBackButton({ $$inline: true });

    	const paybutton = new PayButton({
    			props: {
    				action: /*type*/ ctx[0] === "debitCard"
    				? debitCardLink
    				: creditCardLink,
    				value: "Ir a MercadoPago"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			form = element("form");
    			create_component(paymentsummary.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			create_component(gobackbutton.$$.fragment);
    			t1 = space();
    			create_component(paybutton.$$.fragment);
    			attr_dev(div0, "class", "flex");
    			add_location(div0, file$4, 23, 6, 871);
    			add_location(form, file$4, 20, 4, 792);
    			attr_dev(div1, "class", "max-w-xl flex flex-col h-screen justify-center m-auto");
    			add_location(div1, file$4, 19, 2, 720);
    			attr_dev(main, "class", "p-5");
    			add_location(main, file$4, 18, 0, 691);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, form);
    			mount_component(paymentsummary, form, null);
    			append_dev(form, t0);
    			append_dev(form, div0);
    			mount_component(gobackbutton, div0, null);
    			append_dev(div0, t1);
    			mount_component(paybutton, div0, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paymentsummary_changes = {};
    			if (dirty[0] & /*type*/ 1) paymentsummary_changes.type = /*type*/ ctx[0];
    			if (dirty[0] & /*course*/ 2) paymentsummary_changes.course = /*course*/ ctx[1];
    			if (dirty[0] & /*currentMonth*/ 4) paymentsummary_changes.currentMonth = /*currentMonth*/ ctx[2];
    			if (dirty[0] & /*amount*/ 8) paymentsummary_changes.amount = /*amount*/ ctx[3];
    			paymentsummary.$set(paymentsummary_changes);
    			const paybutton_changes = {};

    			if (dirty[0] & /*type*/ 1) paybutton_changes.action = /*type*/ ctx[0] === "debitCard"
    			? debitCardLink
    			: creditCardLink;

    			paybutton.$set(paybutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paymentsummary.$$.fragment, local);
    			transition_in(gobackbutton.$$.fragment, local);
    			transition_in(paybutton.$$.fragment, local);

    			if (!main_intro) {
    				add_render_callback(() => {
    					main_intro = create_in_transition(main, fade, {});
    					main_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paymentsummary.$$.fragment, local);
    			transition_out(gobackbutton.$$.fragment, local);
    			transition_out(paybutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(paymentsummary);
    			destroy_component(gobackbutton);
    			destroy_component(paybutton);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const debitCardLink = "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=243772354-20f59e93-36e7-43fe-9fed-11b4c51ee5ef";
    const creditCardLink = "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=243772354-61356159-d0a4-4a07-9380-1f657c41bbbc";

    function instance$6($$self, $$props, $$invalidate) {
    	let { type } = $$props;
    	let { course } = $$props;
    	let { currentMonth } = $$props;
    	let { amount } = $$props;
    	const writable_props = ["type", "course", "currentMonth", "amount"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("course" in $$props) $$invalidate(1, course = $$props.course);
    		if ("currentMonth" in $$props) $$invalidate(2, currentMonth = $$props.currentMonth);
    		if ("amount" in $$props) $$invalidate(3, amount = $$props.amount);
    	};

    	$$self.$capture_state = () => {
    		return { type, course, currentMonth, amount };
    	};

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("course" in $$props) $$invalidate(1, course = $$props.course);
    		if ("currentMonth" in $$props) $$invalidate(2, currentMonth = $$props.currentMonth);
    		if ("amount" in $$props) $$invalidate(3, amount = $$props.amount);
    	};

    	return [type, course, currentMonth, amount];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			type: 0,
    			course: 1,
    			currentMonth: 2,
    			amount: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*type*/ ctx[0] === undefined && !("type" in props)) {
    			console.warn("<Card> was created without expected prop 'type'");
    		}

    		if (/*course*/ ctx[1] === undefined && !("course" in props)) {
    			console.warn("<Card> was created without expected prop 'course'");
    		}

    		if (/*currentMonth*/ ctx[2] === undefined && !("currentMonth" in props)) {
    			console.warn("<Card> was created without expected prop 'currentMonth'");
    		}

    		if (/*amount*/ ctx[3] === undefined && !("amount" in props)) {
    			console.warn("<Card> was created without expected prop 'amount'");
    		}
    	}

    	get type() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get course() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set course(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentMonth() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentMonth(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get amount() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set amount(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/QR.svelte generated by Svelte v3.16.4 */
    const file$5 = "src/routes/QR.svelte";

    function create_fragment$7(ctx) {
    	let main;
    	let div1;
    	let form;
    	let t0;
    	let div0;
    	let t1;
    	let main_intro;
    	let current;

    	const paymentsummary = new PaymentSummary({
    			props: {
    				type: /*type*/ ctx[0],
    				course: /*course*/ ctx[1],
    				currentMonth: /*currentMonth*/ ctx[2],
    				amount: /*amount*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const gobackbutton = new GoBackButton({ $$inline: true });

    	const paybutton = new PayButton({
    			props: {
    				action: "https://www.mercadopago.com/instore/merchant/qr/64876/template_062de856f8184465a26eec99708e54fbd4786dd413b442a580d3cf01e0138a43.pdf",
    				value: "Escanear código QR"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			form = element("form");
    			create_component(paymentsummary.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			create_component(gobackbutton.$$.fragment);
    			t1 = space();
    			create_component(paybutton.$$.fragment);
    			attr_dev(div0, "class", "flex");
    			add_location(div0, file$5, 18, 6, 593);
    			add_location(form, file$5, 15, 4, 514);
    			attr_dev(div1, "class", "max-w-xl flex flex-col h-screen justify-center m-auto");
    			add_location(div1, file$5, 14, 2, 442);
    			attr_dev(main, "class", "p-5");
    			add_location(main, file$5, 13, 0, 413);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, form);
    			mount_component(paymentsummary, form, null);
    			append_dev(form, t0);
    			append_dev(form, div0);
    			mount_component(gobackbutton, div0, null);
    			append_dev(div0, t1);
    			mount_component(paybutton, div0, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paymentsummary_changes = {};
    			if (dirty[0] & /*type*/ 1) paymentsummary_changes.type = /*type*/ ctx[0];
    			if (dirty[0] & /*course*/ 2) paymentsummary_changes.course = /*course*/ ctx[1];
    			if (dirty[0] & /*currentMonth*/ 4) paymentsummary_changes.currentMonth = /*currentMonth*/ ctx[2];
    			if (dirty[0] & /*amount*/ 8) paymentsummary_changes.amount = /*amount*/ ctx[3];
    			paymentsummary.$set(paymentsummary_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paymentsummary.$$.fragment, local);
    			transition_in(gobackbutton.$$.fragment, local);
    			transition_in(paybutton.$$.fragment, local);

    			if (!main_intro) {
    				add_render_callback(() => {
    					main_intro = create_in_transition(main, fade, {});
    					main_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paymentsummary.$$.fragment, local);
    			transition_out(gobackbutton.$$.fragment, local);
    			transition_out(paybutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(paymentsummary);
    			destroy_component(gobackbutton);
    			destroy_component(paybutton);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { type } = $$props;
    	let { course } = $$props;
    	let { currentMonth } = $$props;
    	let { amount } = $$props;
    	const writable_props = ["type", "course", "currentMonth", "amount"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<QR> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("course" in $$props) $$invalidate(1, course = $$props.course);
    		if ("currentMonth" in $$props) $$invalidate(2, currentMonth = $$props.currentMonth);
    		if ("amount" in $$props) $$invalidate(3, amount = $$props.amount);
    	};

    	$$self.$capture_state = () => {
    		return { type, course, currentMonth, amount };
    	};

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("course" in $$props) $$invalidate(1, course = $$props.course);
    		if ("currentMonth" in $$props) $$invalidate(2, currentMonth = $$props.currentMonth);
    		if ("amount" in $$props) $$invalidate(3, amount = $$props.amount);
    	};

    	return [type, course, currentMonth, amount];
    }

    class QR extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			type: 0,
    			course: 1,
    			currentMonth: 2,
    			amount: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "QR",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*type*/ ctx[0] === undefined && !("type" in props)) {
    			console.warn("<QR> was created without expected prop 'type'");
    		}

    		if (/*course*/ ctx[1] === undefined && !("course" in props)) {
    			console.warn("<QR> was created without expected prop 'course'");
    		}

    		if (/*currentMonth*/ ctx[2] === undefined && !("currentMonth" in props)) {
    			console.warn("<QR> was created without expected prop 'currentMonth'");
    		}

    		if (/*amount*/ ctx[3] === undefined && !("amount" in props)) {
    			console.warn("<QR> was created without expected prop 'amount'");
    		}
    	}

    	get type() {
    		throw new Error("<QR>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<QR>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get course() {
    		throw new Error("<QR>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set course(value) {
    		throw new Error("<QR>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentMonth() {
    		throw new Error("<QR>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentMonth(value) {
    		throw new Error("<QR>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get amount() {
    		throw new Error("<QR>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set amount(value) {
    		throw new Error("<QR>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/BTC.svelte generated by Svelte v3.16.4 */
    const file$6 = "src/routes/BTC.svelte";

    function create_fragment$8(ctx) {
    	let main;
    	let div1;
    	let form;
    	let t0;
    	let div0;
    	let t1;
    	let main_intro;
    	let current;

    	const paymentsummary = new PaymentSummary({
    			props: {
    				type: /*type*/ ctx[2],
    				course: /*course*/ ctx[1],
    				currentMonth: /*currentMonth*/ ctx[3],
    				amount: /*amount*/ ctx[0],
    				BTCWallet
    			},
    			$$inline: true
    		});

    	const gobackbutton = new GoBackButton({ $$inline: true });

    	const paybutton = new PayButton({
    			props: {
    				action: "https://undefinedschool.io",
    				value: "¡Ok!"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			form = element("form");
    			create_component(paymentsummary.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			create_component(gobackbutton.$$.fragment);
    			t1 = space();
    			create_component(paybutton.$$.fragment);
    			attr_dev(div0, "class", "flex");
    			add_location(div0, file$6, 20, 6, 664);
    			add_location(form, file$6, 17, 4, 573);
    			attr_dev(div1, "class", "max-w-xl flex flex-col h-screen justify-center m-auto");
    			add_location(div1, file$6, 16, 2, 501);
    			attr_dev(main, "class", "p-5");
    			add_location(main, file$6, 15, 0, 472);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, form);
    			mount_component(paymentsummary, form, null);
    			append_dev(form, t0);
    			append_dev(form, div0);
    			mount_component(gobackbutton, div0, null);
    			append_dev(div0, t1);
    			mount_component(paybutton, div0, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const paymentsummary_changes = {};
    			if (dirty[0] & /*type*/ 4) paymentsummary_changes.type = /*type*/ ctx[2];
    			if (dirty[0] & /*course*/ 2) paymentsummary_changes.course = /*course*/ ctx[1];
    			if (dirty[0] & /*currentMonth*/ 8) paymentsummary_changes.currentMonth = /*currentMonth*/ ctx[3];
    			if (dirty[0] & /*amount*/ 1) paymentsummary_changes.amount = /*amount*/ ctx[0];
    			paymentsummary.$set(paymentsummary_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(paymentsummary.$$.fragment, local);
    			transition_in(gobackbutton.$$.fragment, local);
    			transition_in(paybutton.$$.fragment, local);

    			if (!main_intro) {
    				add_render_callback(() => {
    					main_intro = create_in_transition(main, fade, {});
    					main_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(paymentsummary.$$.fragment, local);
    			transition_out(gobackbutton.$$.fragment, local);
    			transition_out(paybutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(paymentsummary);
    			destroy_component(gobackbutton);
    			destroy_component(paybutton);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const BTCWallet = "3EBAVUa9cEHg5VxHKDpYqrtCxXDUtQD4id";

    function instance$8($$self, $$props, $$invalidate) {
    	let { amount } = $$props;
    	let { course } = $$props;
    	let { type } = $$props;
    	let { currentMonth } = $$props;
    	const writable_props = ["amount", "course", "type", "currentMonth"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BTC> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("amount" in $$props) $$invalidate(0, amount = $$props.amount);
    		if ("course" in $$props) $$invalidate(1, course = $$props.course);
    		if ("type" in $$props) $$invalidate(2, type = $$props.type);
    		if ("currentMonth" in $$props) $$invalidate(3, currentMonth = $$props.currentMonth);
    	};

    	$$self.$capture_state = () => {
    		return { amount, course, type, currentMonth };
    	};

    	$$self.$inject_state = $$props => {
    		if ("amount" in $$props) $$invalidate(0, amount = $$props.amount);
    		if ("course" in $$props) $$invalidate(1, course = $$props.course);
    		if ("type" in $$props) $$invalidate(2, type = $$props.type);
    		if ("currentMonth" in $$props) $$invalidate(3, currentMonth = $$props.currentMonth);
    	};

    	return [amount, course, type, currentMonth];
    }

    class BTC extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			amount: 0,
    			course: 1,
    			type: 2,
    			currentMonth: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BTC",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*amount*/ ctx[0] === undefined && !("amount" in props)) {
    			console.warn("<BTC> was created without expected prop 'amount'");
    		}

    		if (/*course*/ ctx[1] === undefined && !("course" in props)) {
    			console.warn("<BTC> was created without expected prop 'course'");
    		}

    		if (/*type*/ ctx[2] === undefined && !("type" in props)) {
    			console.warn("<BTC> was created without expected prop 'type'");
    		}

    		if (/*currentMonth*/ ctx[3] === undefined && !("currentMonth" in props)) {
    			console.warn("<BTC> was created without expected prop 'currentMonth'");
    		}
    	}

    	get amount() {
    		throw new Error("<BTC>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set amount(value) {
    		throw new Error("<BTC>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get course() {
    		throw new Error("<BTC>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set course(value) {
    		throw new Error("<BTC>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<BTC>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<BTC>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentMonth() {
    		throw new Error("<BTC>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentMonth(value) {
    		throw new Error("<BTC>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Navbar.svelte generated by Svelte v3.16.4 */

    const file$7 = "src/components/Navbar.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let a;
    	let p;
    	let span0;
    	let t1;
    	let span1;
    	let t3;
    	let span2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			p = element("p");
    			span0 = element("span");
    			span0.textContent = "undefined";
    			t1 = space();
    			span1 = element("span");
    			span1.textContent = "sch001";
    			t3 = space();
    			span2 = element("span");
    			span2.textContent = "_";
    			attr_dev(span0, "class", "text-black-us");
    			add_location(span0, file$7, 3, 6, 257);
    			attr_dev(span1, "class", "text-gray-600");
    			add_location(span1, file$7, 4, 6, 308);
    			attr_dev(span2, "class", "blink text-cyan-us -ml-1");
    			add_location(span2, file$7, 5, 6, 356);
    			attr_dev(p, "class", "font-montserrat font-medium");
    			add_location(p, file$7, 2, 4, 211);
    			attr_dev(a, "href", "https://undefinedschool.io");
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "rel", "noopener");
    			attr_dev(a, "class", "text-s");
    			add_location(a, file$7, 1, 2, 123);
    			attr_dev(div, "class", "bg-white-us fixed top-0 left-0 shadow-md p-2 w-full sm:text-right text-center sm:pr-3");
    			set_style(div, "height", "40px");
    			add_location(div, file$7, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, p);
    			append_dev(p, span0);
    			append_dev(p, t1);
    			append_dev(p, span1);
    			append_dev(p, t3);
    			append_dev(p, span2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/components/Payments/SelectPaymentMethodTitle.svelte generated by Svelte v3.16.4 */

    const file$8 = "src/components/Payments/SelectPaymentMethodTitle.svelte";

    function create_fragment$a(ctx) {
    	let h1;
    	let t0;
    	let span;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text("Seleccionar\n  ");
    			span = element("span");
    			span.textContent = "medio de pago.";
    			attr_dev(span, "class", "font-semibold text-cyan-us");
    			add_location(span, file$8, 4, 2, 154);
    			attr_dev(h1, "class", "leading-tight sm:text-3xl text-4xl sm:mb-6 mb-12 text-white-us font-raleway text-center sm:flex sm:flex-col\n  sm:text-left");
    			add_location(h1, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			append_dev(h1, span);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class SelectPaymentMethodTitle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectPaymentMethodTitle",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.16.4 */

    const { console: console_1 } = globals;
    const file$9 = "src/App.svelte";

    // (57:4) <Route path="/">
    function create_default_slot_6(ctx) {
    	let main;
    	let div3;
    	let form;
    	let t0;
    	let section0;
    	let div0;
    	let label0;
    	let t2;
    	let input0;
    	let t3;
    	let div1;
    	let label1;
    	let t5;
    	let input1;
    	let t6;
    	let section1;
    	let span0;
    	let t8;
    	let div2;
    	let label2;
    	let span1;
    	let t9;
    	let span1_class_value;
    	let t10;
    	let input2;
    	let label2_class_value;
    	let t11;
    	let label3;
    	let span2;
    	let t12;
    	let span2_class_value;
    	let t13;
    	let input3;
    	let label3_class_value;
    	let t14;
    	let label4;
    	let span3;
    	let t15;
    	let span3_class_value;
    	let t16;
    	let input4;
    	let label4_class_value;
    	let t17;
    	let label5;
    	let span4;
    	let t18;
    	let span4_class_value;
    	let t19;
    	let input5;
    	let label5_class_value;
    	let t20;
    	let label6;
    	let span6;
    	let t21;
    	let span5;
    	let span6_class_value;
    	let t23;
    	let input6;
    	let label6_class_value;
    	let t24;
    	let label7;
    	let span8;
    	let t25;
    	let span7;
    	let span8_class_value;
    	let t27;
    	let input7;
    	let label7_class_value;
    	let t28;
    	let button;
    	let current;
    	let dispose;
    	const selectpaymentmethodtitle = new SelectPaymentMethodTitle({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div3 = element("div");
    			form = element("form");
    			create_component(selectpaymentmethodtitle.$$.fragment);
    			t0 = space();
    			section0 = element("section");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Nombre";
    			t2 = space();
    			input0 = element("input");
    			t3 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "E-mail";
    			t5 = space();
    			input1 = element("input");
    			t6 = space();
    			section1 = element("section");
    			span0 = element("span");
    			span0.textContent = "Medio de pago";
    			t8 = space();
    			div2 = element("div");
    			label2 = element("label");
    			span1 = element("span");
    			t9 = text("Transferencia bancaria/depósito");
    			t10 = space();
    			input2 = element("input");
    			t11 = space();
    			label3 = element("label");
    			span2 = element("span");
    			t12 = text("Efectivo");
    			t13 = space();
    			input3 = element("input");
    			t14 = space();
    			label4 = element("label");
    			span3 = element("span");
    			t15 = text("Tarjeta de Débito");
    			t16 = space();
    			input4 = element("input");
    			t17 = space();
    			label5 = element("label");
    			span4 = element("span");
    			t18 = text("Tarjeta de Crédito");
    			t19 = space();
    			input5 = element("input");
    			t20 = space();
    			label6 = element("label");
    			span6 = element("span");
    			t21 = text("Código QR\n                    ");
    			span5 = element("span");
    			span5.textContent = "(MercadoPago)";
    			t23 = space();
    			input6 = element("input");
    			t24 = space();
    			label7 = element("label");
    			span8 = element("span");
    			t25 = text("Bitcoin\n                    ");
    			span7 = element("span");
    			span7.textContent = "(BTC)";
    			t27 = space();
    			input7 = element("input");
    			t28 = space();
    			button = element("button");
    			button.textContent = "Continuar";
    			attr_dev(label0, "class", "form-input-title font-raleway opacity-70");
    			attr_dev(label0, "for", "name");
    			add_location(label0, file$9, 65, 16, 1860);
    			attr_dev(input0, "class", "form-input focus:outline-none focus:shadow-outline student-info-input");
    			attr_dev(input0, "aria-label", "Nombre");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "name");
    			attr_dev(input0, "id", "name");
    			attr_dev(input0, "placeholder", /*name*/ ctx[1]);
    			input0.required = true;
    			add_location(input0, file$9, 66, 16, 1958);
    			attr_dev(div0, "class", "mb-3");
    			add_location(div0, file$9, 64, 14, 1825);
    			attr_dev(label1, "class", "form-input-title font-raleway opacity-70");
    			attr_dev(label1, "for", "email");
    			add_location(label1, file$9, 76, 16, 2326);
    			attr_dev(input1, "class", "form-input focus:outline-none focus:shadow-outline student-info-input");
    			attr_dev(input1, "aria-label", "Nombre");
    			attr_dev(input1, "type", "email");
    			attr_dev(input1, "name", "email");
    			attr_dev(input1, "id", "email");
    			attr_dev(input1, "placeholder", /*email*/ ctx[2]);
    			input1.required = true;
    			add_location(input1, file$9, 77, 16, 2425);
    			attr_dev(div1, "class", "mb-8");
    			add_location(div1, file$9, 75, 14, 2291);
    			add_location(section0, file$9, 63, 12, 1801);
    			attr_dev(span0, "class", "form-input-title font-raleway opacity-70");
    			add_location(span0, file$9, 89, 14, 2830);

    			attr_dev(span1, "class", span1_class_value = "" + ((/*selected*/ ctx[0][0]
    			? "text-cyan-us"
    			: "text-white-us") + " ml-2 font-raleway"));

    			add_location(span1, file$9, 95, 18, 3202);
    			attr_dev(input2, "type", "radio");
    			attr_dev(input2, "class", "transition-ease-02 form-radio h-5 w-5 text-white-us");
    			attr_dev(input2, "name", "type");
    			input2.value = "bankTransfer";
    			input2.required = true;
    			add_location(input2, file$9, 98, 18, 3380);

    			attr_dev(label2, "class", label2_class_value = "" + ((/*selected*/ ctx[0][0]
    			? "border-cyan-us bg-cyan-us-alpha"
    			: "border-blue-us") + " flex items-center\n                  justify-between border-solid border-1 rounded p-4 h-16 mb-2"));

    			add_location(label2, file$9, 92, 16, 2985);

    			attr_dev(span2, "class", span2_class_value = "" + ((/*selected*/ ctx[0][1]
    			? "text-cyan-us"
    			: "text-white-us") + " ml-2 font-raleway"));

    			add_location(span2, file$9, 110, 18, 3921);
    			attr_dev(input3, "type", "radio");
    			attr_dev(input3, "class", "transition-ease-02 form-radio h-5 w-5 text-white-us");
    			attr_dev(input3, "name", "type");
    			input3.value = "cash";
    			add_location(input3, file$9, 111, 18, 4036);

    			attr_dev(label3, "class", label3_class_value = "" + ((/*selected*/ ctx[0][1]
    			? "border-cyan-us bg-cyan-us-alpha"
    			: "border-blue-us") + " flex items-center\n                  justify-between border-solid border-1 rounded p-4 h-16 mb-2"));

    			add_location(label3, file$9, 107, 16, 3704);

    			attr_dev(span3, "class", span3_class_value = "" + ((/*selected*/ ctx[0][2]
    			? "text-cyan-us"
    			: "text-white-us") + " ml-2 font-raleway"));

    			add_location(span3, file$9, 122, 18, 4540);
    			attr_dev(input4, "type", "radio");
    			attr_dev(input4, "class", "transition-ease-02 form-radio h-5 w-5 text-white-us");
    			attr_dev(input4, "name", "type");
    			input4.value = "debitCard";
    			add_location(input4, file$9, 125, 18, 4704);

    			attr_dev(label4, "class", label4_class_value = "" + ((/*selected*/ ctx[0][2]
    			? "border-cyan-us bg-cyan-us-alpha"
    			: "border-blue-us") + " flex items-center\n                  justify-between border-solid border-1 rounded p-4 h-16 mb-2"));

    			add_location(label4, file$9, 119, 16, 4323);

    			attr_dev(span4, "class", span4_class_value = "" + ((/*selected*/ ctx[0][3]
    			? "text-cyan-us"
    			: "text-white-us") + " ml-2 font-raleway"));

    			add_location(span4, file$9, 136, 18, 5213);
    			attr_dev(input5, "type", "radio");
    			attr_dev(input5, "class", "transition-ease-02 form-radio h-5 w-5 text-white-us");
    			attr_dev(input5, "name", "type");
    			input5.value = "creditCard";
    			add_location(input5, file$9, 139, 18, 5378);

    			attr_dev(label5, "class", label5_class_value = "" + ((/*selected*/ ctx[0][3]
    			? "border-cyan-us bg-cyan-us-alpha"
    			: "border-blue-us") + " flex items-center\n                  justify-between border-solid border-1 rounded p-4 h-16 mb-2"));

    			add_location(label5, file$9, 133, 16, 4996);
    			attr_dev(span5, "class", "text-gray-us");
    			add_location(span5, file$9, 152, 20, 6020);

    			attr_dev(span6, "class", span6_class_value = "" + ((/*selected*/ ctx[0][4]
    			? "text-cyan-us"
    			: "text-white-us") + " ml-2 font-raleway"));

    			add_location(span6, file$9, 150, 18, 5888);
    			attr_dev(input6, "type", "radio");
    			attr_dev(input6, "class", "transition-ease-02 form-radio h-5 w-5 text-white-us");
    			attr_dev(input6, "name", "type");
    			input6.value = "QR";
    			add_location(input6, file$9, 154, 18, 6112);

    			attr_dev(label6, "class", label6_class_value = "" + ((/*selected*/ ctx[0][4]
    			? "border-cyan-us bg-cyan-us-alpha"
    			: "border-blue-us") + " flex items-center\n                  justify-between border-solid border-1 rounded p-4 h-16 mb-2"));

    			add_location(label6, file$9, 147, 16, 5671);
    			attr_dev(span7, "class", "text-gray-us");
    			add_location(span7, file$9, 167, 20, 6744);

    			attr_dev(span8, "class", span8_class_value = "" + ((/*selected*/ ctx[0][5]
    			? "text-cyan-us"
    			: "text-white-us") + " ml-2 font-raleway"));

    			add_location(span8, file$9, 165, 18, 6614);
    			attr_dev(input7, "type", "radio");
    			attr_dev(input7, "class", "transition-ease-02 form-radio h-5 w-5 text-white-us");
    			attr_dev(input7, "name", "type");
    			input7.value = "BTC";
    			add_location(input7, file$9, 169, 18, 6828);

    			attr_dev(label7, "class", label7_class_value = "" + ((/*selected*/ ctx[0][5]
    			? "border-cyan-us bg-cyan-us-alpha"
    			: "border-blue-us") + " flex items-center\n                  justify-between border-solid border-1 rounded p-4 h-16 mb-2"));

    			add_location(label7, file$9, 162, 16, 6397);
    			attr_dev(div2, "class", "mt-2 sm:h-40 h-48 overflow-scroll");
    			add_location(div2, file$9, 91, 14, 2921);
    			attr_dev(section1, "class", "sm:mb-3 mb-10");
    			add_location(section1, file$9, 88, 12, 2784);
    			attr_dev(button, "class", "submit-button text-center w-full rounded focus:outline-none focus:shadow-outline shadow-md");
    			attr_dev(button, "type", "submit");
    			add_location(button, file$9, 179, 12, 7154);
    			attr_dev(form, "name", "payments");
    			attr_dev(form, "method", "POST");
    			attr_dev(form, "data-netlify", "true");
    			add_location(form, file$9, 60, 10, 1619);
    			attr_dev(div3, "class", "max-w-xl flex flex-col h-screen justify-center m-auto");
    			add_location(div3, file$9, 58, 8, 1540);
    			add_location(main, file$9, 57, 6, 1525);

    			dispose = [
    				listen_dev(input2, "click", /*click_handler*/ ctx[12], false, false, false),
    				listen_dev(input3, "click", /*click_handler_1*/ ctx[13], false, false, false),
    				listen_dev(input4, "click", /*click_handler_2*/ ctx[14], false, false, false),
    				listen_dev(input5, "click", /*click_handler_3*/ ctx[15], false, false, false),
    				listen_dev(input6, "click", /*click_handler_4*/ ctx[16], false, false, false),
    				listen_dev(input7, "click", /*click_handler_5*/ ctx[17], false, false, false),
    				listen_dev(form, "submit", prevent_default(/*onSubmit*/ ctx[7]), false, true, false)
    			];
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div3);
    			append_dev(div3, form);
    			mount_component(selectpaymentmethodtitle, form, null);
    			append_dev(form, t0);
    			append_dev(form, section0);
    			append_dev(section0, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t2);
    			append_dev(div0, input0);
    			append_dev(section0, t3);
    			append_dev(section0, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t5);
    			append_dev(div1, input1);
    			append_dev(form, t6);
    			append_dev(form, section1);
    			append_dev(section1, span0);
    			append_dev(section1, t8);
    			append_dev(section1, div2);
    			append_dev(div2, label2);
    			append_dev(label2, span1);
    			append_dev(span1, t9);
    			append_dev(label2, t10);
    			append_dev(label2, input2);
    			append_dev(div2, t11);
    			append_dev(div2, label3);
    			append_dev(label3, span2);
    			append_dev(span2, t12);
    			append_dev(label3, t13);
    			append_dev(label3, input3);
    			append_dev(div2, t14);
    			append_dev(div2, label4);
    			append_dev(label4, span3);
    			append_dev(span3, t15);
    			append_dev(label4, t16);
    			append_dev(label4, input4);
    			append_dev(div2, t17);
    			append_dev(div2, label5);
    			append_dev(label5, span4);
    			append_dev(span4, t18);
    			append_dev(label5, t19);
    			append_dev(label5, input5);
    			append_dev(div2, t20);
    			append_dev(div2, label6);
    			append_dev(label6, span6);
    			append_dev(span6, t21);
    			append_dev(span6, span5);
    			append_dev(label6, t23);
    			append_dev(label6, input6);
    			append_dev(div2, t24);
    			append_dev(div2, label7);
    			append_dev(label7, span8);
    			append_dev(span8, t25);
    			append_dev(span8, span7);
    			append_dev(label7, t27);
    			append_dev(label7, input7);
    			append_dev(form, t28);
    			append_dev(form, button);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*selected*/ 1 && span1_class_value !== (span1_class_value = "" + ((/*selected*/ ctx[0][0]
    			? "text-cyan-us"
    			: "text-white-us") + " ml-2 font-raleway"))) {
    				attr_dev(span1, "class", span1_class_value);
    			}

    			if (!current || dirty[0] & /*selected*/ 1 && label2_class_value !== (label2_class_value = "" + ((/*selected*/ ctx[0][0]
    			? "border-cyan-us bg-cyan-us-alpha"
    			: "border-blue-us") + " flex items-center\n                  justify-between border-solid border-1 rounded p-4 h-16 mb-2"))) {
    				attr_dev(label2, "class", label2_class_value);
    			}

    			if (!current || dirty[0] & /*selected*/ 1 && span2_class_value !== (span2_class_value = "" + ((/*selected*/ ctx[0][1]
    			? "text-cyan-us"
    			: "text-white-us") + " ml-2 font-raleway"))) {
    				attr_dev(span2, "class", span2_class_value);
    			}

    			if (!current || dirty[0] & /*selected*/ 1 && label3_class_value !== (label3_class_value = "" + ((/*selected*/ ctx[0][1]
    			? "border-cyan-us bg-cyan-us-alpha"
    			: "border-blue-us") + " flex items-center\n                  justify-between border-solid border-1 rounded p-4 h-16 mb-2"))) {
    				attr_dev(label3, "class", label3_class_value);
    			}

    			if (!current || dirty[0] & /*selected*/ 1 && span3_class_value !== (span3_class_value = "" + ((/*selected*/ ctx[0][2]
    			? "text-cyan-us"
    			: "text-white-us") + " ml-2 font-raleway"))) {
    				attr_dev(span3, "class", span3_class_value);
    			}

    			if (!current || dirty[0] & /*selected*/ 1 && label4_class_value !== (label4_class_value = "" + ((/*selected*/ ctx[0][2]
    			? "border-cyan-us bg-cyan-us-alpha"
    			: "border-blue-us") + " flex items-center\n                  justify-between border-solid border-1 rounded p-4 h-16 mb-2"))) {
    				attr_dev(label4, "class", label4_class_value);
    			}

    			if (!current || dirty[0] & /*selected*/ 1 && span4_class_value !== (span4_class_value = "" + ((/*selected*/ ctx[0][3]
    			? "text-cyan-us"
    			: "text-white-us") + " ml-2 font-raleway"))) {
    				attr_dev(span4, "class", span4_class_value);
    			}

    			if (!current || dirty[0] & /*selected*/ 1 && label5_class_value !== (label5_class_value = "" + ((/*selected*/ ctx[0][3]
    			? "border-cyan-us bg-cyan-us-alpha"
    			: "border-blue-us") + " flex items-center\n                  justify-between border-solid border-1 rounded p-4 h-16 mb-2"))) {
    				attr_dev(label5, "class", label5_class_value);
    			}

    			if (!current || dirty[0] & /*selected*/ 1 && span6_class_value !== (span6_class_value = "" + ((/*selected*/ ctx[0][4]
    			? "text-cyan-us"
    			: "text-white-us") + " ml-2 font-raleway"))) {
    				attr_dev(span6, "class", span6_class_value);
    			}

    			if (!current || dirty[0] & /*selected*/ 1 && label6_class_value !== (label6_class_value = "" + ((/*selected*/ ctx[0][4]
    			? "border-cyan-us bg-cyan-us-alpha"
    			: "border-blue-us") + " flex items-center\n                  justify-between border-solid border-1 rounded p-4 h-16 mb-2"))) {
    				attr_dev(label6, "class", label6_class_value);
    			}

    			if (!current || dirty[0] & /*selected*/ 1 && span8_class_value !== (span8_class_value = "" + ((/*selected*/ ctx[0][5]
    			? "text-cyan-us"
    			: "text-white-us") + " ml-2 font-raleway"))) {
    				attr_dev(span8, "class", span8_class_value);
    			}

    			if (!current || dirty[0] & /*selected*/ 1 && label7_class_value !== (label7_class_value = "" + ((/*selected*/ ctx[0][5]
    			? "border-cyan-us bg-cyan-us-alpha"
    			: "border-blue-us") + " flex items-center\n                  justify-between border-solid border-1 rounded p-4 h-16 mb-2"))) {
    				attr_dev(label7, "class", label7_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectpaymentmethodtitle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectpaymentmethodtitle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(selectpaymentmethodtitle);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(57:4) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (190:4) <Route path="/type=cash">
    function create_default_slot_5(ctx) {
    	let current;

    	const cash = new Cash({
    			props: {
    				amount: /*ARS*/ ctx[3],
    				course: "Full Stack JavaScript",
    				type: "Efectivo",
    				currentMonth: /*currentMonth*/ ctx[8]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(cash.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(cash, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cash.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cash.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(cash, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(190:4) <Route path=\\\"/type=cash\\\">",
    		ctx
    	});

    	return block;
    }

    // (193:4) <Route path="/type=debitCard">
    function create_default_slot_4(ctx) {
    	let current;

    	const card = new Card({
    			props: {
    				amount: /*ARS*/ ctx[3],
    				course: "Full Stack JavaScript",
    				type: "Tarjeta de Débito",
    				currentMonth: /*currentMonth*/ ctx[8]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(193:4) <Route path=\\\"/type=debitCard\\\">",
    		ctx
    	});

    	return block;
    }

    // (196:4) <Route path="/type=creditCard">
    function create_default_slot_3(ctx) {
    	let current;

    	const card = new Card({
    			props: {
    				amount: /*creditCard*/ ctx[4],
    				course: "Full Stack JavaScript",
    				type: "Tarjeta de Crédito",
    				currentMonth: /*currentMonth*/ ctx[8]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(196:4) <Route path=\\\"/type=creditCard\\\">",
    		ctx
    	});

    	return block;
    }

    // (199:4) <Route path="/type=QR">
    function create_default_slot_2(ctx) {
    	let current;

    	const qr = new QR({
    			props: {
    				amount: /*ARS*/ ctx[3],
    				course: "Full Stack JavaScript",
    				type: "Código QR",
    				currentMonth: /*currentMonth*/ ctx[8]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(qr.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(qr, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(qr.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(qr.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(qr, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(199:4) <Route path=\\\"/type=QR\\\">",
    		ctx
    	});

    	return block;
    }

    // (202:4) <Route path="/type=BTC">
    function create_default_slot_1(ctx) {
    	let current;

    	const btc = new BTC({
    			props: {
    				amount: /*BTCa*/ ctx[5],
    				course: "Full Stack JavaScript",
    				type: "BTC",
    				currentMonth: /*currentMonth*/ ctx[8]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(btc.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(btc, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(btc.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(btc.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(btc, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(202:4) <Route path=\\\"/type=BTC\\\">",
    		ctx
    	});

    	return block;
    }

    // (54:0) <Router>
    function create_default_slot(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let current;
    	const navbar = new Navbar({ $$inline: true });

    	const route0 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const route1 = new Route({
    			props: {
    				path: "/type=cash",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const route2 = new Route({
    			props: {
    				path: "/type=debitCard",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const route3 = new Route({
    			props: {
    				path: "/type=creditCard",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const route4 = new Route({
    			props: {
    				path: "/type=QR",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const route5 = new Route({
    			props: {
    				path: "/type=BTC",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			create_component(route0.$$.fragment);
    			t1 = space();
    			create_component(route1.$$.fragment);
    			t2 = space();
    			create_component(route2.$$.fragment);
    			t3 = space();
    			create_component(route3.$$.fragment);
    			t4 = space();
    			create_component(route4.$$.fragment);
    			t5 = space();
    			create_component(route5.$$.fragment);
    			attr_dev(div, "class", "p-5 bg-black-us");
    			add_location(div, file$9, 54, 2, 1453);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(navbar, div, null);
    			append_dev(div, t0);
    			mount_component(route0, div, null);
    			append_dev(div, t1);
    			mount_component(route1, div, null);
    			append_dev(div, t2);
    			mount_component(route2, div, null);
    			append_dev(div, t3);
    			mount_component(route3, div, null);
    			append_dev(div, t4);
    			mount_component(route4, div, null);
    			append_dev(div, t5);
    			mount_component(route5, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route0_changes = {};

    			if (dirty[0] & /*$$scope, selected*/ 262145) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    			const route1_changes = {};

    			if (dirty[0] & /*$$scope*/ 262144) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    			const route2_changes = {};

    			if (dirty[0] & /*$$scope*/ 262144) {
    				route2_changes.$$scope = { dirty, ctx };
    			}

    			route2.$set(route2_changes);
    			const route3_changes = {};

    			if (dirty[0] & /*$$scope*/ 262144) {
    				route3_changes.$$scope = { dirty, ctx };
    			}

    			route3.$set(route3_changes);
    			const route4_changes = {};

    			if (dirty[0] & /*$$scope*/ 262144) {
    				route4_changes.$$scope = { dirty, ctx };
    			}

    			route4.$set(route4_changes);
    			const route5_changes = {};

    			if (dirty[0] & /*$$scope*/ 262144) {
    				route5_changes.$$scope = { dirty, ctx };
    			}

    			route5.$set(route5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			transition_in(route4.$$.fragment, local);
    			transition_in(route5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			transition_out(route5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(navbar);
    			destroy_component(route0);
    			destroy_component(route1);
    			destroy_component(route2);
    			destroy_component(route3);
    			destroy_component(route4);
    			destroy_component(route5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(54:0) <Router>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let current;

    	const router = new Router({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const router_changes = {};

    			if (dirty[0] & /*$$scope, selected*/ 262145) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getPaymentType() {
    	const paymentTypes = document.getElementsByName("type");

    	for (const type of paymentTypes) {
    		if (type.checked) return type.value;
    	}
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { student } = $$props;
    	let { amount } = $$props;
    	const { name, email } = student;
    	const { ARS, creditCard, BTCa } = amount;
    	const selected = [0, 0, 0, 0, 0, 0];

    	const routes = {
    		0: "/type=bankTransfer",
    		1: "/type=cash",
    		2: "/type=debitCard",
    		3: "/type=creditCard",
    		4: "/type=QR",
    		5: "/type=BTC"
    	};

    	function updateSelected(paymentCode) {
    		selected.fill(0);
    		$$invalidate(0, selected[paymentCode] = 1, selected);
    	}

    	function onSubmit() {
    		const paymentType = getPaymentType();
    		console.log(`Student: ${event.target.name.value}`);
    		console.log(`Email: ${event.target.email.value}`);
    		console.log(`Payment type: ${paymentType}`);
    		navigate(routes[selected.indexOf(1)], { replace: true });
    		selected.fill(0);
    	}

    	const currentMonth = getCurrentMonth();
    	const writable_props = ["student", "amount"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => updateSelected(0);
    	const click_handler_1 = () => updateSelected(1);
    	const click_handler_2 = () => updateSelected(2);
    	const click_handler_3 = () => updateSelected(3);
    	const click_handler_4 = () => updateSelected(4);
    	const click_handler_5 = () => updateSelected(5);

    	$$self.$set = $$props => {
    		if ("student" in $$props) $$invalidate(9, student = $$props.student);
    		if ("amount" in $$props) $$invalidate(10, amount = $$props.amount);
    	};

    	$$self.$capture_state = () => {
    		return { student, amount };
    	};

    	$$self.$inject_state = $$props => {
    		if ("student" in $$props) $$invalidate(9, student = $$props.student);
    		if ("amount" in $$props) $$invalidate(10, amount = $$props.amount);
    	};

    	return [
    		selected,
    		name,
    		email,
    		ARS,
    		creditCard,
    		BTCa,
    		updateSelected,
    		onSubmit,
    		currentMonth,
    		student,
    		amount,
    		routes,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$b, safe_not_equal, { student: 9, amount: 10 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*student*/ ctx[9] === undefined && !("student" in props)) {
    			console_1.warn("<App> was created without expected prop 'student'");
    		}

    		if (/*amount*/ ctx[10] === undefined && !("amount" in props)) {
    			console_1.warn("<App> was created without expected prop 'amount'");
    		}
    	}

    	get student() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set student(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get amount() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set amount(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
      target: document.body,
      props: {
        student: {
          name: 'Jane Doe',
          email: 'jane@undefinedstudent.com',
        },
        amount: {
          ARS: 5000,
          creditCard: 5400,
          BTCa: 0.012,
        },
      },
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
