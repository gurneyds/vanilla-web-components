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


## Challenges
The experience we have had with sub-components has been a bit of a challenge. it turns out that nesting a component (sub-component) within a component doesn't behave as you might expect.

## Approaches
There are two main approaches to writing vanilla web components:
1. Html based components - demonstrated with componentA, componentB, componentC and componentD
2. JavaScript based components - demonstrated with componentE and componentF

HTML based components have been a bit of a challenge because of the order in which the lifecycle events are called.
JavaScript based components have been much more successful

## Lifecycle order expectations
The expectation was that when a parent component was created it would look at it's Template to discover if there were any sub-components. The sub-components would be created and handed back to the parent component at the time of creation. The parent could then pass necessary data down to the sub-component.

#### The expected flow looks like this:

<do-cool-stuff> constructor called
	<step-one> constructor called
		<step-two> constructor called
		<step-two> connected callback called
	<step-one> connected callback called
<do-cool-stuff> send data to sub-components  - We would expect this to work since the sub-components have been created
<do-cool-stuff> connected callback called

## Actual lifecycle order for html based components
The reality is that the parent component's constructor is called and it runs to completion and THEN the sub-component constructor is called. When the parent attempts to send data down to the sub-component it "seems" to work because there are no errors, but the reality is that the sub-component hasn't even be constructed yet and it's just an HTMLElement. The data that is sent becomes just a plain old property on the HTMLElement rather than calling the property setter. The sub-component completes it's construction, but the data that was supposed to have been passed down never makes it.

#### The actual flow looks like this:

<do-cool-stuff> constructor called
<do-cool-stuff> connected callback called
<do-cool-stuff> send data to sub-components  - We would expect this to work - BUT - the sub-component has NOT actually be created yet
<step-one> constructor called
<step-one> connected callback called
<step-two> constructor called
<step-two> connected callback called

## Possible Solutions for html based components

1. Explicitly create and insert the sub-components within the constructor of the parent component. This guarantees the order of operations. The sub-component is fully instantiated and ready to receive data when it is place on the page.
  * Advantages - simple, easy to understand and debug
  * Disadvantages - if there are a lot of sub-components then each component must be manually constructed and placed on the page. It may not be clear where the sub-components will be placed on the page. It would be a good idea to include an html comment to indicate where sub-components will be placed during construction.
2. Create text representation of the sub-component and then innerHTML
  * Advantages - simple
  * Disadvantages - not all information can/should be passed via attributes. Properties are preferred because an object can be passed in that contains complex data structures
3. The sub-component could emit an event when it is finished and the parent listen
  * Advantages - simple model with no coupling
  * Disadvantages - the parent must cache the information and hold it until the sub-component is ready for it. There may be some convoluted logic to decide what to do based on whether or not the sub-component is ready to receive data.
4. Set a timeout in the parent and then push the data to the sub-component
  * Conceptually this should work, but experience shows that it doesn't. Maybe the reference to the sub-component changes under the covers somehow, so sending data to it doesn't work
5. Callback model where the sub-component discovers it's parent and then calls a callback function
  * This is very similar to the event model mentioned above.

## Web Component rules
It turns out that there are some very specific rules about constructing web components. The [W3C spec rules](https://w3c.github.io/webcomponents/spec/custom/#custom-element-conformance) help component developers write code that has a much better chance of actually working! The rules are:

1. You must call super() in your constructor
2. Don't call return in your constructor unless it is an early return
3. The constructor must not put anything into the component via document.write() or document.open()
4. The attributes and children must not be inspected before the element is ready (ie in the connectedCallback method, not the constructor)
5. The component must not gain any attributes or children as this would be unexpected behavior.
6. Defer as much work as possible to the connectedCallback method. Also note that this method could be called more than once so it is necessary to protect any code that would cause problems if call twice.
7. The constructor should setup the initial state and default values and possibly the shadow root.

## JavaScript based components
JavaScript based components seem to behave as expected when the above rules are followed. Some key points are:

* Constructor calls the super() method
* Attach the shadowRoot in the constructor
* Inspect attributes in the connectedCallback method
* Check to see if the property values have been set before getting attribute values. This is because if a component is dynamically created a property could be set before placing into the DOM and the connectedCallback method would not have been called yet.
* Use private variables to hold information that will be passed to sub-components when the connectedCallback method is called.
* Since the connectedCallback method could be called more than once, make sure that it handles the state correctly.
* When passing information to a sub-component, make sure that the sub-component has been created (ie. if the shadowRoot exists)


## Recommendation
JavaScript based web components seem to behave in a more straight forward, expected manner. Sub-components work well as long as the rules are followed and can be placed in the template of the parent. This means that very complex parent containers will not need to do anything special in order for the sub-components to work. Also, [Firefox has no plans to support html imports](http://caniuse.com/#feat=imports). For these reasons it is recommended that JavaScript based components be used as shown in componentE.js and componentF.js

## Sample Code
Some additional examples of some of these approaches can be found here:
https://github.com/zvakanaka/sub-component
