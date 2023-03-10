// src/app/shared/free-dragging.directive.ts

import { DOCUMENT } from "@angular/common";
import { Directive, ElementRef, Inject, OnDestroy, OnInit } from "@angular/core";
import { fromEvent, Subscription, takeUntil } from "rxjs";

@Directive({
    selector: "[appFreeDragging]",
  })
  export class FreeDraggingDirective implements OnInit, OnDestroy {
    private element!: HTMLElement;
  
    private subscriptions: Subscription[] = [];
    private wasDropped: boolean;
  
    constructor(
      private elementRef: ElementRef,
      @Inject(DOCUMENT) private document: any
    ) {this.wasDropped = false;}
  
    ngOnInit(): void {
      this.element = this.elementRef.nativeElement as HTMLElement;
      this.initDrag();
    }
  
    initDrag(): void {
        if (!this.wasDropped) {
            console.log("yellow1");
            // 1
    const dragStart$ = fromEvent<MouseEvent>(this.element, "mousedown");
    const dragEnd$ = fromEvent<MouseEvent>(this.document, "mouseup");
    const drag$ = fromEvent<MouseEvent>(this.document, "mousemove").pipe(
      takeUntil(dragEnd$)
    );

    // 2
    let initialX: number,
      initialY: number,
      currentX = 0,
      currentY = 0;

    let dragSub!: Subscription;

    // 3
    const dragStartSub = dragStart$.subscribe((event: MouseEvent) => {
      initialX = event.clientX - currentX;
      initialY = event.clientY - currentY;
      this.element.classList.add('free-dragging');

      // 4
      dragSub = drag$.subscribe((event: MouseEvent) => {
        event.preventDefault();

        currentX = event.clientX - initialX;
        currentY = event.clientY - initialY;

        this.element.style.transform =
          "translate3d(" + currentX + "px, " + currentY + "px, 0)";
      });
    });

    // 5
    const dragEndSub = dragEnd$.subscribe(() => {
      initialX = currentX;
      initialY = currentY;
      this.element.classList.remove('free-dragging');
      const elems = document.elementsFromPoint(currentX, currentY);
      console.log(elems[elems.length - 1]);
      console.log(elems);
      console.log(document.elementFromPoint(currentX, currentY))
      if (elems[elems.length - 1].getAttribute("class") == "square-multiplier") {
        console.log("yellow");
        elems[elems.length - 1].appendChild(this.element);
        this.wasDropped = true;
      }
      if (dragSub) {
        dragSub.unsubscribe();
      }
    });

    // 6
    this.subscriptions.push.apply(this.subscriptions, [
      dragStartSub,
      dragSub,
      dragEndSub,
    ]);
    
        }
      
    }
  
    ngOnDestroy(): void {
      this.subscriptions.forEach((s) => s?.unsubscribe());
    }
  }
  