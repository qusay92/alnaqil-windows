import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AutoById, Container, ContainerById, Payment, SearchAuto, SearchContainer, StatusType } from 'src/models/models';
import { AutoImagesService, AutoService, ContainerImagesService, ContainerService, LoginService, LookupService, PaymentService, ResourcesService, UploadService } from 'src/services';
import { Galleria } from 'primeng/galleria';
import * as JSZip from 'jszip';
import { saveAs } from "file-saver";
import * as jSZipUtils from '../../assets/js/jszip-utils.js';
import { BaseComponent } from '../base/base.component';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';
import { appSettings } from 'src/appSettings/appSettings';
import { Auto } from 'src/models/models'; // adjust path as needed


// to reduce the image size
// this is second solution
import {Ng2ImgMaxService} from 'ng2-img-max';
import { forkJoin, Observable, Observer, of } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Component({
  selector: 'app-containers',
  templateUrl: './containers.component.html',
  styleUrls: ['./containers.component.css'],
})
export class ContainersComponent extends BaseComponent implements OnInit {
  searchForm: UntypedFormGroup;
  searchmodel: SearchContainer = new SearchContainer();
  clients: any;
  lookup_loadPort: any;
  lookup_destination: any;
  lookup_shippingCompany: any;
  page: any=1;
  pagepayment: any;
  sideMenuList: any[] = [];
  showArchive = 0;
  containers: any[] = [];
  showDialog = false;
  showDeleteAllDialog = false;
  showArchiveAllDialog = false;
  showArchiveDialog = false;
  showDeleteDialog = false;
  showDeleteImagesDialog = false;
  model: Container = new Container();
  ngAddUpdateForm: UntypedFormGroup;
  files: File[] = [];
  formData = new FormData();
  isSubmitted: boolean = false;
  autoList: any[] = [];
  selectContainer: ContainerById = new ContainerById();
  images: any[] = [];
  autoImages: any[] = [];
  @ViewChild('galleria') galleria!: Galleria;
  @ViewChild('galleriaCont') galleriaCont!: Galleria;
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
  activeIndex_auto :number= 0;
  showThumbnails: boolean = true;
  fullscreen: boolean = false;
  onFullScreenListener: any;
  selectAuto: AutoById = new AutoById();
  paymentmodel: Payment = new Payment();
  totaldebit = 0;
  totalcredit = 0;
  required = 0;
  paymentDetails: any;
  paymentType = 0;
  checkedAutos: number = 0;
  showClear: boolean = false;
  departurePortIdValidation = false;
  destinationIdValidation = false;
  archiveItem : any;
  deleteItem : any;
  deleteImagesItem : any;
  paginate=appSettings.pageinate;

  // added code to get the data from the data base per page size
  currentPage: number = 1;  // initialize currentPage to 1 (or whatever your default)
  pageSize: number = appSettings.pageSize;  // initialize pageSize to your preferred page size
  totalRecords: number = 0;
  Math = Math;
  

  constructor(
    fb: UntypedFormBuilder,
    public containerService: ContainerService,
    private autoService: AutoService,
    private lookupService: LookupService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private uploadService: UploadService,
    private containerImagesService: ContainerImagesService,
    private paymentService: PaymentService,
    private autoImageService:AutoImagesService,
    public translate: TranslateService,
    public loginService: LoginService,
    public resource: ResourcesService,
    private cdr: ChangeDetectorRef,
    // to reduce the image size
    private ng2ImgMax: Ng2ImgMaxService,

    @Inject(DOCUMENT) public document: Document
  ) {
    super(loginService,translate, resource,document);
    this.searchForm = fb.group({
      containerNo: [],
      bookingNo: [],
      loadingFromDate: [],
      loadingToDate: [],
      loadPortId: [],
      destinationId: [],
      shippingLineId: [],
      clientId: [],
      arrivalFromDate: [],
      arrivalToDate: [],
    });

    this.ngAddUpdateForm = fb.group({
      id: [],
      creationUserId: [],
      creationDate: [],
      serialNumber: ['', Validators.required],
      bookNo: ['', [Validators.required]],
      departurePortId: ['', [Validators.required]],
      destinationId: ['', [Validators.required]],
      shippingCompanyId: ['', [Validators.required]],
      departureDate: ['', [Validators.required]],
      arrivalDate: ['', [Validators.required]],
      autoIds: ['',[Validators.required]]    
    });
  }

  ngOnInit(): void {
    this.LoadContainers(true, this.searchmodel);
    this.LoadClients();
    this.LoadLookups();
    this.LoadSideMenu();
    // this code cometted to display the vin number comes from the db  in the list while add new container
    //this.LoadAutos();
  }
  onChangeAccordion(i: any) {
    if(i.label==="All"){
    this.sideMenuList.forEach(item => {
      if(item.label !== "All")
      item.show = !item.show; // You may need to adjust this based on your data structure
    });
    this.cdr.detectChanges();
    }

  }
  searchContainer() {
    this.showClear = true;
    this.searchmodel = Object.assign({}, this.searchForm.value);
    this.searchmodel.isSearch = true;
    this.page=1;
    // added code to get the data from the data base per page size
    this.currentPage=1;
    
    this.LoadContainers(true, this.searchmodel);
  }

  clearSearchForm() {
    this.showClear = false;
    this.searchForm.reset();
    this.page=1;
    // added code to get the data from the data base per page size
    this.currentPage=1;
   this.searchmodel = new SearchContainer();
    this.LoadContainers(true, new SearchContainer());
  }

  LoadContainers(showPinner = true, search: SearchContainer) {
    if (showPinner) {
      this.spinner.show();
    }

    //this.containerService.getAllByUser(search).subscribe(
    // added code to get the data from the data base per page size
    this.containerService.getAllByUser(search,this.currentPage,this.pageSize).subscribe(
      (res) => {
        this.containers = res.data;
        this.spinner.hide();
        // added code to get the data from the data base per page size
        this.totalRecords=res.totalRecords;
      },
      (err) => {
        this.spinner.hide();
      }
    );
  }

  // added code to get the data from the data base per page size
  nextPage() {
      if ((this.currentPage * this.pageSize) < this.totalRecords) {
        this.currentPage++;
        this.LoadContainers(true, this.searchmodel);
      }
    }  

  // added code to get the data from the data base per page size
  prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.LoadContainers(true, this.searchmodel);
      }
    } 

  LoadClients() {
    this.autoService.GetClients().subscribe(
      (res) => {
        if (res && res?.status == StatusType.Success) {
          this.clients = res.data;
        }
      },
      (err) => {}
    );
  }

  /*LoadAutos() {
    let search: SearchAuto = new SearchAuto();
    this.autoService.GetAllByUser(search).subscribe(res => {
      for (let i = 0 ; i < res.data.length ; i++) {
        this.autoList.push({label: (res.data[i].vinNo), value: res.data[i].id});
      }
    }, err => {
    });
  }*/

  // added code to get the data from the data base per page size
 // this code cometted to display the vin number comes from the db  in the list while add new container
  /*LoadAutos() {
    let search: SearchAuto = new SearchAuto();

    this.autoService.GetAllByUser(search, this.currentPage, this.pageSize).subscribe(res => {
      const autos: Auto[] = res.data; // ✅ explicitly tell TypeScript the type
      this.autoList = autos.map((item: Auto) => ({ label: item.vinNo, value: item.id }));
    }, err => {
      // handle error if needed
    });
  }*/



  LoadLookups() {
    this.lookupService.GetAllLookupValues().subscribe((res) => {
      this.lookup_loadPort = res.data.filter((x: any) => x.lookupId == 2);
      this.lookup_destination = res.data.filter((x: any) => x.lookupId == 5);
      this.lookup_shippingCompany = res.data.filter(
        (x: any) => x.lookupId == 6
      );
    });
  }

  LoadSideMenu() {
    let isArchive =
      <any>this.showArchive == true || this.showArchive == 1 ? 1 : 0;
      // debugger;
    this.containerService.GetSideMenuByUser(isArchive).subscribe(
      (res) => {
        if (res) {
          this.sideMenuList = [];
          this.sideMenuList.push({
            label: 'All',
            labeltext: 'All',
            awaitingload: res.all.awaitingload,
            departured: res.all.departured,
            arrived: res.all.arrived,
            show:true
          });
          for (let i = 0; i < res.filteredContainers.length; i++) {
            this.sideMenuList.push({
              label: res.filteredContainers[i].departurePort,
              labeltext: res.filteredContainers[i].departurePort.replace(/\s/g, ""),
              departurePortId: res.filteredContainers[i].departurePortId,
              awaitingload: res.filteredContainers[i].awaitingload,
              departured: res.filteredContainers[i].departured,
              arrived: res.filteredContainers[i].arrived,
              show:true
            });
          }
        }
      },
      (err) => {}
    );
  }

  onSideItemClick(item: any, status: any) {
    let search = new SearchContainer();
    search.StatusId = status;
    if (item != null) {
      if (item.label == 'All') {
        this.LoadContainers(false, search);
      } else {
        search.loadPortId = item.loadPortId;
        this.LoadContainers(false, search);
      }
    } else {
      this.LoadContainers(false, search);
    }
  }

  openImagePopup(id: number) {
    this.images = [];
    this.activeIndex = 0;
    this.spinner.show();
    this.containerService.GetContainerById(id).subscribe(
      (res) => {
        this.selectContainer = res.data;
        for (let i = 0; i < res.data.images.length; i++) {
          let toBeReplaced = '../assets/uploaded/';
          this.images.push({
            image: toBeReplaced + res.data.images[i].title,
            thumbImage: toBeReplaced + res.data.images[i].title,
            alt: '',
            imagepath: toBeReplaced + res.data.images[i].title,
            imagetitle: res.data.images[i].title,
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

  openDialog(){
    this.showDialog = true;
    this.isSubmitted = false;

    this.model = new Container();
    this.model.status = 1;
  }

  hideDialog(): void {
  this.showDialog = false;
  this.ngAddUpdateForm.reset();
  // this to Clear VIN input and list in auto select list 
  this.resetManualAutoSelection(); 
  super.RemoveBlackScreen();
}

  openDeleteAllDialog() {
    this.showDeleteAllDialog = true;
  }
  openArchiveAllDialog() {
    this.showArchiveAllDialog = true;
  }
  openArchiveDialog(item: any) {
    this.archiveItem = item;
    this.showArchiveDialog = true;
  }
  openDeleteDialog(item: any) {
    this.deleteItem = item;
    this.showDeleteDialog = true;
  }
  openDeleteImagesDialog(item: any) {
    this.deleteImagesItem = item;
    this.showDeleteImagesDialog = true;
  }

  openAutoPopup(id: number) {
    this.spinner.show();
    this.autoImages = [];
    this.activeIndex_auto = 0;
    this.autoService.GetAutoById(id).subscribe(
      (res) => {
        this.selectAuto = res.data;

        for (let i = 0; i < res.data.images.length; i++) {
          let toBeReplaced = '../assets/uploaded/';
          this.autoImages.push({
            image: toBeReplaced + res.data.images[i].title,
            thumbImage: toBeReplaced + res.data.images[i].title,
            alt: '',
            imagepath: toBeReplaced + res.data.images[i].title,
            imagetitle: res.data.images[i].title,
            title: ''
          })
          // res.data.images[i].previewImageSrc =
          //   toBeReplaced + res.data.images[i].title;
          // res.data.images[i].thumbnailImageSrc =
          //   toBeReplaced + res.data.images[i].title;
        }

        // this.autoImages = res.data.images;
        this.spinner.hide();
      },
      (err) => {
        this.spinner.hide();
      }
    );

    this.GetPayment(id);
  }

  GetPayment(autoId: number) {
    this.paymentService.GetPayment(autoId).subscribe(
      (res) => {
        if (res && res?.status == StatusType.Success && res.data != null) {
          this.totaldebit = res.data.debitAmount;
          this.totalcredit = res.data.creditAmount;
          this.paymentDetails = res.data.paymentDetails;
          this.required = this.totaldebit - this.totalcredit;
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

  deleteAutoImage(image: any,autoId:number){
    if (image && image.id && image.id > 0) {
      this.autoImageService.DeleteAutoImage(image.id).subscribe(
        (res) => {
          if (res && res?.status == StatusType.Success) {
            //this.getImages(image.autoid);
            this.translate.get(['ArchiveComponent.DeleteSuccessfully']).subscribe(res => {
              this.toastr.success('', res['ArchiveComponent.DeleteSuccessfully']);
            });
          this.checkedAutos = 0;

            this.getAutoImages(autoId);
            //super.RemoveBlackScreen();
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
        (err) => {}
      );
    }
  }
  getAutoImages(autoId: number) {
    this.autoImageService.getImagesByAuto(autoId).subscribe(
      (response) => {
        this.spinner.hide();
        if (
          response &&
          response.status == StatusType.Success &&
          response.data
        ) {
          for (let i = 0; i < response.data.length; i++) {
            let toBeReplaced = 'assets/uploaded/';
            this.autoImages.push({
              image: toBeReplaced + response.data[i].title,
              thumbImage: toBeReplaced + response.data[i].title,
              alt: '',
              imagepath: toBeReplaced + response.data[i].title,
              imagetitle: response.data[i].title,
              title: ''
            })
            // response.data[i].previewImageSrc =
            //   toBeReplaced + response.data[i].title;
            // response.data[i].thumbnailImageSrc =
            //   toBeReplaced + response.data[i].title;
          }

          // this.autoImages = response.data;
        }
      },
      (err) => {
        this.spinner.hide();
      }
    );
  }


  deleteAutoImages(id:number){
    this.autoService.DeleteImages(id).subscribe(
      (res) => {
        this.spinner.hide();
        if (res && res?.status == StatusType.Success) {
          this.showDialog = false;
          this.ngAddUpdateForm.reset();
          this.translate.get(['ArchiveComponent.DeleteSuccessfully']).subscribe(res => {
            this.toastr.success('', res['ArchiveComponent.DeleteSuccessfully']);
          });
          this.checkedAutos = 0;

          //super.RemoveBlackScreen();
        } else {
          if (
            res?.status == StatusType.Failed &&
            res.errors &&
            res.errors.length > 0
          ) {
            for (let i = 0; i < res.errors.length; i++) {
              this.toastr.error('', res.errors[i]);
            }

            this.spinner.hide();
          }
        }
      },
      (err) => {
        this.spinner.hide();
      }
    );
  }


  editContainer(container: any) {
  this.model = Object.assign({}, container);
  this.model.departureDate = new Date(this.model.departureDate);
  this.model.arrivalDate = new Date(this.model.arrivalDate);
  this.model.isArchive = (this.model.isArchive == 1) ? 1 : 0;

  this.showDialog = true;
}


  DeleteAllContainers() {
    const selectedContainers = this.containers.filter((cont) => cont.checked);
    if (selectedContainers && selectedContainers.length > 0) {
      this.containerService.DeleteContainers(selectedContainers).subscribe(
        (res) => {
          if (res && res?.status == StatusType.Success) {
            this.LoadContainers(true, this.searchmodel);
            this.showDeleteAllDialog = false;
            this.translate.get(['ArchiveComponent.DeleteSuccessfully']).subscribe(res => {
              this.toastr.success('', res['ArchiveComponent.DeleteSuccessfully']);
            });
          this.checkedAutos = 0;

            super.RemoveBlackScreen();
          } else {
            if (
              res?.status == StatusType.Failed &&
              res.errors &&
              res.errors.length > 0
            ) {
              for (let i = 0; i < res.errors.length; i++) {
                this.toastr.error('', res.errors[i]);
              }
              this.spinner.hide();
            }
          }
        },
        (err) => {
          this.spinner.hide();
        }
      );
    } else {
      this.translate.get(['ArchiveComponent.SelectAtLeastOneContainer']).subscribe(res => {
        this.toastr.warning('', res['ArchiveComponent.SelectAtLeastOneContainer']);
      });
    }
  }

  archiveAllContainers() {
    const selectedcontainers = this.containers.filter((cont) => cont.checked);
    if (selectedcontainers && selectedcontainers.length > 0) {
      this.containerService.ArchiveContainers(selectedcontainers).subscribe(
        (res) => {
          if (res && res?.status == StatusType.Success) {
            this.LoadContainers(true, this.searchmodel);
            this.LoadSideMenu();
            this.showArchiveAllDialog = false;
            this.translate.get(['ArchiveComponent.ArchiveSuccessfully']).subscribe(res => {
              this.toastr.success('', res['ArchiveComponent.ArchiveSuccessfully']);
            });
          this.checkedAutos = 0;

            super.RemoveBlackScreen();
          } else {
            if (
              res?.status == StatusType.Failed &&
              res.errors &&
              res.errors.length > 0
            ) {
              for (let i = 0; i < res.errors.length; i++) {
                this.toastr.error('', res.errors[i]);
              }
              this.spinner.hide();
            }
          }
        },
        (err) => {
          this.spinner.hide();
        }
      );
    } else {
      this.translate.get(['ArchiveComponent.SelectAtLeastOneContainer']).subscribe(res => {
        this.toastr.warning('', res['ArchiveComponent.SelectAtLeastOneContainer']);
      });
    }
  }

  archiveContainer() {
    this.containerService.ArchiveContainer(this.archiveItem.id).subscribe(
      (res) => {
        this.spinner.hide();
        if (res && res?.status == StatusType.Success) {
          this.LoadContainers(false, this.searchmodel);
          this.LoadSideMenu();
          this.showArchiveDialog = false;
          this.translate.get(['ArchiveComponent.ArchiveSuccessfully']).subscribe(res => {
            this.toastr.success('', res['ArchiveComponent.ArchiveSuccessfully']);
          });
          this.checkedAutos = 0;

          super.RemoveBlackScreen();
        } else {
          if (
            res?.status == StatusType.Failed &&
            res.errors &&
            res.errors.length > 0
          ) {
            for (let i = 0; i < res.errors.length; i++) {
              this.toastr.error('', res.errors[i]);
            }

            this.spinner.hide();
          }
        }
      },
      (err) => {
        this.spinner.hide();
      }
    );
  }

  deleteContainer() {
    this.containerService.DeleteContainer(this.deleteItem.id).subscribe(
      (res) => {
        this.spinner.hide();
        if (res && res?.status == StatusType.Success) {
          this.LoadContainers(false, this.searchmodel);
          this.LoadSideMenu();
          this.showDeleteDialog = false;
          this.translate.get(['ArchiveComponent.DeleteSuccessfully']).subscribe(res => {
            this.toastr.success('', res['ArchiveComponent.DeleteSuccessfully']);
          });
          this.checkedAutos = 0;

          super.RemoveBlackScreen();
        } else {
          if (
            res?.status == StatusType.Failed &&
            res.errors &&
            res.errors.length > 0
          ) {
            for (let i = 0; i < res.errors.length; i++) {
              this.toastr.error('', res.errors[i]);
            }

            this.spinner.hide();
          }
        }
      },
      (err) => {
        this.spinner.hide();
      }
    );
  }

  deleteImages(){
    this.containerService.DeleteImages(this.deleteImagesItem.id).subscribe(
      (res) => {
        this.spinner.hide();
        if (res && res?.status == StatusType.Success) {
          this.LoadContainers(false, this.searchmodel);
          this.showDeleteImagesDialog = false;
          this.translate.get(['ArchiveComponent.DeleteSuccessfully']).subscribe(res => {
            this.toastr.success('', res['ArchiveComponent.DeleteSuccessfully']);
          });
          this.checkedAutos = 0;
          super.RemoveBlackScreen();
        } else {
          if (
            res?.status == StatusType.Failed &&
            res.errors &&
            res.errors.length > 0
          ) {
            for (let i = 0; i < res.errors.length; i++) {
              this.toastr.error('', res.errors[i]);
            }

            this.spinner.hide();
          }
        }
      },
      (err) => {
        this.spinner.hide();
      }
    );
  }

  /*saveContainer(){
    this.isSubmitted = true;
    this.validationCheck();
    if (this.ngAddUpdateForm.valid) {
      this.spinner.show();
      this.model = this.ngAddUpdateForm.value;
      this.containerService.SaveContainer(this.model).subscribe( (res) => {
          let emptyAttachments = this.files.length < 1;
          if (this.files.length < 1) {
            this.spinner.hide();
          }

          if (res && res?.status == StatusType.Success) {
            this.LoadContainers(true, this.searchmodel);
            this.LoadSideMenu();
            this.translate.get(['ArchiveComponent.SavedSuccessfully','ArchiveComponent.UpdateSuccessfully']).subscribe(res => {
              this.toastr.success(
                '',
                this.model.id < 1 || this.model.id == null || this.model.id == undefined
                  ? res['ArchiveComponent.SavedSuccessfully']
                  : res['ArchiveComponent.UpdateSuccessfully']
              );
            });
          this.checkedAutos = 0;
            super.RemoveBlackScreen();
            this.showDialog = false;
            let containerId = this.model.id < 1 || this.model.id == null || this.model.id == undefined ? res.data[0].id : this.model.id;
            this.UploadHandler(containerId);
            this.LoadContainers(true, this.searchmodel);
          } else {
            if (
              res?.status == StatusType.Failed &&
              res.errors &&
              res.errors.length > 0
            ) {
              for (let i = 0; i < res.errors.length; i++) {
                this.toastr.error('', res.errors[i]);
              }
              this.spinner.hide();
            }
          }
        },
        (err) => {
          this.spinner.hide();
        }
      );
    }
  }*/

    saveContainer() {
  this.isSubmitted = true;
  console.log('[saveContainer] Form submitted');

  this.validationCheck();
  console.log('[saveContainer] Form Valid?', this.ngAddUpdateForm.valid);
  console.log('[saveContainer] Form Model:', this.ngAddUpdateForm.value);

  if (this.ngAddUpdateForm.valid) {
    this.spinner.show();
    this.model = this.ngAddUpdateForm.value;
    console.log('[saveContainer] Sending model to backend:', this.model);

    this.containerService.SaveContainer(this.model).subscribe(
      (res) => {
        console.log('[saveContainer] Backend response:', res);

        const emptyAttachments = this.files.length < 1;
        console.log('[saveContainer] Are there attachments?', !emptyAttachments);

        if (emptyAttachments) {
          this.spinner.hide();
        }

        if (res && res.status === StatusType.Success) {
          console.log('[saveContainer] Container saved successfully');

          this.LoadContainers(true, this.searchmodel);
          console.log('[saveContainer] Reloading containers');

          this.LoadSideMenu();
          console.log('[saveContainer] Reloading side menu');

          this.translate.get([
            'ArchiveComponent.SavedSuccessfully',
            'ArchiveComponent.UpdateSuccessfully'
          ]).subscribe((messages) => {
            const message = this.model.id < 1 || this.model.id == null
              ? messages['ArchiveComponent.SavedSuccessfully']
              : messages['ArchiveComponent.UpdateSuccessfully'];

            this.toastr.success('', message);
            console.log('[saveContainer] Toastr message shown:', message);
          });

          this.checkedAutos = 0;
          super.RemoveBlackScreen();
          console.log('[saveContainer] Black screen removed');

          this.showDialog = false;
          const containerId =
            this.model.id < 1 || this.model.id == null
              ? res.data[0].id
              : this.model.id;

          console.log('[saveContainer] Uploading files to container ID:', containerId);
          this.UploadHandler(containerId);

          this.LoadContainers(true, this.searchmodel);
          // this to Clear VIN input and list in auto select list 
          this.resetManualAutoSelection();
        } else {
          console.warn('[saveContainer] Save failed with errors:', res?.errors);
          if (res?.status === StatusType.Failed && res.errors?.length > 0) {
            for (let i = 0; i < res.errors.length; i++) {
              this.toastr.error('', res.errors[i]);
              console.error(`[saveContainer] Error ${i}:`, res.errors[i]);
            }
          }
          this.spinner.hide();
        }
      },
      (err) => {
        console.error('[saveContainer] HTTP error occurred:', err);
        this.spinner.hide();
      }
    );
  } else {
    console.warn('[saveContainer] Form is invalid. Fix validation errors.');
  }
}


  // old code 
  /*onFileSelect(event: any) {
    this.files = event.files;
    if (this.files.length > 0) {
      this.formData = new FormData();
      this.formData.delete('files');
      Array.from(this.files).forEach((file) => {
        this.formData.append('files', file, file.name);
      });
    }
  }*/

  // Second Solution
  /*onFileSelect(event: any): void {
    this.files = event.files;
    if (this.files.length > 0) {
      Array.from(this.files).forEach((file) => {
        this.compressImage(file); // Compress each file before appending
      });
    }
  }

  compressImage(file: any): void {
    this.ng2ImgMax.compressImage(file, 0.2) // Specify the compression ratio (e.g., 0.5 for 50%)
      .subscribe((result: Blob) => {
        // Convert the Blob to File (optional, depending on your API requirements)
        const compressedFile = new File([result], file.name, { type: file.type });
//debugger
//console.error('size compressing image:', compressedFile.size);
//console.error('size image:', file.size);

        // Append the compressed file to FormData
        this.formData.append('files', compressedFile, compressedFile.name);
      }, (error) => {
        console.error('Error compressing image:', error);
      });
  }*/

  //Third Solution
  onFileSelect(event: any): void {
    this.files = event.files;
    if (this.files.length > 0) {
      this.spinner.show();      // Show loading indicator
      const compressionObservables: Observable<File>[] = [];
      Array.from(this.files).forEach((file) => {
        compressionObservables.push(this.compressImage(file, 0.2)); // Compress each file and store the observable
      });
  
      forkJoin(compressionObservables).subscribe(
        (compressedFiles: File[]) => {
          console.log('All images compressed successfully.');
          // Here you can proceed with further actions, such as uploading the compressed files using this.formData
          compressedFiles.forEach((compressedFile) => {
            this.formData.append('files', compressedFile, compressedFile.name); // Append compressed file to FormData
          });
          this.spinner.hide();          // Hide loading indicator once compression is complete
        },
        (error) => {
          console.error('Error compressing images:', error);
          this.spinner.hide();  // Hide loading indicator if an error occurs during compression
        }
      );
    }
  }
  
  compressImage(file: File, quality: number): Observable<File> {
    return new Observable((observer: Observer<File>) => {
      const reader = new FileReader();
  
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
  
          if (!ctx) {
            observer.error('Could not get 2D rendering context.');
            return;
          }
  
          canvas.width = img.width;
          canvas.height = img.height;
  
          ctx.drawImage(img, 0, 0);
  
          canvas.toBlob((blob: Blob | null) => {
            if (!blob) {
              observer.error('Could not generate Blob.');
              return;
            }
  
            const compressedFile = new File([blob], file.name, { type: file.type });
            observer.next(compressedFile); // Emit compressed file
            observer.complete();
          }, file.type, quality);
        };
  
        img.src = reader.result as string;
      };
  
      reader.readAsDataURL(file);
    });
  }


  onFileDelete(event: any) {
    var files = this.formData.getAll('files');
    this.formData.delete('files');
    files.forEach((value: any) => {
      if (value.name != event.file.name) {
        this.formData.append('files', value, value.name);
      }
    });
  }

  onUploadCancel() {
    this.files = [];
    this.formData = new FormData();
  }

  UploadHandler(containerId: number) {
    this.uploadService.uploadFile(this.formData, 0, 2 , containerId).subscribe(
      (res) => {
        this.spinner.hide();
        this.onUploadCancel();
      },
      (err) => {
        this.spinner.hide();
      }
    );
  }

  deleteImage(image: any,containerId: number) {
    if (image && image.id && image.id > 0) {
      this.containerImagesService.DeleteContainerImage(image.id).subscribe(
        (res) => {
          if (res && res?.status == StatusType.Success) {
            this.translate.get(['ArchiveComponent.DeleteSuccessfully']).subscribe(res => {
              this.toastr.success('', res['ArchiveComponent.DeleteSuccessfully']);
            });
          this.checkedAutos = 0;

            this.getImages(containerId);
           // this.toastr.success('', 'Delete Successfully');
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
        (err) => {}
      );
    }
  }

  getImages(containerId: number) {
    this.containerImagesService.getImagesByContainer(containerId).subscribe(
      (response) => {
        this.spinner.hide();
        if (
          response &&
          response.status == StatusType.Success &&
          response.data
        ) {
          for (let i = 0; i < response.data.length; i++) {
            let toBeReplaced = '../assets/uploaded/';
            this.images.push({
              image: toBeReplaced + response.data[i].title,
              thumbImage: toBeReplaced + response.data[i].title,
              alt: '',
              imagepath: toBeReplaced + response.data[i].title,
              imagetitle: response.data[i].title,
              title: ''
            })
            // response.data[i].previewImageSrc =
            //   toBeReplaced + response.data[i].title;
            // response.data[i].thumbnailImageSrc =
            //   toBeReplaced + response.data[i].title;
          }

          // this.images = response.data;
        }
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

  toggleContainerFullScreen() {

    if (this.fullscreen) {
      // this.closePreviewFullScreen();
    } else {
      this.openPreviewFullScreenContainer();
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

  openPreviewFullScreenContainer(){
    let elem = this.galleriaCont.element.nativeElement.querySelector('.p-galleria');
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

  onCheckboxChange(event: any) {
    if (event.target.checked) {
      this.checkedAutos = this.checkedAutos + 1;
    } else {
      this.checkedAutos = this.checkedAutos - 1;
    }
  }

  validationCheck() {
    if (this.ngAddUpdateForm.value.departurePortId == '') {
      this.departurePortIdValidation = true;
    }

    if (this.ngAddUpdateForm.value.destinationId == '') {
      this.destinationIdValidation = true;
    }
  }

  onChangeDeparturePort(event: any) {
    if ((this.model.departurePortId == null) || (this.model.departurePortId == 0)){
      this.departurePortIdValidation = true;
    } else this.departurePortIdValidation = false;
  }

  onChangeDestination(event: any) {
    if ((this.model.destinationId == null) || (this.model.destinationId == 0)){
      this.destinationIdValidation = true;
    } else this.destinationIdValidation = false;
  }


  
  DownlaodAll(){
    const zip = new JSZip();
    const name = this.selectContainer.serialNumber + '.zip';  
    
    let count = 0;

    this.images.forEach((url) => {
      // i put the imagetitle as a file name insted of title because the title appeared above the image on the slider
      //const filename = url['title'];
      const filename = url['imagetitle'];

    //Old Code
    //jSZipUtils.getBinaryContent(url['previewImageSrc'], (err:any, data:any) => {
    jSZipUtils.getBinaryContent(url['imagepath'], (err:any, data:any) => {
      if (err) {
        throw err;
      }

      zip.file(filename, data, {binary: true});
      count++;

      if (count === this.images.length) {
        zip.generateAsync({type: 'blob'}).then((content) => {
          const objectUrl: string = URL.createObjectURL(content);
          const link: any = document.createElement('a');

          link.download = name;
          link.href = objectUrl;
          link.click();
        });
      }
    });
  });
}


  
DownlaodAllAutoImages(){
  const zip = new JSZip();
  const name = this.selectAuto.vinNo + '.zip';  
  
  let count = 0;

  this.autoImages.forEach((url) => {
    // i put the imagetitle as a file name insted of title because the title appeared above the image on the slider
    //const filename = url['title'];
    const filename = url['imagetitle'];

  //Old Code
  //jSZipUtils.getBinaryContent(url['previewImageSrc'], (err:any, data:any) => {
  jSZipUtils.getBinaryContent(url['imagepath'], (err:any, data:any) => {
    if (err) {
      throw err;
    }

    zip.file(filename, data, {binary: true});
    count++;

    if (count === this.autoImages.length) {
      zip.generateAsync({type: 'blob'}).then((content) => {
        const objectUrl: string = URL.createObjectURL(content);
        const link: any = document.createElement('a');

        link.download = name;
        link.href = objectUrl;
        link.click();
      });
    }
  });
});
}

// this code added to convert the auto multi select to manual select
// for vin nuber in add auto
manualVinInput: string = '';
// Method to add manual VIN
  addManualVin() {
  if (!this.manualVinInput || this.manualVinInput.trim() === '') return;

  const trimmedVin = this.manualVinInput.trim().toUpperCase();

  // Check if VIN is already in the list
  const existsInList = this.autoList.some(item =>
    item.label.toUpperCase() === trimmedVin
  );
  if (existsInList) {
    this.toastr.warning('VIN already exists in the list');
    this.manualVinInput = '';
    return;
  }

  // Call backend to get real AutoId by VIN
  this.autoService.GetAutoIdByVin(trimmedVin).subscribe(
    (autoId: number) => {
      if (autoId) {
        const newItem = {
          label: trimmedVin,
          value: autoId
        };

        // Add to dropdown list options
        this.autoList.push(newItem);

        // Ensure autoIds array exists
        if (!this.model.autoIds) {
          this.model.autoIds = [];
        }

        // Add the real backend ID to selected autoIds
        if (!this.model.autoIds.includes(autoId)) {
          this.model.autoIds.push(autoId);
        }

        // Patch Reactive Form control to update the multi-select UI
        this.ngAddUpdateForm.patchValue({
          autoIds: this.model.autoIds
        });

        this.manualVinInput = '';
        this.toastr.success('VIN added successfully');
        console.log('✅ VIN added:', trimmedVin, 'with ID:', autoId);
      } else {
        this.toastr.error('VIN not found');
        console.warn('VIN not found');
      }
    },
    err => {
      if (err.status === 404) {
        this.toastr.error('VIN not found in the system');
      } else {
        this.toastr.error('Server error while fetching VIN');
        console.error('Error from GetAutoIdByVin:', err);
      }
    }
  );
}


  // Method to handle Enter key press
  onVinInputKeyPress(event: any) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addManualVin();
    }
  }


  // this to Clear VIN input and list in auto select list 
  private resetManualAutoSelection(): void {
    this.manualVinInput = '';
    this.model.autoIds = [];
    this.autoList = [];
    this.ngAddUpdateForm.patchValue({ autoIds: [] });
}



}
