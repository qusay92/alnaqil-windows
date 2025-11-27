import { Directive, Host, HostListener, Self } from "@angular/core";
import { Calendar } from "primeng/calendar";

@Directive({
    selector: '[useUtc]'
  })
  export class UseUtcDirective {
  
    constructor(@Host() @Self() private calendar: Calendar) { }
  
    @HostListener('onSelect', ['$event']) onSelect() {
      this.toUtc();
    }
  
    @HostListener('onInput', ['$event']) onInput() {
      this.toUtc();
    }
  
    private toUtc(){
      this.calendar.value = new Date(Date.UTC(this.calendar.value.getFullYear()
        , this.calendar.value.getMonth()
        , this.calendar.value.getDate()
        ,0, 0, 0));
      this.calendar.updateModel(this.calendar.value);
    }
  }