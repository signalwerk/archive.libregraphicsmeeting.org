

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
      , colorPositions = (property, isInitial, transitioner)=>{
            const fromName = `color-${property.i}-from`
              , toName = `color-${property.i}-to`
              ;
            if(property.name === fromName) {
                const value = `${Math.random()}turn`;
                property.lastValue = value
                return value;
            }
            else
                return propertiesMap.get(fromName).lastValue;

            return false;
        }
      , colorValueFn = (property, isInitial, transitioner) => {
            // make upper layer gradients more transparent, so we can see through a lot
            const step = 1/amountGradients
              , low = gradientIndex / amountGradients
              , high = 1
              , alphaFn = ()=> randomBetween(low, high)
              ;
            return transitioner.colorsIter.next([isInitial ? false : true, alphaFn]).value;
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

const GREENYELLOW = [91.3, 0.2335, 130.02]
 , DEEPPINK = [72.83, 0.19707545854163525, 351.9947080594076]
 ;

function makeColor([l, c, h], addHueOffset=false, alphaFn=false) {
    const alpha = (alphaFn ? alphaFn : Math.random)()
      , hueOffset = addHueOffset
            ? ' + var(--hue-offset)'
            : ''
      , color =  `oklch(${l}% ${c} calc(${h}deg${hueOffset}) / ${alpha})`
      ;
    return color
}
class BackgroundTransitioner {
    constructor(backgroundElement, buttonSelector) {
        this._isPlayingKey = 'backgroundTransitionIsPlaying';
        this.element = backgroundElement;
        backgroundElement.addEventListener('transitionend', this._transitionendHandler.bind(this));

        const colors = [GREENYELLOW, DEEPPINK];
        this.colorsIter = cycleColorsGen(colors, makeColor);

        const {css, allProperties} = defineMultiRepeatingConicGradient('lgm25bg', 3, 6)
          , transitions = []
          ;
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
        backgroundElement.style.background = css + ', #fff';

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
    _setTransitions() {
        const transitions = [];
        for(const property of this.allProperties.values()) {
            if(property.transition)
                transitions.push(
                    // property name | duration | easing function | delay
                    // transition: margin-right 4s ease-in-out 1s;
                    `${property.cssName} ${randomBetween(10,40)}s ease-in-out ${randomBetween(0, 5)}s`
                );
        }
        // One or more single-property transitions, separated by commas.
        this.element.style.transition = transitions.join(', ');
    }

    _togglePlayHandler(/*event*/) {
        this.isPlaying = !this.isPlaying;
        if(this.isPlaying) {
            this._setTransitions();
            if(this._timeoutID)
                clearTimeout(this._timeoutID);
            this._timeoutID = setTimeout(()=>this._setAllProperties(), 100);
        }
        else {
            var computedStyle = window.getComputedStyle(this.element);
            for(const property of this.allProperties.values()) {
                const value = computedStyle.getPropertyValue(property.cssName);
                this.element.style.setProperty(property.cssName, value);
            }
            this.element.style.transition =  'none';
            clearTimeout(this._timeoutID);
        }

        localStorage.setItem(this._isPlayingKey, this.isPlaying ? '1' : '0');
        this._setButtonsState();
    }

    _valueForProp(property, isInitial) {
        if(property.valueFn) {
            return property.valueFn(property, isInitial, this);
        }
        if(property.syntax === '<color>')
            return this.colorsIter.next([isInitial ? false : true]).value;
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
}

window.CSS.registerProperty({
  name: "--my-color",
  syntax: "<color>",
  inherits: false,
  initialValue: "#c0ffee",
});

function collapsible(element, buttonSelector, isInitiallyOpen=false) {
    const baseClassName = 'ui_collapsible_mixin'
      , openClassName = `${baseClassName}-open`
      , closedClassName = `${baseClassName}-closed`
      ;
    element.classList.add(baseClassName);
    element.classList.add(isInitiallyOpen ? openClassName : closedClassName);
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

function main() {
    for(const [selector, fn, ...args] of [
                    ['body', (...args)=>new BackgroundTransitioner(...args) , '.play_pause']
                  , ['nav > .past_editions', collapsible, '.past_editions > span']
                  , ['nav li:has(> ul)', collapsible, 'li']
                  , ['nav', collapsible, 'nav']
                ]) {
        for(const element of document.querySelectorAll(selector))
            fn(element, ...args);
    }
}

if(document.readyState === 'loading')
    window.addEventListener('DOMContentLoaded', main);
else
    main();
