/**
 * Arrow game main class.
 * @param {string|Element} listenElement - Element or ID to listen and handle key events..
 * @constructor
 */
ArrowGame = function(listenElement) {
  /**
   * @type {Element}
   * @private
   */
  this.listenElement_ = ArrowGame.isString(listenElement) ? document.getElementById(listenElement) : listenElement;

  if (this.listenElement_) {
    this.listenElement_.addEventListener('keydown', this.listenKeys_);
  } else {
    console.error('ArrowGame: events listener container is not set properly. Please, check it.');
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

  this.startCallback = null;
  this.playingCallback = null;
  this.stopCallback = null;

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


ArrowGame.prototype.onStart = function(f) {
  this.startCallback = f;
};


ArrowGame.prototype.onPlay = function(f) {
  this.playingCallback = f;
};


ArrowGame.prototype.onStop = function(f) {
  this.stopCallback = f;
};


/**
 * Keys listener.
 * @param {Event} e - Event.
 * @private
 */
ArrowGame.prototype.listenKeys_ = function(e) {
  var eventKey = e.keyCode;

  if (eventKey >= 37 && eventKey <= 40)
    e.preventDefault();

  if (!isNaN(ArrowGame.game.keyIndex_)) {
    var key = ArrowGame.CONFIG['keys'][ArrowGame.game.keyIndex_];
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
  this.startCallback.call(Window);
};


/**
 * Stops the game.
 */
ArrowGame.prototype.stop = function() {
  var context = {
    'counter': this.counter_
  };
  this.stopCallback.call(context);

  this.startTimestamp_ = NaN;
  this.keyIndex_ = NaN;
  clearInterval(this.intervalId_);
  this.counter_ = 0;
};


ArrowGame.prototype.intervalHandler_ = function() {
  var game = ArrowGame.game;
  var now = (new Date()).getTime();

  var mills = ArrowGame.CONFIG['interval'] - (now - game.startTimestamp_);
  if (mills < 0) {
    game.stop();
  } else {
    var key = ArrowGame.CONFIG['keys'][game.keyIndex_];
    var context = {
      'milliseconds': mills,
      'percent': ((mills / ArrowGame.CONFIG['interval']) * 100) + '%',
      'secondsRounded': (mills / 1000).toPrecision(2),
      'key': key['message'],
      'counter': game.counter_
    };
    game.playingCallback.call(context);
  }
};
