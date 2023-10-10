import { Component, OnInit } from "@angular/core";
import { StepperProgress } from "src/app/core/models/stepper-progress";

@Component({
  selector: "app-content",
  templateUrl: "./content.component.html",
  styleUrls: ["./content.component.css"],
})
export class ContentComponent implements OnInit {
  readonly STEPPER_PROGRESS = StepperProgress;
  readonly StepperProgress: StepperProgress = StepperProgress.FIRST;
  constructor() {}

  ngOnInit() {}
}
