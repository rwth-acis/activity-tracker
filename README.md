# activity-tracker
An activity tracker Web Component, built using Polymer. Takes an array of items and shows them in a list. By providing an icon Url an icon or profile image is shown on the left. By providing a redirect URL the elements becomes clickable and redirects the user on click.

See the [component page](https://rwth-acis.github.io/activity-tracker) for more information.

## Usage
The element has 2 attributes

title - A header displayed on top of the element, e.g. Recent Activities.

activities - A array of activities. The elements inside the array should have the following structure
```javascript
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "time": {
      "type": "string"
    },
    "iconURL": {
      "type": "string"
    },
    "user": {
      "type": "string"
    },
    "redirectURL": {
      "type": "string"
    }
  }
}
```

## Example
```html
<activity-tracker title="Recent Activities" id="activity-tracker"></activity-tracker>

<script>
        var activities = '[{"title": "New commit", "description": "I added support for ...", "time":"2015-08-06T16:30:00-08:00","iconURL":"http://mysite/myicon.jpg","user":"Peter", "redirectURL":"http://mysite/commit/1"}]';

        document.getElementById('activity-tracker').setAttribute('activities', activities);
</script>

```

## Development Environment

This element is best tested during development using `polyserve`. To install, run
```
npm install -g polyserve
```
You may then use it to start a small development server using
```
polyserve
```

