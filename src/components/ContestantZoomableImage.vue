<template>
  <div
    class="activator-button"
    @click="openPopup"
  >
    <img class="contestant-image" :src="(imageBaseUrl + contestant.id + '/image?gci' + contestant.imageUpdate)" loading="lazy" alt="&nbsp;"/>
  </div>
  <div v-if="isOpen" class="popup-bg">
    <div class="popup-window">
      <div class="window-title-bar d-flex flex-row">
        <div class="flex-grow-1 flex-shrink-1">
          <div style="font-size: 1.5rem; color: #fff">{{contestant.title}} </div>
          <div style="font-size: 0.8">{{ contestant.name }}</div>
        </div>
        <div class="flex-grow-0 flex-shrink-0 button" @click="fitZoom">
          Cela slika
        </div>
        <div class="flex-grow-0 flex-shrink-0 button" @click="fullZoom">100%</div>
        <div class="flex-grow-0 flex-shrink-0 button red" @click="closePopup">Zapri</div>
      </div>

      <div class="window-content drag-container" ref="draggable">
        <!-- <div class="debug">
          <pre>
          TRS ————————————————————
          {{ trs }}


          DIMS ———————————————————
          {{ dims }}
        </pre>
        </div> -->
        <div class="drag-content-anchor">
          <div
            class="drag-content"
            :style="{
              left: trs.x + 'px',
              top: trs.y + 'px',
              transform: 'translate(-50%, -50%) scale(' + trs.zoom + ')',
              width: dims.imageWidth + 'px',
              height: dims.imageHeight + 'px'
            }"
          >
            <img
              :src="(imageBaseUrl + contestant.id + '/image-full?gci' + contestant.imageUpdate)"
              @load="handleImageLoaded"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { Options, Vue } from 'vue-class-component';
import http from '@/http-common';

@Options({
  props: [
    'contestant'
  ],
  emits: [
    'onRated'
  ]
})
export default class ContestantZoomableImage extends Vue {
  isOpen = false;
  imageBaseUrl = '';

  trs = {
    isDrag: false,
    x: 0,
    y: 0,
    zoom: 1,
    baseZoom: 1,
    scrollZoom: 1
  };

  dims = {
    imageWidth: 0,
    imageHeight: 0,
    displayedWidth: 0,
    displayedHeight: 0,
    clientWidth: 0,
    clientHeight: 0,
    offsetLimits: {}
  };

  async created() {
    this.imageBaseUrl = `${http.defaults.baseURL}contestants/`;
  }


  openPopup() {
    this.isOpen = true;
    this.$nextTick( () => {
      this.$refs.draggable.addEventListener('mousedown', this.handleMouseDown);
      this.$refs.draggable.addEventListener('mouseup', this.handleMouseUp);
      this.$refs.draggable.addEventListener('mouseleave', this.handleMouseUp);
      this.$refs.draggable.addEventListener('mousemove', this.handleMouseMove);
      this.$refs.draggable.addEventListener('touchmove', this.handleMouseMove);
      this.$refs.draggable.addEventListener('wheel', this.handleScroll);

      // pinch zoom
      // this.$refs.draggable.addEventListener('pointerdown', this.handlePointerDown);
      // this.$refs.draggable.addEventListener('pointermove', this.handlePointerMove);
      // this.$refs.draggable.addEventListener('pointerup', this.handlePointerUp);
      // this.$refs.draggable.addEventListener('pointercancel', this.handlePointerUp);
      // this.$refs.draggable.addEventListener('pointerout', this.handlePointerUp);
      // this.$refs.draggable.addEventListener('pointerleave', this.handlePointerUp);
    });
  }

  closePopup() {
    this.$refs.draggable.removeEventListener('mousedown', this.handleMouseDown);
    this.$refs.draggable.removeEventListener('mouseup', this.handleMouseUp);
    this.$refs.draggable.removeEventListener('mouseleave', this.handleMouseUp);
    this.$refs.draggable.removeEventListener('mousemove', this.handleMouseMove);
    this.$refs.draggable.removeEventListener('touchmove', this.handleMouseMove);
    this.$refs.draggable.removeEventListener('wheel', this.handleScroll);
    this.isOpen = false;
  }

  fitZoom() {
    const {clientWidth, clientHeight} = this.$refs.draggable;
    const {imageWidth, imageHeight} = this.dims;

    const zoomX = clientWidth / imageWidth;
    const zoomY = clientHeight / imageHeight;

    this.trs.baseZoom = Math.min(zoomX, zoomY);
    this.trs.zoom = this.trs.baseZoom;

    this.dims = {
      imageWidth, imageHeight, clientWidth, clientHeight,
      displayedWidth: imageWidth * this.trs.zoom,
      displayedHeight: imageHeight * this.trs.zoom
    };

    this.handleImagePosition();
  }

  fullZoom() {
    this.trs.baseZoom = 1;
    this.trs.zoom = 1;
    this.handleImagePosition();
  }

  eventCache = [];
  handlePointerDown(event) {
    this.eventCache.push(event);
    console.log('pointer down:', event);
  }

  // MDN theft intensifies
  prevDiff = 0;
  handlePointerMove(ev) {
    // This function implements a 2-pointer horizontal pinch/zoom gesture.
    //
    // If the distance between the two pointers has increased (zoom in),
    // the target element's background is changed to "pink" and if the
    // distance is decreasing (zoom out), the color is changed to "lightblue".
    //
    // This function sets the target element's border to "dashed" to visually
    // indicate the pointer's target received a move event.
    console.log("pointerMove", ev);

    // Find this event in the cache and update its record with this event
    const index = this.eventCache.findIndex(
      (cachedEv) => cachedEv.pointerId === ev.pointerId
    );
    this.eventCache[index] = ev;

    // If two pointers are down, check for pinch gestures
    if (this.eventCache.length === 2) {
      // Calculate the distance between the two pointers
      const curDiff = Math.abs(this.eventCache[0].clientX - this.eventCache[1].clientX);

      if (this.prevDiff > 0) {
        if (curDiff > this.prevDiff) {
          // The distance between the two pointers has increased
          console.log("Pinch moving OUT -> Zoom in", ev);
        }
        if (curDiff < this.prevDiff) {
          // The distance between the two pointers has decreased
          console.log("Pinch moving IN -> Zoom out", ev);
        }
      }

      // Cache the distance for the next move event
      this.trs.scrollZoom += curDiff - this.prevDiff;
      this.handleZoom()

      this.prevDiff = curDiff;
      ev.preventDefault;
    }
  }

  handlePointerUp(event) {
    console.log('pointer ended:', event);
    const index = this.eventCache.findIndex(
      (cachedEv) => cachedEv.pointerId === event.pointerId
    );
    if (index !== -1) {
      this.eventCache.splice(index, 1);
    }
  }

  handleImageLoaded(event) {
    console.log('image loaded:', event)

    // determine zoom needed to get contain fit on the image:
    const {naturalWidth: imageWidth, naturalHeight: imageHeight} = event.target;
    this.dims = {
      imageWidth, imageHeight
    };

    this.fitZoom();
  }

  handleImagePosition() {
    // determine min offset - image can't go any more left ←← than this
    let minX = (this.dims.clientWidth - this.dims.displayedWidth) / this.trs.zoom;
    let minY = (this.dims.clientHeight - this.dims.displayedHeight) / this.trs.zoom;

    // console.log('min x:', minX, minY)

    // center if necessary
    if (minX > 0) {
      minX = 0;
    }
    if (minY > 0) {
      minY /= 2;
    }

    // // determine max offset - image can't go any more right →→ than this
    let maxX = (this.dims.displayedWidth - this.dims.clientWidth) / this.trs.zoom;
    let maxY = (this.dims.displayedHeight - this.dims.clientHeight) / this.trs.zoom;

    // // handle cases where image is smaller than our viewport
    if (maxX < 0) {
      maxX = minX;
    }
    if (maxY < 0) {
      maxY = minY;
    }

    if (this.trs.x <= minX) {
      this.trs.x = minX;
    } else if (this.trs.x > maxX) {
      this.trs.x = maxX;
    }

    if (this.trs.y <= minY) {
      this.trs.y = minY;
    } else if (this.trs.y > maxY) {
      this.trs.y = maxY;
    }

    this.dims.offsetLimits = {
      minX, maxX, minY, maxY
    }
  }

  handleMouseDown(event) {
    this.trs.isDrag = true;
    event.preventDefault();
  }

  handleMouseUp(event) {
    this.trs.isDrag = false;
    event.preventDefault();
  }

  handleTouchMove(event) {
    console.log('received mousemove event!', event);
  }

  handleMouseMove(event) {
    if (this.trs.isDrag) {
      this.trs.x += event.movementX;
      this.trs.y += event.movementY;

      this.handleImagePosition();
      event.preventDefault();
    }
  }

  handleScroll(event) {
    this.trs.scrollZoom -= (event.deltaY / 250);
    this.handleZoom()
  }
  handleZoom() {
    this.trs.zoom = this.trs.scrollZoom * this.trs.baseZoom;

    // ensure image can't be smaller than base zoom
    this.trs.zoom = Math.max(this.trs.zoom, this.trs.baseZoom);
    console.log('zoom:', this.trs.zoom, 'must be greater or equal to:', this.trs.baseZoom);

    // ensure image can't be zoomed further than 400% native
    this.trs.zoom = Math.min(this.trs.zoom, 4);

    this.dims = {
      ...this.dims,
      displayedWidth: this.dims.imageWidth * this.trs.zoom,
      displayedHeight: this.dims.imageHeight * this.trs.zoom
    }
    console.log('trs zoom:', this.trs.zoom)

    event.preventDefault();
    this.handleImagePosition();
  }

}
</script>
<style lang="scss" scoped>

.popup-bg {
  display: block;
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  backdrop-filter: blur(16px);

  .window-title-bar {
    background: #000;
    padding: 0.25rem 1rem;
    display: flex;
    align-items: center;
    z-index: 99999999;

    &.fixed {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
    }
  }

  .popup-window {
    background-color: rgba(0,0,0,0.5);
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
  }

}

.button-row {
  justify-content: center;
  align-items: center;
}

.rate-button {
  background-color: rgba(0,0,0,0.5);
  margin: 0.125rem;
  width: 9%;
  aspect-ratio: 1;
  text-align: center;

  border: 1px solid rgba(#fa6, 0.5);

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 2.5rem;
  font-weight: 300;

  &.selected {
    background-color: #fa6;
    color: #000
  }
}

.button {
  padding: 1rem 3rem;
  margin: 0.5rem 0.25rem;
  border: 1px solid rgba(#fa6, 0.5);
  color: #fa6;

  &.red {
    border: 1px solid #f00;
    background: rgba(255,0,0,0.25);
    color: #f00;
    margin-left: 2rem;
  }
}

.activator-button {
  display: block;
  width: 100%;
  height: 100%;
  min-width: 100px;
  min-height: 100px;
}

.drag-container {
  position: relative;

  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  .debug {
    position: absolute;
    top: 0;
    left: 0;
    padding: 1rem;
    z-index: 909999;
    background-color: rgba(0,0,0,0.5);
  }

  .drag-content-anchor {
    width: 1px;
    height: 1px;
    position: relative;
    overflow: visible;
  }

  .drag-content {
    position: absolute;
  }
}
</style>
