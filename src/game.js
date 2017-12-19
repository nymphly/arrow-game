/**
 * Arrow game main class.
 * @param {string|Element} listenElement - Element or ID to listen and handle key events..
 * @param {string|Element} messageElement - Element to display task message.
 * @param {string|Element} timeRemainingElement - Element to display time remaining.
 * @param {string|Element} counterElement - Element to display counter.
 * @constructor
 */
ArrowGame = function(listenElement, messageElement, timeRemainingElement, counterElement) {
  /**
   * @type {Element}
   * @private
   */
  this.listenElement_ = ArrowGame.isString(listenElement) ? document.getElementById(listenElement) : listenElement;

  /**
   * @type {Element}
   * @private
   */
  this.messageElement_ = ArrowGame.isString(messageElement) ? document.getElementById(messageElement) : messageElement;

  /**
   * @type {Element}
   * @private
   */
  this.timeRemainingElement_ = ArrowGame.isString(timeRemainingElement) ? document.getElementById(timeRemainingElement) : timeRemainingElement;

  /**
   * @type {Element}
   * @private
   */
  this.counterElement_ = ArrowGame.isString(counterElement) ? document.getElementById(counterElement) : counterElement;

  if (this.listenElement_ && this.messageElement_ && this.counterElement_) {
    this.listenElement_.addEventListener('keydown', this.listenKeys_);
  } else {
    console.error('ArrowGame: some of containers is not set properly. Please, check it.');
  }

  /**
   * Interval id.
   * @type {number}
   * @private
   */
  this.intervalId_ = NaN;

  /**
   * Start timestamp.
   * @type {number}
   * @private
   */
  this.startTimestamp_ = NaN;

  /**
   * Current key index.
   * @type {number}
   * @private
   */
  this.keyIndex_ = NaN;

  /**
   * User counter.
   * @type {number}
   * @private
   */
  this.counter_ = 0;

  /**
   * Game instance to store context.
   * NOTE: doesnt' work for multiple game instances.
   * @type {ArrowGame}
   */
  ArrowGame.game = this;
};


/**
 * Arrow game config.
 * @type {Object}
 */
ArrowGame.CONFIG = {
  'interval': 5000, //milliseconds.
  'keys': [
    {
      'message': 'Left Key',
      'keyCodes': [37]
    },
    {
      'message': 'Key Up',
      'keyCodes': [38]
    },
    {
      'message': 'Key Right',
      'keyCodes': [39]
    },
    {
      'message': 'Key Down',
      'keyCodes': [40]
    },
    {
      'message': 'Not Left',
      'keyCodes': [38, 39, 40]
    },
    {
      'message': 'Not Up',
      'keyCodes': [37, 39, 40]
    },
    {
      'message': 'Not Right',
      'keyCodes': [37, 38, 40]
    },
    {
      'message': 'Not Down',
      'keyCodes': [37, 38, 39]
    }
  ]
};


/**
 * Returns true if the specified value is a string.
 * @param {*} val - Variable to test.
 * @return {boolean} - Whether variable is a string.
 */
ArrowGame.isString = function(val) {
  return typeof val == 'string';
};


ArrowGame.prototype.getRandomKey = function() {
  var keys = ArrowGame.CONFIG['keys'];
  var random = Math.floor(Math.random() * keys.length);
  this.keyIndex_ = (random == this.keyIndex_) ? this.getRandomKey() : random;
  return this.keyIndex_;
};


/**
 * Keys listener.
 * @param {Event} e - Event.
 * @private
 */
ArrowGame.prototype.listenKeys_ = function(e) {
  e.preventDefault();
  if (!isNaN(ArrowGame.game.keyIndex_)) {
    var key = ArrowGame.CONFIG['keys'][ArrowGame.game.keyIndex_];
    var eventKey = e.keyCode;
    var checked = false;
    for (var i = 0; i < key['keyCodes'].length; i++) {
      var code = key['keyCodes'][i];
      if (code == eventKey) {
        checked = true;
        break;
      }
    }
    if (checked) {
      ArrowGame.game.startTimestamp_ = (new Date()).getTime();
      ArrowGame.game.counter_ += 1;
      ArrowGame.game.getRandomKey();
      ArrowGame.game.updateUserMessages_();
    } else {
      ArrowGame.game.stop();
    }
  } //else do nothing.
};


/**
 * Starts the game.
 */
ArrowGame.prototype.start = function() {
  this.startTimestamp_ = (new Date()).getTime();
  this.getRandomKey();
  this.intervalId_ = setInterval(this.intervalHandler_, 50);
};


/**
 * Stops the game.
 */
ArrowGame.prototype.stop = function() {
  this.startTimestamp_ = NaN;
  this.keyIndex_ = NaN;
  clearInterval(this.intervalId_);
  this.updateUserMessages_(true);
  this.counter_ = 0;
};


/**
 * Updates game messages.
 * @param {boolean=} opt_stop - Whether to stop the game.
 * @private
 */
ArrowGame.prototype.updateUserMessages_ = function(opt_stop) {
  if (opt_stop) {
    this.timeRemainingElement_.innerHTML = 'Ready to play';
    this.counterElement_.innerHTML = 'Game is stopped. Your record is ' + this.counter_;
    this.messageElement_.innerHTML = '';
  } else {
    var now = (new Date()).getTime();
    var mills = ArrowGame.CONFIG['interval'] - (now - this.startTimestamp_);
    if (mills < 0) {
      this.stop();
    } else {
      var rounded = (mills / 1000).toPrecision(2);
      this.timeRemainingElement_.innerHTML = rounded + ' seconds remaining.';
      var key = ArrowGame.CONFIG['keys'][this.keyIndex_];
      this.messageElement_.innerHTML = 'Press ' + key['message'];
      this.counterElement_.innerHTML = 'Current score is ' + this.counter_;
    }
  }
};



ArrowGame.prototype.intervalHandler_ = function() {
  ArrowGame.game.updateUserMessages_();
};
