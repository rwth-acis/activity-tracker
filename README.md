# activity-tracker
An Activity Tracker Web Component, built using Polymer.

See the [component page](https://rwth-acis.github.io/activity-tracker) for more information.

## Usage
The element has one attribute:

url - The base URL of the activity tracker service.
```
## Example
<activity-tracker url="https://requirements-bazaar.org/beta/activities"></activity-tracker>
```

## Development Environment

This element is best tested during development using `polymer serve`. To install polymer, run
```
npm install -g bower
npm install -g polymer
```
Install all component dependencies with
```
polymer install
```
You may then use it to start a small development server using
```
polymer serve
```

