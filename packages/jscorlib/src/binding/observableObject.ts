import { EventEmitter, EventHandler } from "../events";
import { INotifyPropertyChanged, IPropertyChangedEventArgs } from "./notifyPropertyChanged";

/**
 * A base class for objects that notify subscribers when their properties change.
 * 
 * @remarks
 * * Do not confuse with `Observable<T>` from `rxjs` library.
 *    The latter represents a asynchronous stream of data.
 * * Derived classes should call {@link _notifyPropertyChanged} whenever a property value changes.
 * 
 * @example
 * ```typescript
 * class Person extends ObservableObject {
 *   private _name: string = "";
 *   
 *   public get name(): string { return this._name; }
 *   public set name(value: string) {
 *     if (this._name !== value) {
 *       this._name = value;
 *       this._notifyPropertyChanged("name");
 *     }
 *   }
 * }
 * ```
 */
export abstract class ObservableObject implements INotifyPropertyChanged {
  private readonly _propertyChangedEmitter = new EventEmitter<IPropertyChangedEventArgs>();

  /**
   * Subscribes to property change notifications.
   * @param handler a function to call when any property has changed.
   * @returns a token used to cancel the event subscription.
   */
  public readonly onPropertyChanged = (handler: EventHandler<IPropertyChangedEventArgs>): Disposable => {
    return this._propertyChangedEmitter.subscribe(handler);
  };

  /**
   * Notifies subscribers that one or more properties have changed.
   * @param propertyNames - The names of the properties that changed.
   * 
   * @remarks
   * Call this method from derived classes after changing property values.
   * If no property names are provided, it indicates that all properties may have changed.
   */
  protected _notifyPropertyChanged(...propertyNames: Array<keyof this>): void {
    this._propertyChangedEmitter.invoke({
      propertyNames: propertyNames.length > 0 ? propertyNames as string[] : undefined,
    });
  }
}
