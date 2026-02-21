(function() {
    const SCROLL_ZONE = 80;     
    const SCROLL_SPEED = 12;    
    let scrollRAF = null;
    let latestClientY = null;

    function stopAutoScroll() {
        if (scrollRAF) {
            cancelAnimationFrame(scrollRAF);
            scrollRAF = null;
        }
    }

    function autoScrollTick() {
        if (latestClientY == null) return;

        var viewportH = window.innerHeight;
        var distFromTop = latestClientY;
        var distFromBottom = viewportH - latestClientY;

        var speed = 0;

        // Scroll UP
        if (distFromTop < SCROLL_ZONE) {
            speed = -SCROLL_SPEED * (1 - distFromTop / SCROLL_ZONE);
        }
        // Scroll DOWN
        else if (distFromBottom < SCROLL_ZONE) {
            speed = SCROLL_SPEED * (1 - distFromBottom / SCROLL_ZONE);
        }

        if (speed !== 0) {
            window.scrollBy(0, speed);
            scrollRAF = requestAnimationFrame(autoScrollTick);
        } else {
            stopAutoScroll();
        }
    }

    function startAutoScroll(clientY) {
        latestClientY = clientY;

        if (!scrollRAF) {
            scrollRAF = requestAnimationFrame(autoScrollTick);
        }
    }

    Card.prototype.handleTouchStart = function(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.touchStartTime = Date.now();
        this.initialTransform = this.$element.style.transform || '';
    };

    Card.prototype.handleTouchMove = function(e) {
        const touch = e.touches[0];

        if (this.isDragging) {

            const deltaX = touch.clientX - this.touchStartX;
            const deltaY = touch.clientY - this.touchStartY;

            // Move the card visually
            this.$element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            startAutoScroll(touch.clientY);

            e.preventDefault();
            return;
        }

        // Drag threshold detection
        const deltaX = Math.abs(touch.clientX - this.touchStartX);
        const deltaY = Math.abs(touch.clientY - this.touchStartY);
        const deltaTime = Date.now() - this.touchStartTime;

        if (
            deltaTime > this.dragTimeThreshold &&
            (deltaX > this.dragThreshold || deltaY > this.dragThreshold)
        ) {
            this.isDragging = true;
            this.callbacks.onDragStart(this.id);
            this.$element.classList.add('card--dragging');
            e.preventDefault();
        }
    };

    Card.prototype.handleTouchEnd = function(e) {

        // Always stop scroll loop
        stopAutoScroll();
        latestClientY = null;

        if (!this.isDragging) return;

        this.isDragging = false;

        this.$element.classList.remove('card--dragging');
        this.$element.style.transform = this.initialTransform;

        const touch = e.changedTouches[0];
        const elementAtPoint = document.elementFromPoint(
            touch.clientX,
            touch.clientY
        );

        if (elementAtPoint) {
            const $columnTasks = elementAtPoint.closest('.column__tasks');
            if ($columnTasks) {
                const $column = $columnTasks.closest('.column');
                if ($column) {
                    const columnName = $column.dataset.column;

                    const dropEvent = new CustomEvent('cardTouchDrop', {
                        detail: {
                            taskId: this.id,
                            columnName,
                            clientY: touch.clientY,
                            element: elementAtPoint
                        }
                    });

                    $column.dispatchEvent(dropEvent);
                }
            }
        }

        this.callbacks.clearDraggedTaskId();
    };

})();