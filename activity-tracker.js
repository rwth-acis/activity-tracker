import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/iron-list/iron-list.js';
import '@polymer/iron-scroll-threshold/iron-scroll-threshold.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-spinner/paper-spinner.js';
import 'time-elements/dist/time-elements';

/**
An element showing a list of activities, who created it and when.

@group rwth-acis Elements
@element activity-tracker
@demo demo/index.html
@customElement
@polymer
@hero hero.svg
*/
class ActivityTracker extends PolymerElement {

  static get properties() {
    return {
      /**
       * The URL of the Activity Tracker service.
       */
      url: {
        type: String,
        value: 'https://requirements-bazaar.org/beta/activities'
      },
      /**
       * An array of activity objects.
       */
      activities: {
        type: Array,
        notify: true,
        readOnly: true,
        value: function() { return []; }
      },
      /**
       * The parameters for the HTTP call to the backend service.
       */
      _params: {
        type: Object,
        notify: true
      },
      /**
       * Defines how many activities should get fetched from the server initially. Usually it's good practice to fill the
       * height of the window.
       */
      initialLimit: {
        type: Number,
        value: 30
      },
      /**
       * Set to true when activities are being loaded.
       */
      _loadingActivities: {
        type: Boolean
      },
      /**
       * The interval in seconds when the activity tracker should update itself. Set to 0 to deactivate auto-updating.
       */
      autoUpdateInterval: {
        type: Number,
        value: 30
      }
    }
  }

  static get template() {
    return html`
      <style>
        :host {
          display: block;
          box-sizing: border-box;
          font-size: 14px;
        }

        #scrollContainer {
          height: 100%;
          overflow: auto;
        }

        #activitiesList {
          @apply --layout-vertical;
        }

        #activitiesList a {
          width: 100%;
          color: inherit;
          text-decoration: none;
        }

        .activity {
          @apply --layout-horizontal;
          min-height: 35px;
          color: #212121;
          padding: 2px;
          padding-bottom: 8px;
          border-bottom: 1px solid gainsboro;
          cursor: pointer;
        }

        .activity:hover {
          background-color: lightgray;
        }

        .activity > img {
          margin-right: 8px;
          width: 35px;
          height: 35px;
          border-radius: 50%;
        }

        .activity > div {
          @apply --layout-flex;
        }

        .creator {
          font-weight: bold;
        }

        .creationDate {
          opacity: 0.87;
          font-size: small;
        }

        .loadingIndicator {
          padding-top: 15px;
          background-color: lightgray;
          text-align: center;
          height: 44px;
        }

        .loadingIndicator paper-spinner {
          width: 20px;
          height: 20px;
          margin-right: 10px;
        }
      </style>

      <iron-ajax id="activitiesRequest"
        url="[[url]]"
        handle-as="json"
        loading="{{_loadingActivities}}"
        params="{{_params}}"
        on-response="_handleActivitiesResponse"></iron-ajax>

      <div id="scrollContainer">

      <iron-list id="activitiesList" items="[[activities]]" as="activity">
        <template>
          <a href$="[[activity.dataFrontendUrl]]" on-tap="_handleActivityTap">
            <div class="activity">
              <img src="[[activity.user.profileImage]]">
              <div>
                <span class="creator">[[activity.user.firstName]] [[activity.user.lastName]]</span>
                <span>[[_calculateActivityMessage(activity)]]</span>
                <div>
                  <relative-time class="creationDate" datetime$="{{activity.creationDate}}"></relative-time>
                </div>
              </div>
            </div>
          </a>
        </template>

      </iron-list>

      <div class="loadingIndicator">
        <paper-spinner active="{{_loadingActivities}}"></paper-spinner> Loading activities...
      </div>

      </div>

      <!-- this element will load more data when the user scrolls down and reached the lower threshold -->
      <iron-scroll-threshold id="scrollThreshold"
      lower-threshold="500"
      on-lower-threshold="_loadMoreData"
      scroll-target="scrollContainer">
      </iron-scroll-threshold>

    `;
  }

  /**
   * Called after the properties are set. Starts the auto update if set.
   */
  ready() {
    super.ready();

    if (this.autoUpdateInterval > 0) {
      setInterval(function() { this.refresh(); }.bind(this), (this.autoUpdateInterval * 1000));
    }
  }

  /**
   * Calculates the text that is shown in the activity list entry.
   *
   * @param action the action of the activity.
   * @param type the type of the activity.
   * @param data the data object returned from the server.
   * @returns {string}
   */
  _calculateActivityMessage(activity) {
    var action = activity.activityAction;
    var type = activity.dataType;
    var data = activity.data;
    var parentData = activity.parentData;

    var message = '';
    var actionString = '';
    var typeString = '';
    var dataString = '';

    switch (action) {
      case 'CREATE':
        actionString = 'created';
        break;
      case 'UPDATE':
        actionString = 'updated';
        break;
      case 'DELETE':
        actionString = 'deleted';
        break;
      case 'REALIZE':
        actionString = 'realized';
        break;
      case 'VOTE':
        actionString = 'voted for';
        break;
      case 'UNVOTE':
        actionString = 'unvoted';
        break;
      case 'DEVELOP':
        actionString = 'started developing';
        break;
      case 'UNDEVELOP':
        actionString = 'stopped developing';
        break;
      case 'FOLLOW':
        actionString = 'followed';
        break;
      case 'UNFOLLOW':
        actionString = 'unfollowed';
        break;
      case 'LEADDEVELOP':
        actionString = 'became lead developer of';
        break;
      case 'UNLEADDEVELOP':
        actionString = 'no longer is lead developer of';
        break;
    }

    switch (type) {
      case 'PROJECT':
        typeString = 'the project';
        dataString = '"' + data.name + '"';
        break;
      case 'CATEGORY':
        typeString = 'the category';
        dataString = '"' + data.name + '" in the project "' + parentData.name + '"';
        break;
      case 'REQUIREMENT':
        typeString = 'the requirement';
        dataString = '"' + data.name + '"';
        break;
      case 'COMMENT':
        typeString = 'a comment for the requirement';
        dataString = '"' + parentData.name + '"';
        break;
    }

    return actionString + ' ' + typeString + ' ' + dataString + '.';
  }

  /**
   * Handles the response coming from the request to the activity tracker service.
   *
   * @param e
   */
  _handleActivitiesResponse(e) {
    var activitiesResponse = e.detail.response;

    // check if we are updating (then, there is a parameter called 'after')
    if (e.target.params.after) {
      activitiesResponse.forEach(function(activity) {
        this.unshift('activities', activity);
      }.bind(this));
      if (activitiesResponse.length > 0) {
        this._fireNewActivitiesEvent(activitiesResponse);
      }
    } else {
      activitiesResponse.forEach(function(activity) {
        this.push('activities', activity);
      }.bind(this));
    }

    // Clear the lower threshold so we can load more data when the user scrolls down again.
    this.shadowRoot.getElementById('scrollThreshold').clearTriggers();
  }

  /**
   * Handles events coming from iron-ajax about the request status.
   * 
   * @param {CustomEvent} e 
   */
  _handleLoadingChanged(e) {
    //TODO update loading property
    this._loadingActivities = false;
    console.log('loading changed');
  }

  /**
   * Loads more activities from the service, usually as the effect of scrolling down. Queries with the 'before'
   * parameter to get activities that are older than the last one in the list.
   */
  _loadMoreData() {
    // check if the first request has already returned
    if (this.activities.length > 0) {
      this._params = {'limit': 5, 'before': this.activities[this.activities.length - 1].id};
    } else {
      this._params = {'limit': this.initialLimit};
    }

    this.shadowRoot.getElementById('activitiesRequest').generateRequest();
  }

  /**
   * Refreshes the activities from the server. Sends the 'after' query parameter to only get updates.
   */
  refresh() {
    if (this.activities.length > 0) {
      this._params = {'limit': 20, 'after': this.activities[0].id};
    }

    this.shadowRoot.getElementById('activitiesRequest').generateRequest();
  }

  /**
   * Fires activity-clicked event when user clicked an activity.
   *
   * @event activity was clicked
   * @param event
   */
  _handleActivityTap(e) {
    this.fire('activity-clicked', e.model.get('activity'));
  }

  /**
   * Fires new-activities-loaded event when that new activities are added via auto update.
   *
   * @event new activities are added via auto update
   * @param activities the number of newly loaded activities
   */
  _fireNewActivitiesEvent(activities) {
    this.fire('new-activities-loaded', activities.length);
  }

}

window.customElements.define('activity-tracker', ActivityTracker);
