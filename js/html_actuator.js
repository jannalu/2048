function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");

  this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  var flavor = this.flavors[tile.value] || "Rainbow swirl";
  var scoop = document.createElement("span");
  scoop.classList.add("ice-cream-scoop");
  var flavorIndex = this.flavorOrder.indexOf(tile.value);
  if (flavorIndex < 0) flavorIndex = 12;
  scoop.style.backgroundPosition = ((flavorIndex % 4) * 100 / 3) + "% " +
    (Math.floor(flavorIndex / 4) * 100 / 3) + "%";
  if (tile.value === 64 || tile.value === 32768) {
    var imageName = tile.value === 64 ? "rocky-road" : "chocolate-chip";
    scoop.style.backgroundImage = "url(style/scoops/" + imageName + ".png)";
    scoop.style.backgroundSize = "contain";
    scoop.style.backgroundPosition = "center";
  }
  scoop.setAttribute("aria-hidden", "true");
  inner.setAttribute("role", "img");
  inner.setAttribute("aria-label", flavor + ", " + tile.value);
  inner.appendChild(scoop);

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "You win!" : "Game over!";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};

HTMLActuator.prototype.flavors = {
  2: "Vanilla",
  4: "Strawberry",
  8: "Chocolate",
  16: "Cookie dough",
  32: "Mint chip",
  48: "Neapolitan",
  64: "Rocky road",
  128: "Pistachio",
  256: "Mango",
  512: "Cookies & cream",
  1024: "Coffee",
  2048: "Birthday cake",
  4096: "Rainbow swirl",
  8192: "Salted caramel",
  16384: "Raspberry",
  32768: "Chocolate chip"
};

HTMLActuator.prototype.flavorOrder = [2, 4, 8, 16, 32, 48, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768];
