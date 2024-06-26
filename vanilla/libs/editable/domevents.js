class Event {

    isActive = false;
    object;
    handler;
    eventName;

    constructor(object, eventName, handler) {
        this.object = object;
        this.eventName = eventName;
        this.handler = handler;
        this.isActive = true;
    }

    cleanup() {
        if (this.isActive) {
            console.log(`Removing event-listener: ${this.eventName} on ${typeof this.object}`);
            this.object.removeEventListener(this.eventName, this.handler);
            this.isActive = false;
        }
    }
}

// <summary>
//  Helper class that keeps track of domEventshandlers 
//  and enables a central cleanup method for removing all handlers
// </summary>
export class DomEvents {

    eventList = [];

    /**
     * Add an eventlistener on the given html-element
     * @param {HTMLElement} object - html-element to add eventlistener to
     * @param {*} eventName - name of event
     * @param {*} handler - callback
     */
    add(object, eventName, handler) {
        // console.log(`Adding event-listener: ${eventName} on ${object.tagName}`);
        object.addEventListener(eventName, handler);
        this.eventList.push(new Event(object, eventName, handler));    
    }

    addForCleanup(object, eventName, handler) {
        this.eventList.push(new Event(object, eventName, handler));
    }

    cleanup() {
        for (var i = 0; i < this.eventList.length; i++) {
            this.eventList[i].Cleanup();
        }
        this.eventList.length = 0;
    }

}