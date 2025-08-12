/**
 * Service for dynamically creating and managing catch information popup components.
 * Handles component lifecycle, DOM attachment/detachment, and cleanup for map markers.
 */
import { Injectable, ApplicationRef, ComponentRef, createComponent, Injector, inject } from '@angular/core';
import { CatchPopupComponent } from '../components/catch-popup/catch-popup.component';
import { Catch } from '../models/catch';

@Injectable({
  providedIn: 'root'
})
export class CatchInfoPopupService {
  private appRef = inject(ApplicationRef);
  private injector = inject(Injector);

  createCatchInfoPopup(catchItem: Catch): { element: HTMLElement, componentRef: ComponentRef<CatchPopupComponent> } {
    // Create the component
    const componentRef = createComponent(CatchPopupComponent, {
      environmentInjector: this.appRef.injector,
      elementInjector: this.injector
    });
    
    // Set inputs
    componentRef.instance.catchItem = catchItem;
    
    // Subscribe to close event
    componentRef.instance.close.subscribe(() => {
      this.destroyPopup(componentRef);
    });
    
    // Attach to the DOM and detect changes
    this.appRef.attachView(componentRef.hostView);
    componentRef.changeDetectorRef.detectChanges();
    
    // Get DOM element
    return { element: componentRef.location.nativeElement as HTMLElement, componentRef };
  }

  public destroyPopup(componentRef: ComponentRef<CatchPopupComponent>): void {
    this.appRef.detachView(componentRef.hostView);
    componentRef.destroy();
  }
} 