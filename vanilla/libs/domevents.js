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
            console.log(`Removing evet-listener: ${this.eventName} on ${typeof this.object}`);
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

    create(object, eventName, handler) {
        console.log(`Adding event-listener: ${this.eventName} on ${typeof this.object}`);
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