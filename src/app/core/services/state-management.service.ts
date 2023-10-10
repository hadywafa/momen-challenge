import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { StepperProgress } from "../models/stepper-progress";

@Injectable({ providedIn: "root" })
export class StateManagementService {
  constructor() {
    this.stepperStatusSubject = new BehaviorSubject<StepperProgress>(StepperProgress.FIRST);
    this.stepperStatus = this.stepperStatusSubject.asObservable();
  }
  private stepperStatusSubject: BehaviorSubject<StepperProgress>;
  stepperStatus: Observable<StepperProgress>;
  updateStepperStatus(status: StepperProgress) {
    this.stepperStatusSubject.next(status);
  }
}
