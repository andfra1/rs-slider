function unSlickSlider(selector) {
    console.log("unSlickSlider on board!");
    var _this = this;
    var baseClassPrefix = "rs-slider";

    this.commonSettings = {
        baseClassPrefix: baseClassPrefix,
        defaultWrapperClass: baseClassPrefix + "-wrapper",
        slideWidth: [],
        trackWidth: 0,
        track: "",
        translateValue: 0,
        trackClass: baseClassPrefix + "-slide-track",
        trackOuterClass: baseClassPrefix + "-slide-track-outer",
    };

    this.selector = document.querySelector(selector);
    this.selector.classList.add(this.commonSettings.defaultWrapperClass); //dodanie klasy
    this.slides = Array.from(this.selector.children); //zamiana HTMLColl na tablice

    this.slides.forEach(function (slide, idx) {
        _this.commonSettings.slideWidth.push(slide.scrollWidth); //utworzenie tablicy z szerokoscia elem
        _this.commonSettings.trackWidth += slide.scrollWidth; //track width
        slide.setAttribute('data-rs-index', idx);
    });
    console.log(this.commonSettings);
}


unSlickSlider.prototype.run = function (userSetings) {
    var _this = this;

    this.set = {
        slideCreateClass: this.commonSettings.baseClassPrefix + "-item",
        sliderInterval: 1000,
        startAt: 0,
        arrowNext: '<button>next</button>',
        arrowPrev: '<button>prev</button>'
    };
    this.set = Object.assign({}, this.set, userSetings);
    console.log(this.set);

    this.slidesClipboard = this.selector.innerHTML; //kopia html

    this.makeTrack = function (common, settings) {
        this.selector.innerHTML = "";
        common.trackOuter = document.createElement("div");
        common.trackOuter.className = common.trackOuterClass;

        common.track = document.createElement("div");
        common.track.className = common.trackClass;
        common.track.style.width = common.trackWidth + "px";
        common.track.innerHTML = this.slidesClipboard;

        common.trackOuter.append(common.track);
        common.trackOuter.insertAdjacentHTML('beforeend', (settings.arrowNext + settings.arrowPrev));
        this.selector.append(common.trackOuter);
    };
    this.makeTrack(this.commonSettings, this.set);

    console.log(_this.slidesWidth);
    console.log(_this.set.startAt);

    setInterval(function () {
        if (_this.commonSettings.translateValue >= _this.commonSettings.trackWidth) {
            _this.commonSettings.translateValue = 0;
        }
        _this.commonSettings.track.style.transform = "translateX(-" + _this.commonSettings.translateValue + "px)";
        _this.commonSettings.translateValue += _this.commonSettings.slideWidth[_this.set.startAt];
    }, _this.set.sliderInterval);
};

function rsSlider(selector) {
    return new unSlickSlider(selector);
}

//document.addEventListener('DOMContentLoaded', function(){
rsSlider(".wrapper").run();
//});
