/**
 * This module contains utilities for synchronization between _asynchronous_ tasks.
 * Because JavaScript is using single-threaded execution model, there is no need for _synchronous_ synchronization
 * between the threads.
 * 
 * Some of them may do trivial job and contain no tricks, but hopefully can help you find
 * a bit of familiarity with native applications.
 * 
 * @module
 */
export * from "./semaphore";
export * from "./synchronizationContext";
