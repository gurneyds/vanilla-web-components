# Vanilla Web Components with Sub-Components

## Introduction

When building Vanilla Web Component the goal is to provide some new functionality to a web page that encapsulates some functionality.  The user of a component simply places it on the page and does not need to know the details of the component. Many components will be internally complex and need to be broken down into smaller sub-components. Each sub-component further encapsulates some set of functionality that can be developed and tested independent from all other components.
<do-amazing-things cool-stuff-data="abc"  step-one-data="efg">
<do-cool-stuff step-two-data="lmn" step-one-data="efg">
<step-one data="efg">
<step-two data="lmn/>
</step-one>
</do-cool-stuff>
</do-amazing-things>

A parent component may need to pass data down to its sub components to configure them, or just to provide data. For example:
<do-amazing-things> needs to pass down the data in the attribute "cool-stuff-data" down to it's sub-component <do-cool-stuff>. It also needs to send the data in the attribute "step-one-data" to <do-cool-stuff>
In turn, <do-cool-stuff> needs to send down the data in the attribute "step-two-data" to it's sub-component <step-one>
One step futher, <step-on> needs to send down some internal data to <step-two>
Challenges
The experience we have had with sub-components has been a bit of a challenge. it turns out that nesting a component (sub-component) within a component doesn't behave as you might expect.

## Expectations
The expectation was that when a parent component was created it would look at it's Template to discover if there were any sub-components. The sub-components would be created and handed back to the parent component at the time of creation. The parent could then pass necessary data down to the sub-component.

#### The expected flow looks like this:

<do-cool-stuff> constructor called
<step-one> constructor called
<step-two> constructor called
<step-two> connected callback called
<step-one> connected callback called
<do-cool-stuff> send data to sub-components  - We would expect this to work since the sub-components have been created
<do-cool-stuff> connected callback called

## Actuals
The reality is that the parent component's constructor is called and it runs to completion and THEN the sub-component constructor is called. When the parent attempts to send data down to the sub-component it "seems" to work because there are no errors, but the reality is that the sub-component hasn't even be constructed yet and it's just an HTMLElement. The data that is sent becomes just a plain old property on the HTMLElement rather than calling the property setter. The sub-component completes it's construction, but the data that was supposed to have been passed down never makes it.

#### The actual flow looks like this:

<do-cool-stuff> constructor called
<do-cool-stuff> connected callback called
<do-cool-stuff> send data to sub-components  - We would expect this to work - BUT - the sub-component has NOT actually be created yet
<step-one> constructor called
<step-one> connected callback called
<step-two> constructor called
<step-two> connected callback called

## Possible Solutions
1. Explicitly create and insert the sub-components within the constructor of the parent component. This guarantees the order of operations. The sub-component is fully instantiated and ready to receive data when it is place on the page.
  * Advantages - simple, easy to understand and debug
  * Disadvantages - if there are a lot of sub-components then each component must be manually constructed and placed on the page. It may not be clear where the sub-components will be placed on the page. It would be a good idea to include an html comment to indicate where sub-components will be placed during construction.
2. Create text representation of the sub-component and then innerHTML
  * Advantages - simple
  * Disadvantages - not all information can/should be passed via attributes. Properties are preferred because an object can be passed
3. The sub-component could emit an event when it is finished and the parent listen
  * Advantages - simple model with no coupling
  * Disadvantages - the parent must cache the information and hold it until the sub-component is ready for it. There may be some convoluted logic to decide what to do based on whether or not the sub-component is ready to receive data.
4. Set a timeout in the parent and then push the data to the sub-component
  * Conceptually this should work, but experience shows that it doesn't. Maybe the reference to the sub-component changes under the covers somehow, so sending data to it doesn't work
5. Callback model where the sub-component discovers it's parent and then calls a callback function
  * This is very similar to the event model mentioned above.

## More Information
Here is some information about custom elements and how they are handled: https://w3c.github.io/webcomponents/spec/custom/#custom-elements-upgrades-examples


## Conclusion
At this time the recommended why to write html based vanilla components is to use option #1 above. Create all sub-components within the parent component via document.createElement('sub-component'), insert in the parent template and pass in the necessary data. (Not sure that the order here matters)

## Sample Code
Some additional examples of some of these approaches can be found here:
https://github.com/zvakanaka/sub-component
