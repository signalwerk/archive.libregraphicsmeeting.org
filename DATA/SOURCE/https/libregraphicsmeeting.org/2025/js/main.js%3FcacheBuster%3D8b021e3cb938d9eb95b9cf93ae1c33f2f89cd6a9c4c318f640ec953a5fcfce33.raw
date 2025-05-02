import * as leaflet from './leaflet/leaflet-src.esm.js';

function* cycleColorsGen(arr, fn) {
    let args = [];
    while(true)
        for(const item of arr) {
            if(fn)
                args = yield fn(item, ...(args ? args : []));
            else
                yield item;
        }
}

const SYNTAX_MAP = {
    '<turn>': '<angle>'
}
function propertiesFromEntries(varPrefix, properties) {
    const propertiesMap = new Map();
    for(const [name, syntax, valueFn, transition=true, extra={}] of properties) {
        const cssName = `--${varPrefix}-${name}`
          , cssSyntax = syntax in SYNTAX_MAP ? SYNTAX_MAP[syntax] : syntax
          ;
        propertiesMap.set(name, {
            name
          , syntax: cssSyntax
          , cssName
          , cssVar: `var(${cssName})`
          , transition: transition
          , valueFn: valueFn
          , ...extra
        });
    }
    return propertiesMap;
}

function defineRepeatingConicGradient(varPrefix, amountColors, amountGradients, gradientIndex) {
    const  propertiesMap = propertiesFromEntries(varPrefix, [
            ['from', '<angle>', ()=>`${randomBetween(10, 140)}deg`]
          , ['position-h', '<percentage>', ()=>`${randomBetween(0, 100)}%`]
          , ['position-v', '<percentage>', ()=>`${randomBetween(0, 100)}%`]
        ])
      , colors = []
      , colorPositions = (property/*, isInitial, transitioner*/)=>{
            const fromName = `color-${property.i}-from`
              //, toName = `color-${property.i}-to`
              ;
            if(property.name === fromName) {
                const value = `${Math.random()}turn`;
                property.lastValue = value
                return value;
            }
            return propertiesMap.get(fromName).lastValue;
        }
      , colorValueFn = (property, isInitial, transitioner) => {
            // make upper layer gradients more transparent, so we can see through a lot
            const //step = 1/amountGradients
                low = gradientIndex / amountGradients
              , high = 1
              , alphaFn = ()=> randomBetween(low, high)
              , addHueOffset = false && (isInitial ? false : true)
              ;
            return transitioner.colorsIter.next([addHueOffset, alphaFn]).value;
        }
      ;
    for(let i=0;i<amountColors;i++) {
        const colorPropertiesMap = propertiesFromEntries(varPrefix, [
             [`color-${i}-color`, '<color>', colorValueFn, true]
           , [`color-${i}-from`, '<turn>' , colorPositions , true, {i, lastValue: null}]
           , [`color-${i}-to`, '<turn>' , colorPositions, true, {i}]
        ]);
        const color = Array.from(colorPropertiesMap.values()).map(entry=>entry.cssVar);

        //const [from, to] = [
        //  ['0%', '8.25%']
        //, ['8.25%', '16.5%']
        //, ['16.5%',  '25%']
        //][i];
        //color.push(from, to);
        colors.push(color.join(' '));
        for(const entry of colorPropertiesMap)
            propertiesMap.set(...entry)
    }

    const cssFunction = [
            ['repeating-conic-gradient( from'
                    , propertiesMap.get('from').cssVar
                    , 'at'
                    , propertiesMap.get('position-h').cssVar
                    , propertiesMap.get('position-v').cssVar
            ].join(' ')
          , ...colors
        ].join(',\n') + ')';

    return {
        cssFunction
      , propertiesMap
    }
}

function defineMultiRepeatingConicGradient(varPrefix, repetitions, amountColors) {
    const allProperties = []
      , cssFunctions = []
    for(let i=0; i<repetitions  ; i++) {
        const repetitionPrefix = `${varPrefix}-${i}`
         , {cssFunction, propertiesMap} = defineRepeatingConicGradient(repetitionPrefix, amountColors, repetitions, i)
         ;
        cssFunctions.push(cssFunction)
        allProperties.push(...propertiesMap.values());
    }

    return {
        css: cssFunctions.join(',\n')
      , allProperties
    }
}
/**
.multi-repeating-conic {
  background: repeating-conic-gradient(
      from 0deg at 80% 50%,
      #5691f580 0% 8.25%,
      #b338ff80 8.25% 16.5%,
      #f8305880 16.5% 25%
    ),
    repeating-conic-gradient(
      from 15deg at 50% 50%,
      #e856f580 0% 8.25%,
      #ff384c80 8.25% 16.5%,
      #e7f83080 16.5% 25%
    ),
    repeating-conic-gradient(
      from 0deg at 20% 50%,
      #f58356ff 0% 8.25%,
      #caff38ff 8.25% 16.5%,
      #30f88aff 16.5% 25%
    );
}
*/

function randomBetween(min, max) {
    return  Math.random() * (max - min) + min;
}

function easeInOutCubic(t) {
    // via https://easings.net/#easeInOutCubic
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function interpolateNumber(t, a, b) {
    // Also (?): (t, a, b) => (1 - t) * a + t * b;
    return ((b - a) * t) + a;
}

const GREENYELLOW = [91.3, 0.2335, 130.02]
 , DEEPPINK = [72.83, 0.19707545854163525, 351.9947080594076]
 ;

function makeColor([l, c, h], addHueOffset=false, alphaFn=false) {
    const alpha = (alphaFn ? alphaFn : Math.random)()
      , hue = addHueOffset
            ? `calc(${h}deg + var(--hue-offset))`
            : `${h}deg`
      , color =  `oklch(${l}% ${c} ${hue} / ${alpha})`
      ;
    return color
}
class BackgroundTransitioner {
    constructor(backgroundElement, buttonSelector) {
        this._isPlayingKey = 'backgroundTransitionIsPlaying';
        this.element = backgroundElement;
        // expose, so we can use the api for video production
        this.element.ownerDocument.defaultView.backgroundTransitioner = this;

        backgroundElement.addEventListener('transitionend', this._transitionendHandler.bind(this));

        const colors = [GREENYELLOW, DEEPPINK];
        this.colorsIter = cycleColorsGen(colors, makeColor);

        const {css, allProperties} = defineMultiRepeatingConicGradient('lgm25bg', 3, 6);
        this.allProperties = new Map(allProperties.map(prop=>[prop.cssName, prop]));
        for(const property of allProperties) {
            let initialValue = this._valueForProp(property, true)
            const cssPropertyDefinition = {
                  name: property.cssName
                , syntax: property.syntax
                , inherits: false
            }
            if(initialValue !== false)
                cssPropertyDefinition.initialValue = initialValue;
            window.CSS.registerProperty(cssPropertyDefinition);

        }
        backgroundElement.style.setProperty('--background', css + ', #fff');

        this.buttons = [];
        const togglePlay = this._togglePlayHandler.bind(this);
        for(const button of document.querySelectorAll(buttonSelector)) {
            this.buttons.push(button);
            button.addEventListener('click', togglePlay);
        }
        this.isPlaying = false;
        this._setButtonsState();
        this._timeoutID = null;
        if(localStorage.getItem(this._isPlayingKey) === '1')
            this._togglePlayHandler();
    }

    _setButtonsState() {
        this.buttons.map(button=>{
            button.classList[this.isPlaying ? 'add' : 'remove']('is_playing');
            button.classList[this.isPlaying ? 'remove' : 'add']('is_pausing');
        })
    }

    _setAllProperties() {
        for(const property of this.allProperties.values()) {
            const result = this._valueForProp(property, false);
            if(result !== false)
                this.element.style.setProperty(property.cssName, result);
        }
    }

    _getTransitionsData() {
        const transitionsData = new Map();
        for(const property of this.allProperties.values()) {
            if(property.transition) {
                transitionsData.set(property.cssName,
                    {
                        property
                      , duration: randomBetween(10,40)
                      , easingFunction:'ease-in-out'
                      , delay: randomBetween(0, 5)
                    }
                );
            }
        }
        return transitionsData;
    }

    _setTransitions() {
        const transitionsData = this._getTransitionsData()
          , transitions = []
          ;
        for(const {property, duration, easingFunction, delay} of transitionsData.values()) {
            if(property.transition)
                transitions.push(
                    // property name | duration | easing function | delay
                    // transition: margin-right 4s ease-in-out 1s;
                    `${property.cssName} ${duration}s ${easingFunction} ${delay}s`
                );
        }
        // One or more single-property transitions, separated by commas.
        this.element.style.transition = transitions.join(', ');
    }

    startTransitions() {
        this._setTransitions();
        if(this._timeoutID)
            clearTimeout(this._timeoutID);
        this._timeoutID = setTimeout(()=>this._setAllProperties(), 100);
    }

    stopTransitons() {
        var computedStyle = window.getComputedStyle(this.element)
          , state = new Map()
          ;
        for(const property of this.allProperties.values()) {
            const value = computedStyle.getPropertyValue(property.cssName);
            this.element.style.setProperty(property.cssName, value);
            state.set(property.cssName, value);
        }
        this.element.style.transition =  'none';
        clearTimeout(this._timeoutID);
        return state;
    }

    _togglePlayHandler(/*event*/) {
        this.isPlaying = !this.isPlaying;
        if(this.isPlaying) {
            this.startTransitions();
        }
        else {
            this.stopTransitons();
        }

        localStorage.setItem(this._isPlayingKey, this.isPlaying ? '1' : '0');
        this._setButtonsState();
    }

    _valueForProp(property, isInitial) {
        if(property.valueFn) {
            return property.valueFn(property, isInitial, this);
        }
        if(property.syntax === '<color>') {
            const addHueOffset = false && isInitial ? false : true
            return this.colorsIter.next([addHueOffset]).value;
        }
        if (property.syntax === '<angle>')
            return `${randomBetween(10, 140)}deg`;
        if (property.syntax === '<turn>')
            return `${randomBetween(0, 1)}turn`;
        if (property.syntax === '<percentage>')
            return `${randomBetween(20, 80)}%`;
        throw new Error(`Don't know how to set initial value for `
                    + `syntax ${property.syntax} for ${property.cssName}`);
    }
    _transitionendHandler(event) {
        const property = this.allProperties.get(event.propertyName);
        if(!property)
            return
        const result = this._valueForProp(property)
        if(result !== false)
            this.element.style.setProperty(property.cssName, result);
        // const stops = Math.round(Math.random() * 10)
        //   , colors = ['greenyellow', 'deeppink']
        //   , colorsIter  = cycleGen(colors)
        //   , gradient = []
        //   ;
        // gradient.push(colorsIter.next().value);
        // for(let i=1;i<stops;i++)
        //     gradient.push(colorsIter.next().value);
        // gradient.push(colorsIter.next().value);
        // // background-image: linear-gradient(rgba(0, 0, 255, 0.5), rgba(255, 255, 0, 0.5)),
        // const bg = `linear-gradient(${gradient.join(', ')})`;
        // backgroundElement.style.background = bg;
        // console.log(stops, 'setNewBackground', bg, 'backgroundElement', backgroundElement);
    }

    async videoCtrlInit() {
        this._videoCtrlInitialValues = this.stopTransitons();
        if(!this._culori) {
            const interpolate = await import('./culori-4.0.1/src/interpolate/interpolate.js')
              , format = await import('./culori-4.0.1/src/formatter.js')
              , modeOklchModule = await import('./culori-4.0.1/src/oklch/definition.js')
              , modeRgbModule = await import('./culori-4.0.1/src/rgb/definition.js')
              , modes = await import('./culori-4.0.1/src/modes.js')
              ;
            modes.useMode(modeOklchModule.default);
            modes.useMode(modeRgbModule.default);
            this._culori = {
                interpolate: interpolate.interpolate
              , formatCss: format.formatCss
            }
        }
        // this does not change in this run anymore
        this._videoCtrlTransitionsData = this._getTransitionsData();
        this._videoCtrlEvents = [];
        return 'videoCtrlInit DONE!';
    }

    _videoCtrlEnsureTransitions(time) {
        // for one transition full transition time is duration + delay
        // transition end is triggered when totalTime is up
        // we can thus create a list of timestamps, when the transitions ends
        //
        // if time is say 100
        // and full transition time is 5.4
        // we get 100/5.4 = 18.51851851851852
        // with Math.ceil we must figure we must create 19 entries
        //
        // we first create these entries for all transitions
        // then we order them
        // then we set values to them in order, so we make sure this
        // behaves like the css transitions based version
        // we don't set new values if they already exist. that way we can
        // run this method multiple times and it always only adds to the
        // back of the transition events list when it is required.

        const newEvents = [];
        for(const tansitionData of this._videoCtrlTransitionsData.values()) {
            if(!tansitionData.iterations) {
                tansitionData.iterations = [];
                tansitionData.fullDuration = tansitionData.duration + tansitionData.delay;
            }

            // we always need at least 2 the initial one at index 0 and
            // the next one at index 1
            const requiredAmount = tansitionData.iterations.length < 2
                    ? 2
                     // this calculates the higer index + 1 to get the amount/length
                    : Math.ceil(time / tansitionData.fullDuration) + 1
                    ;
            for(let i=tansitionData.iterations.length; i<requiredAmount;i++) {
                // Because we use tansitionData.iterations.length as starting
                // index, we don't redefine an existing transition,
                const transitionEvent = {
                      localIndex: i
                    , timeCode: i * tansitionData.fullDuration
                     // could use this as a sorting argument, if
                     // two events have the same timeCode, once they have
                     // a global position they wont loose it anymore
                     // that way the timeline is ensured to stay stable.
                     // but I believe this is never used.
                    , globalIndex: Infinity
                    , value: null
                    , property: tansitionData.property
                }
                tansitionData.iterations.push(transitionEvent);
                newEvents.push(transitionEvent);
            }
        }
        newEvents.sort((evtA, evtB)=>evtA.timeCode -evtB.timeCode);
        for(const event of newEvents) {
            // only ever append
            event.globalIndex = this._videoCtrlEvents.length;
            // we can set value now, it is in correct order.
            if(event.localIndex === 0) { // if i is 0 we can use the inital value
                event.value = this._videoCtrlInitialValues.get(event.property.cssName);
                continue;
            }
            // This can return false! When? Though it looks like
            // it does not happen ever for real.
            event.value = this._valueForProp(event.property);
            if(event.value === false)
                throw new Error(`ASSERTION FAILED _valueForProp returned false`
                    ` for "${event.property.cssName} valueFn ${event.property.valueFn}"`);
            this._videoCtrlEvents.push(event);
        }
    }

    _videoCtrlGetTransitionsAt(tansitionData, time) {
        // is 0 if local time is within delay otherwise it's between 0 and 1
        const position = time / tansitionData.fullDuration
          , fromIndex =  Math.floor(position)
          , toIndex = fromIndex + 1
          , localT = position % 1
          , localTime = tansitionData.fullDuration * localT
          , transitionTime = localTime - tansitionData.delay
          , transitionT = transitionTime < 0
                    ? 0
                    : transitionTime / tansitionData.duration
          , events = []
          ;
        for(const index of [fromIndex, toIndex]) {
            const event = tansitionData.iterations[index];
            if(!event) {
                throw new Error(`KEY ERROR index ${index} not in `
                    + `tansitionData.iterations for "${tansitionData.property.cssName}" run `
                    + `_videoCtrlEnsureTransitions first!`);
            }
            events.push(event);
        }
        return [...events, transitionT];
    }

    _videoCtrlInterpolate(property, easingFunction, from, to, transitionT) {
        let parse, format;
        const simpleCases = new Set(['<angle>','<percentage>'])
        if(simpleCases.has(property.syntax)) {
            for(const unit of ['deg', 'turn', '%']) {
                if(from.value.endsWith(unit)) {
                    // 128.53289467691405deg
                    parse=({value:val})=>parseFloat(val.slice(0, -1 * unit.length))
                    format=(val)=>`${val}${unit}`;
                }
            }
            if(!parse)
                throw new Error(`VALUE ERROR don't know how to parse property.syntax ${property.syntax} looking like from "${from.value}".`);

            const [fromNumber, toNumber] = [from, to].map(parse)
               , t = easeInOutCubic(transitionT)
               ;
            return format(interpolateNumber(t, fromNumber, toNumber));
        }
        else if(property.syntax === '<color>') {
            const color = this._culori.interpolate([from.value, easeInOutCubic, to.value]
                    // CAUTION the pure CSS/transition version interpolates in RGB
                    // to achieve the same colors we must do so too!
                    , 'rgb')(transitionT);
            return this._culori.formatCss(color);
        }
        else
            throw new Error(`VALUE ERROR don't know how to parse property.syntax "${property.syntax}".`);
    }

    videoCtrlSetToTime(time) {
        if(!this._videoCtrlTransitionsData)
            throw new Error(`NOT READY run videoCtrlInit first!`);
        this._videoCtrlEnsureTransitions(time);
        for(const transitionData of this._videoCtrlTransitionsData.values()) {
            const [from, to, transitionT] = this._videoCtrlGetTransitionsAt(transitionData, time)
              , property = transitionData.property
              , value = this._videoCtrlInterpolate(transitionData.property,
                    transitionData.easingFunction, from, to, transitionT)
              ;
            this.element.style.setProperty(property.cssName, value);
        }
    }

    videoCtrlAnimateStart() {
        if(!this._videoCtrlTransitionsData)
            throw new Error(`NOT READY run videoCtrlInit first!`);
        this.videoCtrlAnimateStop();
        this._videoCtrlAnimateStartTime = performance.now();
        this._videoCtrlAnimateNext(true);
    }

    _videoCtrlAnimateNext(initial, timestamp=null) {
        const nowT = initial
                ? 0
                : timestamp - this._videoCtrlAnimateStartTime;
        this.videoCtrlSetToTime(nowT / 1000);
        this._videoCtrlAnimateCancelRequestID = requestAnimationFrame(this._videoCtrlAnimateNext.bind(this, false));
    }

    videoCtrlAnimateStop() {
        cancelAnimationFrame(this._videoCtrlAnimateCancelRequestID);
        this._videoCtrlAnimateCancelRequestID = null;
        this._videoCtrlAnimateStartTime = null;
    }
}

window.CSS.registerProperty({
  name: "--my-color",
  syntax: "<color>",
  inherits: false,
  initialValue: "#c0ffee",
});

function collapsible(element, buttonSelector, openInMoble=false, isInitiallyOpen=false) {
    const baseClassName = 'ui_collapsible_mixin'
      , openClassName = `${baseClassName}-open`
      , closedClassName = `${baseClassName}-closed`
      , openInMobleClassName = `${baseClassName}-open_in_mobile`
      ;
    element.classList.add(baseClassName);
    element.classList.add(isInitiallyOpen ? openClassName : closedClassName);
    if(openInMoble)
        element.classList.add(openInMobleClassName);
    element.addEventListener('click', (event)=>{
        const button = event.target.closest(buttonSelector);
        if(event.target.closest('a') || event.target.closest('button')) return;
        if(button === null) return;
        if(button.closest(element.tagName) !== element) return;
        if(event.defaultPrevented) return;
        event.preventDefault();
        const isOpen = element.classList.contains(openClassName);

        element.classList[isOpen ? 'remove' : 'add'](openClassName);
        element.classList[isOpen ? 'add' : 'remove'](closedClassName);
        // if(!isOpen)
        //     element.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'});
    });
}





async function addMap(mapElement) {
    const mapContainer = document.createElement('div');
    mapElement.append(mapContainer);
    mapContainer.classList.add('open_street_map-container')
    const map = leaflet.map(mapContainer, {
            attributionControl: false
        })
      , attributionControl = leaflet.control.attribution({
            prefix: '&copy; <a href="https://leafletjs.com/" title="A JavaScript library for interactive maps">Leaflet</a>'
        })
      ;
    attributionControl.addTo(map);
    const osmLayer = leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    osmLayer.addTo(map);

    if(mapElement.classList.contains('open_street_map-with_routing')) {
        const geoGpxURL = mapElement.getAttribute('data-geo-gpx')
          //, response = await fetch(geoJsonURL)
          //, geoJsonData = await response.json()
          ;
         if(!leaflet.GPX) {
            // not ideal how this is handled in the plugin:-/
            window.L = {...leaflet};
            await import('./leaflet-gpx-2.1.2/gpx.js');
        }
        const options = {
                async: true,
                polyline_options: { color: 'red' },
            }
          , gpx = new window.L.GPX(geoGpxURL, options).on('loaded', (e) => {
                map.fitBounds(e.target.getBounds());
            })
          ;
        gpx.addTo(map);
    }
    if(mapElement.hasAttribute('data-geo')) {
        const geoURI = mapElement.getAttribute('data-geo')
          , url = URL.parse(geoURI)
          , [lat, lon] = url.pathname.split(',', 2).map(c=>parseFloat(c))
          , title = mapElement.getAttribute('data-title')
          , more = mapElement.getAttribute('data-more').replace('\\n', '<br />')
          , href = mapElement.getAttribute('data-href') || '#'
          ;
        let z = 17;
        if(url.searchParams.has('z'))
            z = parseInt(url.searchParams.get('z'), 10);
        map.setView([lat, lon], z);
        const marker = leaflet.marker([lat, lon], {title}).addTo(map);
        let markerContent = `<strong>${title}</strong>`;
        if(more)
            markerContent += '<br />' + more;
        marker.bindPopup(markerContent);

        const template = `<p>${more}<br />
<a href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=${z}/${lat}/${lon}">Go to openstreetmap.com</a>
</p>
`;
        mapElement.append(document.createRange().createContextualFragment(template));
    }
}

function main() {
    for(const [selector, fn, ...args] of [
                    ['body', (...args)=>new BackgroundTransitioner(...args) , '.play_pause']
                  , ['header nav > .past_editions', collapsible, '.past_editions > span', false]
                  , ['header nav li:has(> ul)', collapsible, 'li', true]
                  , ['header nav', collapsible, 'nav', false]
                  , ['.open_street_map', addMap]
                ]) {
        for(const element of document.querySelectorAll(selector))
            fn(element, ...args);
    }
}

if(document.readyState === 'loading')
    window.addEventListener('DOMContentLoaded', main);
else
    main();
