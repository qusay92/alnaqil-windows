import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AutoById, SearchBalance, StatusType } from 'src/models/models';
import {
  AutoService,
  ClientService,
  LoginService,
  ResourcesService,
} from 'src/services';
import { Galleria } from 'primeng/galleria';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../base/base.component';
import { DOCUMENT } from '@angular/common';
import { appSettings } from 'src/appSettings/appSettings';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css'],
})
export class BalanceComponent extends BaseComponent implements OnInit {
  searchForm: UntypedFormGroup;
  searchPaidForm: UntypedFormGroup;
  searchAllForm: UntypedFormGroup;
  carNames: any;
  clientNames: any;
  searchmodel: SearchBalance = new SearchBalance();
  autos: any[] = [];
  openAutos: any[] = [];
  paidAutos: any[] = [];
  summation: any=[{
    total:0,
    paid:0,
    required:0
  }
  ];
  openSummation: any=[{
    total:0,
    paid:0,
    required:0
  }
  ];
  paidSummation: any=[{
    total:0,
    paid:0,
    required:0
  }
  ];;
  page: any=1;
  paidpage: any=1;
  openpage: any=1;
  showClear: boolean = false;
  showPaidClear: boolean = false;
  showAllClear: boolean = false;
  search: string = '';
  clients: any[] = [];
  clientBalance: any=[{
    total:0,
    paid:0,
    required:0
  }
  ];
  clientpage: any=1;
  selectAuto: AutoById = new AutoById();

  images: any[] = [];
  @ViewChild('galleria') galleria!: Galleria;
  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5,
    },
    {
      breakpoint: '768px',
      numVisible: 3,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
    },
  ];
  activeIndex: number = 0;
  showThumbnails: boolean = true;
  fullscreen: boolean = false;
  onFullScreenListener: any;
  paginate=appSettings.pageinate;

  constructor(
    fb: UntypedFormBuilder,
    private autoService: AutoService,
    private spinner: NgxSpinnerService,
    private clientService: ClientService,
    private toastr: ToastrService,
    public translate: TranslateService,
    public loginService: LoginService,
    public resource: ResourcesService,
    @Inject(DOCUMENT) public document: Document
  ) {
    super(loginService, translate, resource, document);
    
    this.LoadCarName();
    this.LoadClientName();
    this.LoadClientBalances();
    this.LoadBalances(true,  new SearchBalance());

    this.searchForm = fb.group({
      autoId: [],
      vinNo: [],
      purchaseDate: [],
      clientId: [],
    });
    this.searchPaidForm = fb.group({
      autoId: [],
      vinNo: [],
      purchaseDate: [],
      clientId: [],
    });
    this.searchAllForm = fb.group({
      autoId: [],
      vinNo: [],
      purchaseDate: [],
      clientId: [],
    });
  }

  ngOnInit(): void {

  }

  LoadCarName() {
    this.autoService.GetCarName().subscribe(
      (res) => {
        if (res && res?.status == StatusType.Success) {
          this.carNames = res.data;
        }
      },
      (err) => {}
    );
  }

  LoadClientName() {
    this.autoService.GetClientNameByUser().subscribe(
      (res) => {
        if (res && res?.status == StatusType.Success) {
          this.clientNames = res.data;
        }
      },
      (err) => {}
    );
  }

  searchbalance() {
    this.showClear = true;
    this.searchmodel = Object.assign({}, this.searchForm.value);
    this.searchmodel.isSearch = true;
    this.LoadBalances(true, this.searchmodel);
    this.page=1;
    this.openpage=1;
    this.paidpage=1;
    this.clientpage=1;
  }
  searchPaidbalance() {
    this.showPaidClear = true;
    this.searchmodel = Object.assign({}, this.searchPaidForm.value);
    this.searchmodel.isSearch = true;
    this.LoadBalances(true, this.searchmodel);
    this.page=1;
    this.openpage=1;
    this.paidpage=1;
    this.clientpage=1;
  }
  searchAllbalance() {
    this.showAllClear = true;
    this.searchmodel = Object.assign({}, this.searchAllForm.value);
    this.searchmodel.isSearch = true;
    this.LoadBalances(true, this.searchmodel);
    this.page=1;
    this.openpage=1;
    this.paidpage=1;
    this.clientpage=1;
  }

  clearSearchForm() {
    this.searchForm.reset();
    this.LoadBalances(false, new SearchBalance());
    this.showClear = false;
    this.page=1;
    this.openpage=1;
    this.paidpage=1;
    this.clientpage=1;
  }

  clearSearchPaidForm() {
    this.searchPaidForm.reset();
    this.LoadBalances(false, new SearchBalance());
    this.showPaidClear = false;
    this.page=1;
    this.openpage=1;
    this.paidpage=1;
    this.clientpage=1;
  }

  clearSearchAllForm() {
    this.searchAllForm.reset();
    this.LoadBalances(false, new SearchBalance());
    this.showAllClear = false;
    this.page=1;
    this.openpage=1;
    this.paidpage=1;
    this.clientpage=1;
  }

  LoadBalances(showPinner = true, search: SearchBalance) {
    if (showPinner) {
      this.spinner.show();
    }

    this.clientService.GetClientsInfo(search).subscribe(
      (res) => {
        if (res && res?.status == StatusType.Success && res.data != null) {
          this.autos = res.data.autoDetails;
          this.summation = res.data.summation;
          this.openAutos = res.data.openAutos;
          this.paidAutos = res.data.paidAutos;
          this.openSummation = res.data.openSummation;
          this.paidSummation = res.data.paidSummation;
          this.spinner.hide();
        } else if (
          res?.status == StatusType.Failed &&
          res.errors != null &&
          res.errors.length > 0
        ) {
          for (let i = 0; i < res.errors.length; i++) {
            this.toastr.error('', res.errors[i]);
          }
        }
      },
      (err) => {
        this.toastr.error('Error', '');
      }
    );
  }

  LoadClientBalances(search = '') {
    search = this.search != null ? this.search : search;
    this.spinner.show();

    this.clientService.GetClientsBalance(search).subscribe(
      (res) => {
        if (res && res?.status == StatusType.Success && res.data != null) {
          this.clients = res.data.autoDetails;
          this.clientBalance = res.data.autoFooter;
          this.spinner.hide();
        } else if (
          res?.status == StatusType.Failed &&
          res.errors != null &&
          res.errors.length > 0
        ) {
          for (let i = 0; i < res.errors.length; i++) {
            this.toastr.error('', res.errors[i]);
          }
        }
      },
      (err) => {
        this.toastr.error('Error', '');
      }
    );
  }

  filterGlobal(evt: any) {
    this.clientpage=1;
    this.search = evt.target.value;
    this.LoadClientBalances(evt.target.value);
  }

  openImagePopup(autoId: number) {
    this.images = [];
    this.spinner.show();
    this.autoService.GetAutoById(autoId).subscribe(
      (res) => {
        this.selectAuto = res.data;
        for (let i = 0; i < res.data.images.length; i++) {
          let toBeReplaced = 'assets/uploaded/';
          this.images.push({
            image: toBeReplaced + res.data.images[i].title,
            thumbImage: toBeReplaced + res.data.images[i].title,
            alt: '',
            title: ''
          })
          // res.data.images[i].previewImageSrc =
          //   toBeReplaced + res.data.images[i].title;
          // res.data.images[i].thumbnailImageSrc =
          //   toBeReplaced + res.data.images[i].title;
        }

        // this.images = res.data.images;
        this.spinner.hide();
      },
      (err) => {
        this.spinner.hide();
      }
    );
  }

  galleriaClass() {
    return `custom-galleria ${this.fullscreen ? 'fullscreen' : ''}`;
  }

  onThumbnailButtonClick() {
    this.showThumbnails = !this.showThumbnails;
  }

  fullScreenIcon() {
    return `pi ${
      this.fullscreen ? 'pi-window-minimize' : 'pi-window-maximize'
    }`;
  }

  toggleFullScreen() {
    if (this.fullscreen) {
      // this.closePreviewFullScreen();
    } else {
      this.openPreviewFullScreen();
    }
  }

  onFullScreenChange() {
    this.fullscreen = !this.fullscreen;
  }

  openPreviewFullScreen() {
    let elem = this.galleria.element.nativeElement.querySelector('.p-galleria');
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem['mozRequestFullScreen']) {
      /* Firefox */
      elem['mozRequestFullScreen']();
    } else if (elem['webkitRequestFullscreen']) {
      /* Chrome, Safari & Opera */
      elem['webkitRequestFullscreen']();
    } else if (elem['msRequestFullscreen']) {
      /* IE/Edge */
      elem['msRequestFullscreen']();
    }
  }
}
