import { EventHandler } from "../events";

/**
 * Notifies clients that a property value has changed.
 *
 * @remarks
 * This interface is typically implemented by observable objects that participate in data binding scenarios.
 * When a property value changes, the object raises the {@link INotifyPropertyChanged.onPropertyChanged} event
 * to notify any bound clients of the change.
 *
 * @see {@link IPropertyChangedEventArgs}
 */
export interface INotifyPropertyChanged {
  /**
   * Subscribes to property change notifications.
   * @param handler - a function to call when one or more properties have changed.
   * @returns a token used to cancel the event subscription.
   */
  readonly onPropertyChanged: (handler: EventHandler<IPropertyChangedEventArgs>) => Disposable;
}

/**
 * Provides data for the {@link INotifyPropertyChanged.onPropertyChanged} event.
 */
export interface IPropertyChangedEventArgs {
  /**
   * The names of the properties that changed,
   * or `undefined` to indicate that all properties on the object may have changed.
   */
  readonly propertyNames?: readonly string[];
}
