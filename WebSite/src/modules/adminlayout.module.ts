import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  DashboardComponent,
  AutosComponent,
  ClientsComponent,
  ContainersComponent,
  SelectionsComponent,
  ResourcesComponent,
  PaymentComponent,
  BalanceComponent,
  BaseComponent,
  ArchiveComponent,
} from '../app/index';
import { AdminLayoutRoutes } from './adminlayout.routing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { GalleriaModule } from 'primeng/galleria';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { PasswordModule } from "primeng/password";
import { DividerModule } from "primeng/divider";
import { CalendarModule } from 'primeng/calendar';
import {
  NGTranslateHelperService,
  ClientService,
  AutoService,
  LookupService,
  UploadService,
  PaymentService,
  AutoImagesService,
  ContainerImagesService,
} from '../services/index';
import { InputTextModule } from 'primeng/inputtext';
import { NgImageSliderModule } from 'ng-image-slider';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
// import {MenuModule} from 'primeng/menu';
import {MenuItem} from 'primeng/api';
import { UseUtcDirective } from 'src/services/primengdate.directive';
import { StatusKeyPipe } from 'src/services/status-key.pipe';
export function httpTranslateLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  imports: [
    RouterModule.forChild(AdminLayoutRoutes),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoaderFactory,
        deps: [HttpClient],
      },
    }),
    NgxPaginationModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    FileUploadModule,
    GalleriaModule,
    MultiSelectModule,
    DropdownModule,
    NgImageSliderModule,
    PasswordModule,
    DividerModule,
    CalendarModule,
    InputTextModule
  ],
  declarations: [
    DashboardComponent,
    AutosComponent,
    ClientsComponent,
    ContainersComponent,
    SelectionsComponent,
    ResourcesComponent,
    PaymentComponent,
    BalanceComponent,
    BaseComponent,
    ArchiveComponent,
    UseUtcDirective,
    StatusKeyPipe
  ],
  exports: [],
  providers: [
    NGTranslateHelperService,
    DatePipe,
    ClientService,
    AutoService,
    LookupService,
    UploadService,
    AutoImagesService,
    ContainerImagesService,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class AdminLayoutModule {}
