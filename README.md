# Circular slider
Gašper Grom
gasper.grom@gmail.com

Circular slider is created as native web component. It can be used on desktop devices as well as mobile devices.

## Setup
To be able to use this component you need to fulfill next steps:
- include styles which can be found in  **/styles/main.css**
- include JavaScript which can be found in **/scripts/main.js**
- use html tag *<celtra-slider>* and *<celtra-slider-group>*. More explained in later sections
```HTML
<celtra-slider-group>
    <celtra-slider></celtra-slider>
</celtra-slider-group>
```

## Layout
There are 2 options to use slider component **standalone** and **group**

#### Standalone
Component is placed on its own.
```HTML
    <celtra-slider></celtra-slider>
```

#### Group
Multiple sliders are grouped together with *<celtra-slider-group>* component
```HTML
<celtra-slider-group>
    <celtra-slider></celtra-slider>
</celtra-slider-group>
```

## Options
Slider includes many options which allow you to customize slider on your own.
Options are entered as attributes to the *<celtra-slider>* tag.

#### color
Color attribute defines color of current slider. 

value:  *color name, hex value, rgb value...*

default:  *red*
```HTML
    <celtra-slider color="red"></celtra-slider>
    <celtra-slider color="#ffe546"></celtra-slider>
    <celtra-slider color="rgb(222,135,54)"></celtra-slider>
```

#### value
Value attribute defines initial value of slider.
Value has to be between minimum 

value:  *float*

default:  *value of min attribute or 0*
```HTML
    <celtra-slider value="15"></celtra-slider>
    <celtra-slider value="3.4"></celtra-slider>
```

#### min
Min attribute defines minimum value of slider.
Value shouldn't be greater than maximum value.

value:  *float*

default: *0*
```HTML
    <celtra-slider min="15"></celtra-slider>
    <celtra-slider min="3.4"></celtra-slider>
```

#### max
Max attribute defines maximum value of slider.
Value shouldn't be lower than min value.

value:  *float*

default: *100*
```HTML
    <celtra-slider max="79"></celtra-slider>
    <celtra-slider max="88.4"></celtra-slider>
```

#### step
Step attribute defines step of slider.
Value shouldnt be 0 or lower & shouldn't be higher than range between min and max value.

value:  *float*

default: *1*
```HTML
    <celtra-slider min="2"></celtra-slider>
    <celtra-slider min="0.1"></celtra-slider>
```

#### range
Range attribute amount of degrees that are available on a slider.
Value should be between 1 and 360.

Example: if value is 270, then when there will be maximum value the handle will be at 270 degrees.

value:  *float*

default: *360*
```HTML
    <celtra-slider radius="270"></celtra-slider>
```


## Events
Slider component includes **change** event which is triggered on slider initialization and also when value of the slider has changed. There are 2 principles of listening to events.

#### Attribute
To component we add attribute @change which receives function name which needs to be executed. Make sure your function is implemented.
```HTML
    <celtra-slider @change="valueChanged"></celtra-slider>
    <script>
        function valueChanged (e) {
            const value = e.detail.value;
            // Do something with value
        }
    </script>
```
So as on explained above function name is added to parameter **@change**. In the function we get current value of the slider from event object which is passed to the function. Value can be found in details.value.

#### Listener
Second option is through listener. We need to get element from the DOM first and then attach listener on **change** and then we can find current slider value in event object on same way as on first option.
```HTML
    <celtra-slider id="slider"></celtra-slider>
    <script>
        const slider = document.getElementById('slider');
        slider.addEventListener('chang', (e) => {
             const value = e.detail.value;
             // Do something with value
        });
    </script>
```
