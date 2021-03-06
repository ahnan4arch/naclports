// Copyright 2011 The Native Client SDK Authors.
// Use of this source code is governed by a BSD-style license that can
// be found in the LICENSE file.

/**
 * @fileoverview  This class implements a mouse-drag event.  It registers for
 * mousedown events, and when it sees one, starts capturing mousemove events
 * until it gets a mousup event.  It manufactures three kinds of drag events:
 * DRAG_START, DRAG and DRAG_END.
 */

// The uikit namespace.
var uikit = uikit || {};

/**
 * Constructor for the Dragger.  Register for mousedown events that happen on
 * |opt_target|.  If |opt_target| is null or undefined, then this object
 * observes mousedown on the whole document.
 * @param {?Element} opt_target The event target.  Defaults to the whole
 *     document.
 * @constructor
 */
uikit.Dragger = function(target) {
  /**
   * The event target.
   * @type {Element}
   * @private
   */
  this.target_ = target || document;

  /**
   * The array of objects that is notified of drag events.  Each object in
   * this array get sent a handleStartDrag(), handleDrag() and handleEndDrag()
   * message.
   * @type {Array.<Object>}
   * @private
   */
  this.listeners_ = [];

  /**
   * Flag to indicate whether the object is in a drag sequence or not.
   * @type {boolean}
   * @private
   */
  this.isDragging_ = false;

  /**
   * The function objects that get attached as event handlers.  These are
   * cached so that they can be removed on mouse up.
   * @type {function}
   * @private
   */
  this.boundMouseMove_ = null;
  this.boundMouseUp_ = null;

  this.target_.addEventListener('mousedown',
                                this.onMouseDown.bind(this),
                                false);
}

/**
 * The ids used for drag event types.
 * @enum {string}
 */
uikit.Dragger.DragEvents = {
  DRAG_START: 'dragstart',  // Start a drag sequence
  DRAG: 'drag',  // Mouse moved during a drag sequence.
  DRAG_END: 'dragend'  // End a drag sewquence.
};

/**
 * Add a drag listener.  Each listener should respond to three methods:
 * handleStartDrag(), handleDrag() and handleEndDrag().  This method assumes
 * that |listener| does not already exist in the array of listeners.
 * @param {!Object} listener The object that will listen to drag events.
 */
uikit.Dragger.prototype.addDragListener = function(listener) {
  this.listeners_.push(listener);
}

/**
 * Handle a mousedown event: register for mousemove and mouseup, then tell
 * the target that is has a DRAG_START event.
 * @param {Event} event The mousedown event that triggered this method.  For
 *     more information on the DOM Event object, see:
 *     http://www.w3.org/TR/DOM-Level-3-Events/#events-mouseevents
 */
uikit.Dragger.prototype.onMouseDown = function(event) {
  this.boundMouseMove_ = this.onMouseMove.bind(this);
  this.boundMouseUp_ = this.onMouseUp.bind(this);
  this.target_.addEventListener('mousemove', this.boundMouseMove_);
  this.target_.addEventListener('mouseup', this.boundMouseUp_);
  this.isDragging_ = true;
  // Note: the offsetX/Y properties of the event are used because they are
  // relative to the top-left of the target which gets |event|.  The clientX/Y
  // properties are relative to the window.
  // TODO(dspringer): offsetX/Y are *not* part of the w3 DOM spec.  Need to
  // figure out how to do this with clientX/Y.
  var dragStartEvent = { type: uikit.Dragger.DragEvents.DRAG_START,
                         clientX: event.offsetX,
                         clientY: event.offsetY };
  var i;
  for (i = 0; i < this.listeners_.length; ++i) {
    this.listeners_[i].handleStartDrag(this.target_, dragStartEvent);
  }
}

/**
 * Handle a mousemove event: tell the target that is has a DRAG event.
 * @param {Event} event The mousemove event that triggered this method.
 */
uikit.Dragger.prototype.onMouseMove = function(event) {
  if (!this.isDragging_)
    return;
  var dragEvent = { type: uikit.Dragger.DragEvents.DRAG,
                    clientX: event.offsetX,
                    clientY: event.offsetY};
  var i;
  for (i = 0; i < this.listeners_.length; ++i) {
    this.listeners_[i].handleDrag(this.target_, dragEvent);
  }
}

/**
 * Handle a mouseup event: un-register for mousemove and mouseup, then tell
 * the target that is has a DRAG_END event.
 * @param {Event} event The mouseup event that triggered this method.
 */
uikit.Dragger.prototype.onMouseUp = function(event) {
  this.target_.removeEventListener('mouseup', this.boundMouseUp_, false);
  this.target_.removeEventListener('mousemove', this.boundMouseMove_, false);
  this.boundMouseUp_ = null;
  this.boundMouseMove_ = null;
  this.isDragging_ = false;
  var dragEndEvent = { type: uikit.Dragger.DragEvents.DRAG_END,
                       clientX: event.offsetX,
                       clientY: event.offsetY};
  var i;
  for (i = 0; i < this.listeners_.length; ++i) {
    this.listeners_[i].handleEndDrag(this.target_, dragEndEvent);
  }
}

/**
 * Bind a scope to a function.  Used to bind an object to |this| for event
 * handlers.
 * @param {!Object} scope The scope in which the function executes.  |scope|
 *     becomes |this| during function execution.
 * @return {function} the bound version of the original function.
 */
Function.prototype.bind = function(scope) {
  var boundContext = this;
  return function() {
    return boundContext.apply(scope, arguments);
  }
}
