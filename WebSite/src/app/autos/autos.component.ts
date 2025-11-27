import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Form, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Auto, AutoById, Payment, PaymentType, SearchAuto, StatusType} from 'src/models/models';
import { AutoImagesService, AutoService, LoginService, LookupService,PaymentService,ResourcesService,UploadService} from '../../services/index';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DatePipe , DOCUMENT } from '@angular/common';
import { FileUpload } from 'primeng/fileupload';
import { appSettings } from 'src/appSettings/appSettings';
import { Galleria } from 'primeng/galleria';
import { ScriptService } from 'src/services/script.service';
declare let pdfMake: any;

import * as JSZip from 'jszip';
import { saveAs } from "file-saver";

import * as jSZipUtils from '../../assets/js/jszip-utils.js';
import { BaseComponent } from '../base/base.component';
import { TranslateService } from '@ngx-translate/core';

// to reduce the image size
// this is first solution
//import { NgxImageCompressService } from 'ngx-image-compress';

// this is second solution
import {Ng2ImgMaxService} from 'ng2-img-max';
import { forkJoin, Observable, Observer, of } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Component({
  selector: 'app-autos',
  templateUrl: './autos.component.html',
  styleUrls: ['./autos.component.css'],
})
export class AutosComponent extends BaseComponent implements OnInit {
  lookup_brands: any;
  lookup_color: any;
  clients: any;
  // to save the values comes from the API
  clientBuyerNames: any;
  // to save the values comes from the API
  updatePaymentStatusValues: any;
  lookup_auctions: any;
  lookup_buyAccount: any;
  lookup_city: any;
  lookup_loadPort: any;
  lookup_destination: any;
  lookup_paymentMethod: any;

  modelList: any[] = [];

  displayStatusList = [
    //{ name: 'Select Display Status', id: 0 },
    { name: 'Private', id: 1 },
    { name: 'Public', id: 2 },
  ];

  paperStatusList = [
    //{ name: 'Select Paper Status', id: 0 },
    { name: 'Ready', id: 1 },
    { name: 'Not Ready', id: 2 },
  ];

  carStatusList = [
    { name: 'Select Status', id: 0 },
    { name: 'Bought New', id: 1 },
    { name: 'Loaded', id: 2 },
    { name: 'Arrived', id: 3 },
  ];

  paymentTypes = [
    //{ name: 'select...', id: 0 },
    { name: 'Purchase Price', id: 1 },
    { name: 'Sea Freight', id: 2 },
    { name: 'Internal Shipping', id: 3 },
    { name: 'Fees', id: 4 },
    { name: 'Purchase Transfer', id: 5 },
    { name: 'Customs Clearance', id: 7 },
    { name: 'Storage Fees', id: 8 },
    { name: 'Other', id: 9 },
  ];

  searchForm: UntypedFormGroup;
  ngForm: UntypedFormGroup;
  paymentForm: UntypedFormGroup;

  isSubmitted: boolean = false;
  showDialog = false;

  autos: any[] = [];
  model: Auto = new Auto();
  showArchive = 0;
  selectedAutos: any[] = [];

  searchmodel: SearchAuto = new SearchAuto();

  carNames: any;
  page: any=1;
  pagepayment: any;

  files: File[] = [];
  formData = new FormData();
  showArchiveAllDialog: boolean = false;
  selectAuto: AutoById = new AutoById();
  paymentmodel: Payment = new Payment();
  showInvoiceDialog: boolean = false;
  invoiceAutoId: number = 0;

  totaldebit = 0;
  totalcredit = 0;
  required = 0;
  paymentDetails: any;
  paymentType = 0;

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

  sideMenuList: any[] = [];
  showClear: boolean = false;

  checkedAutos: number = 0;

  showArchiveDialog: boolean = false;
  archiveItem: any;

  showDeleteDialog: boolean = false;
  DeleteItem: any;

  showImagesDialog: boolean = false;
  DeleteImagesItem: any;
  ShowdeleteAllDialog: boolean = false;
  brandIdValidation = false;
  colorIdValidation = false;
  displayStatusValidation = false;
  modelValidation = false;
  buyerIdValidation = false;
  auctionIdValidation = false;
  cityIdValidation = false;
  loadPortIdValidation = false;
  destinationIdValidation = false;
  buyDateValidation = false;
  paginate=appSettings.pageinate;

  // added code to get the data from the data base per page size
  currentPage: number = 1;
  pageSize: number = appSettings.pageSize;
  totalRecords: number = 0;
  loading: boolean = false;
  Math = Math;

  // this code added to load payment per row in autos to show the invoice status
  paymentStatuses: { [autoId: number]: boolean } = {}; // or number if you want to show difference too

  constructor(
    private lookupService: LookupService,
    private autoService: AutoService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    fb: UntypedFormBuilder,
    private datePipe: DatePipe,
    private uploadService: UploadService,
    private paymentService: PaymentService,
    private autoImageService: AutoImagesService,
    private scriptService: ScriptService,
    public translate: TranslateService,
    public loginService: LoginService,
    private cdr: ChangeDetectorRef,
    public resource: ResourcesService,
    // to reduce the image size
    // this is the first way
    //private imageCompress: NgxImageCompressService,
    private ng2ImgMax: Ng2ImgMaxService,
    

    @Inject(DOCUMENT) public document: Document
  ) {
    super(loginService,translate, resource,document);
    
    this.scriptService.load('pdfMake', 'vfsFonts','jSZipUtils');
    // this.scriptService.load('pdfMake', 'vfsFonts');  

    this.ngForm = fb.group({
      id: [],
      creationUserId: [],
      creationDate: [],
      name: ['', Validators.required],
      brandId: ['', [Validators.required]],
      vinNo: ['', [Validators.required]],
      color: ['', [Validators.required]],
      engine: ['', [Validators.required]],
      displayStatus: ['', [Validators.required]],
      buyDate: ['', [Validators.required]],
      lot: ['', [Validators.required]],
      model: ['', [Validators.required]],
      buyerId: ['', [Validators.required]],
      auctionId: ['', [Validators.required]],
      buyingAccountId: ['', [Validators.required]],
      cityId: ['', [Validators.required]],
      loadPortId: ['', [Validators.required]],
      destinationId: ['', [Validators.required]],
      paperStatus: ['', [Validators.required]],
      // to save the values added from the angular form
      clientBuyerName: [],
      // to save the values added from the angular form
      updatePaymentStatus: [],
      clientBuyerNames: [],
      updatePaymentStatusValues: [],

    });

    this.searchForm = fb.group({
      vinNumber: [],
      lotNumber: [],
      client: [],
      auction: [],
      buyAccount: [],
      container: [],
      loadPort: [],
      destination: [],
      city: [],
      carId: [],
      deliveryFromDate: [],
      deliveryToDate: [],
      Status: [],
      purchaseFromDate: [],
      purchaseToDate: [],
      clientBuyerName:[],
      updatePaymentStatus:[],
      carName:[],
    });

    this.paymentForm = fb.group({
      id: [],
      categoryId: ['', Validators.required],
      paymentType: ['', Validators.required],
      amount: ['', Validators.required],
      payDate: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      notes: [],
    });
  }

  /*compressFiles(): void {
    // Example: Manual compression
    this.imageCompress.uploadFile().then(({ image, orientation }) => {
      // Compress the image (adjust quality as needed)
      this.imageCompress.compressFile(image, orientation, 50, 50).then(compressedImage => {
        // Handle the compressed image (e.g., send it to the API)
        console.log('Compressed image:', compressedImage);
      });
    });
  
    // Example: Automatic compression to a max size (in megabytes)
    const MAX_MEGABYTE = 2; // Set your desired max size
    this.imageCompress.uploadAndGetImageWithMaxSize(MAX_MEGABYTE).then(result => {
      // Handle the compressed image (within the specified max size)
      console.log('Compressed image within', MAX_MEGABYTE, 'MB:', result);
    });
  }*/
  
  ngOnInit(): void {
    
    this.LoadAutos(true, this.searchmodel);
    this.LoadModel();
    this.LoadLookups();
    this.LoadClients();
    this.LoadClientBuyerName();
    this.LoadUpdatePaymentStatus();
    this.LoadCarName();
    this.LoadSideMenu();
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

  LoadLookups() {
    this.lookupService.GetAllLookupValues().subscribe((res) => {
      this.lookup_brands = res.data.filter((x: any) => x.lookupId == 1);
      this.lookup_color = res.data.filter((x: any) => x.lookupId == 8);
      this.lookup_auctions = res.data.filter((x: any) => x.lookupId == 3);
      this.lookup_buyAccount = res.data.filter((x: any) => x.lookupId == 7);
      this.lookup_city = res.data.filter((x: any) => x.lookupId == 4);
      this.lookup_loadPort = res.data.filter((x: any) => x.lookupId == 2);
      this.lookup_destination = res.data.filter((x: any) => x.lookupId == 5);
      this.lookup_paymentMethod = res.data.filter((x: any) => x.lookupId == 10);
    });
  }

  LoadClients() {
    this.autoService.GetClients().subscribe(
      (res) => {
        if (res && res?.status == StatusType.Success) {
          if(this.hasPermission)
          {
          this.clients = res.data;
        }
        else
        {
          this.clients = res.data.filter((x:any) => x.id == localStorage.getItem('userId'));
        }
      }
      },
      (err) => {}
    );
  }
  // New columns for client buyer name to get values from the API
  LoadClientBuyerName() {
    this.autoService.GetClientBuyerName().subscribe(
      (res) => {
        if (res && res?.status == StatusType.Success) {
          this.clientBuyerNames = res.data;

        }
      },
      (err) => {}
    );
  }
  // New columns for Payment status Done or incompleate to get values from the API
  LoadUpdatePaymentStatus() {
    this.autoService.GetUpdatePaymentStatus().subscribe(
      (res) => {
        if (res && res?.status == StatusType.Success) {
          this.updatePaymentStatusValues = res.data;
          //console.log('model: ', this.ngForm.value.updatePaymentStatusValues);
    

        }
      },
      (err) => {}
    );
  }

  LoadModel() {
    for (let i = 2060; i > 1900; i--) {
      this.modelList.push({ name: i, id: i.toString() });
    }
  }

  LoadCarName() {
    this.autoService.GetCarName().subscribe(
      (res) => {
        if (res && res?.status == StatusType.Success) {
          this.carNames = res.data;
          //console.log('model: ', this.ngForm.value.carNames);

        }
      },
      (err) => {}
    );
  }

  saveAuto() {
    this.isSubmitted = true;
    this.validationCheck();
    if (this.ngForm.valid) {
      this.spinner.show();
      this.model = this.ngForm.value;
      //debugger
      this.autoService.SaveAuto(this.model).subscribe(
        (res) => {
          let emptyAttachments = this.files.length < 1;
          if (this.files.length < 1) {
            this.spinner.hide();
          }

          if (res && res?.status == StatusType.Success) {
            this.LoadAutos(true, this.searchmodel);
            this.LoadSideMenu();
            this.translate.get(['ArchiveComponent.SavedSuccessfully','ArchiveComponent.UpdateSuccessfully']).subscribe(res => {
              this.toastr.success(
                '',
                this.model.id < 1 ||
                  this.model.id == null ||
                  this.model.id == undefined
                  ? res['ArchiveComponent.SavedSuccessfully']
                  : res['ArchiveComponent.UpdateSuccessfully']
              );
            });

            super.RemoveBlackScreen();
           
            this.showDialog = false;
            let autoId =
              this.model.id < 1 ||
              this.model.id == null ||
              this.model.id == undefined
                ? res.data[0].id
                : this.model.id;
            this.UploadHandler(autoId);
            this.LoadAutos(true, this.searchmodel);
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
  }

  resetForm(form: UntypedFormGroup) {
    form.reset();
  }

  hideDialog() {
    this.showDialog = false;
    this.showArchiveDialog = false;
    this.showDeleteDialog = false;
    this.showImagesDialog = false;
    this.showInvoiceDialog = false;
    this.ShowdeleteAllDialog=false;
    this.showArchiveAllDialog=false;
    this.resetForm(this.ngForm);
    super.RemoveBlackScreen();
  }
  openArchiveAllDialog(){
    this.showArchiveAllDialog=true;

  }
  opendeleteAllDialog(){
    this.ShowdeleteAllDialog=true;

  }
  openDialog() {
    this.showDialog = true;
    this.isSubmitted = false;
    this.model = new Auto();
    this.model.containerId = null;
  }

  /*LoadAutos(showPinner = true, search: SearchAuto) {
    if (showPinner) {
      this.spinner.show();
    }
    this.autoService.GetAllByUser(search).subscribe(
      (res) => {
       // this.autos = res?.data;
if (res){
this.autos = res?.data;
}
else{
this.autos=[]
}
        this.spinner.hide();
      },
      (err) => {
        this.spinner.hide();
      }
    );
  }*/

    // added code to get the data from the data base per page size
    LoadAutos(showPinner = true, search: SearchAuto) {
      if (showPinner) {
        this.spinner.show();
      }

      // Inject pagination into the request body
      const requestWithPagination = {
        ...search,
        pageNumber: this.currentPage,
        pageSize: this.pageSize
      };

      // added code to get the data from the data base per page size
      //this.autoService.GetAllByUser(requestWithPagination).subscribe(
      this.autoService.GetAllByUser(requestWithPagination,this.currentPage, this.pageSize).subscribe(
        (res) => {
          if (res) {
            this.autos = res.data;
            this.totalRecords = res.totalRecords;
            // 🆕 Load payment status for each auto
            // this code added to load payment per row in autos to show the invoice status
            // Get payment status for all autos in curent page as one shot
            const autoIds = this.autos.map(auto => auto.id);
            this.paymentService.GetPaymentStatuses(autoIds).subscribe(res => {
              if (res && res.data) {
                Object.entries(res.data).forEach(([autoId, status]: [string, any]) => {
                  const paid = status.creditAmount || 0;
                  const required = status.requiredAmount || 0;
                  const debit = status.debit || 0;
                  //this.paymentStatuses[+autoId] = debit >= paid;

                  this.paymentStatuses[+autoId] = required > 0;
                });
              }
            });

          } else {
            this.autos = [];
            this.totalRecords = 0;
          }
          this.spinner.hide();
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
        this.LoadAutos(true, this.searchmodel);
      }
    }

  // added code to get the data from the data base per page size
  prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.LoadAutos(true, this.searchmodel);
      }
    }   

    


  editAuto(auto: any) {
    this.model = Object.assign({}, auto);
    this.model.buyDate = new Date(this.model.buyDate)
    this.showDialog = true;
  }
  
  openDeleteDialog(item: any) {
    this.DeleteItem = item;
    this.showDeleteDialog = true;
  }

  openDeleteImagesDialog(item: any) {
    this.DeleteImagesItem = item;
    this.showImagesDialog = true;
  }

  deleteAuto() {
    this.autoService.DeleteAuto(this.DeleteItem.id).subscribe(
      (res) => {
        this.spinner.hide();
        if (res && res?.status == StatusType.Success) {
          this.LoadAutos(false, this.searchmodel);
          this.LoadSideMenu();
          this.hideDialog();
          this.translate.get(['ArchiveComponent.DeleteSuccessfully']).subscribe(res => {
            this.toastr.success('', res['ArchiveComponent.DeleteSuccessfully']);
          });
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

  searchAuto() {
    this.showClear = true;
    this.searchmodel = Object.assign({}, this.searchForm.value);
    //console.error('Car Name:', this.searchmodel);
    //debugger
    // this.searchmodel.deliveryFromDate=this.searchmodel.deliveryFromDate? new Date(this.searchmodel.deliveryFromDate):this.searchmodel.deliveryFromDate;
    // this.searchmodel.deliveryToDate=this.searchmodel.deliveryToDate? new Date(this.searchmodel.deliveryToDate):this.searchmodel.deliveryToDate;
    // this.searchmodel.purchaseFromDate=this.searchmodel.purchaseFromDate? new Date(this.searchmodel.purchaseFromDate):this.searchmodel.purchaseFromDate;
    // this.searchmodel.purchaseToDate=this.searchmodel.purchaseToDate? new Date(this.searchmodel.purchaseToDate):this.searchmodel.purchaseToDate;
    this.page=1;
    // added code to get the data from the data base per page size
    this.currentPage = 1;   // reset to first page on new search
    this.searchmodel.isSearch = true;
    this.LoadAutos(true, this.searchmodel);
  }
  localToUtc(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
    }
  clearSearchForm() {
    this.resetForm(this.searchForm);
    // added code to get the data from the data base per page size
    this.searchmodel = new SearchAuto();
    this.LoadAutos(true, new SearchAuto());
    this.showClear = false;
    this.page=1;
    // added code to get the data from the data base per page size
    this.currentPage = 1;

  }

  DeleteAllAutos() {
    const selectedAutos = this.autos.filter((auto) => auto.checked);
    if (selectedAutos && selectedAutos.length > 0) {
      this.autoService.DeleteAutos(selectedAutos).subscribe(
        (res) => {
          if (res && res?.status == StatusType.Success) {
            this.LoadAutos(true, this.searchmodel);
            this.hideDialog();
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
      this.translate.get(['ArchiveComponent.SelectAtLeastOneAuto']).subscribe(res => {
        this.toastr.warning('', res['ArchiveComponent.SelectAtLeastOneAuto']);
      });
    }
  }

  openArchiveDialog(item: any) {
    this.archiveItem = item;
    this.showArchiveDialog = true;
  }
  archiveAuto() {
    this.autoService.ArchiveAuto(this.archiveItem.id).subscribe(
      (res) => {
        this.spinner.hide();
        if (res && res?.status == StatusType.Success) {
          this.LoadAutos(false, this.searchmodel);
          this.LoadSideMenu();
          this.hideDialog();
          this.translate.get(['ArchiveComponent.ArchiveSuccessfully']).subscribe(res => {
            this.toastr.success('', res['ArchiveComponent.ArchiveSuccessfully']);
          });
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

  archiveAllAutos() {
    const selectedAutos = this.autos.filter((auto) => auto.checked);
    if (selectedAutos && selectedAutos.length > 0) {
      this.autoService.ArchiveAutos(selectedAutos).subscribe(
        (res) => {
          if (res && res?.status == StatusType.Success) {
            this.LoadAutos(true, this.searchmodel);
            this.LoadSideMenu();
            this.hideDialog();
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
      this.translate.get(['ArchiveComponent.SelectAtLeastOneAuto']).subscribe(res => {
        this.toastr.warning('', res['ArchiveComponent.SelectAtLeastOneAuto']);
      });
    }
  }

  deleteImages() {
    this.autoService.DeleteImages(this.DeleteImagesItem.id).subscribe(
      (res) => {
        this.spinner.hide();
        if (res && res?.status == StatusType.Success) {
          this.LoadAutos(false, this.searchmodel);
          this.hideDialog();
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

  deleteImage(image: any,autoId:number) {
    // debugger;
    if (image && image.id && image.id > 0) {
      this.autoImageService.DeleteAutoImage(image.id).subscribe(
        (res) => {
          if (res && res?.status == StatusType.Success) {
           // this.getImages(image.autoid);
          this.hideDialog();

            this.translate.get(['ArchiveComponent.DeleteSuccessfully']).subscribe(res => {
              this.toastr.success('', res['ArchiveComponent.DeleteSuccessfully']);
            });
           this.getImages(autoId);
           // super.RemoveBlackScreen();
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

  // this is first solution
  /*onFileSelect(event: any): void {
    this.files = event.files;
    if (this.files.length > 0) {
      this.formData = new FormData();
      this.formData.delete('files');
      Array.from(this.files).forEach((file) => {
        this.compressImage(file); // Compress each file before appending
      });
    }
  }
  
  compressImage(file: any): void {
    this.imageCompress.compressFile(file, -1, 50, 50).then((compressedFile: any) => {
      // Append the compressed file to FormData
      this.formData.append('files', compressedFile, compressedFile.name);
    }).catch(error => {
      console.error('Error compressing image:', error);
    });
  }*/

  // second solution
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

  UploadHandler(autoId: number) {
    this.uploadService.uploadFile(this.formData, autoId, 1, 0).subscribe(
      (res) => {
        this.spinner.hide();
        this.onUploadCancel();
      },
      (err) => {
        this.spinner.hide();
      }
    );
  }

  openImagePopup(id: number) {
    this.spinner.show();
    this.images = [];
    this.activeIndex = 0;
    this.autoService.GetAutoById(id).subscribe(
      (res) => {
        // debugger;
        this.selectAuto = res.data;
        //console.log('All Images:', res.data.images);
        console.log('All Images:', res.data.deliveredDateStr);
        for (let i = 0; i < res.data.images.length; i++) {
          let toBeReplaced = 'assets/uploaded/';
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

    this.GetPayment(id);
  }

  openInvoice(autoId: number, buyerName: string) {
    this.paymentForm.reset();
    this.paymentmodel.clientName = buyerName;
    this.showInvoiceDialog = true;
    this.invoiceAutoId = autoId;
    this.isSubmitted = false;
  }

  saveInvoice(autoId: number) {
    this.isSubmitted = true;
    if (this.paymentForm.valid) {
      this.paymentmodel = this.paymentForm.value;
      this.paymentmodel.autoId = this.invoiceAutoId;
      this.paymentmodel.id =
        this.paymentmodel.id != null ? this.paymentmodel.id : 0;
      this.paymentService.SavePayment(this.paymentmodel).subscribe(
        (res) => {
          this.spinner.hide();
          if (res && res?.status == StatusType.Success) {
            this.showInvoiceDialog = false;
            this.paymentForm.reset();
            this.translate.get(['ArchiveComponent.SavedSuccessfully']).subscribe(res => {
              this.toastr.success('', res['ArchiveComponent.SavedSuccessfully']);
            });
            super.RemoveBlackScreen();
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
          this.spinner.hide();
        }
      );

      this.spinner.show();
    }
  }

  cancelInvoice() {

    this.paymentForm.reset();
  }

  getImages(autoId: number) {
    this.images=[];
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

  // closePreviewFullScreen() {
  //   if (document.exitFullscreen) {
  //       document.exitFullscreen();
  //   }
  //   else if (document['mozCancelFullScreen']) {
  //       document['mozCancelFullScreen']();
  //   }
  //   else if (document['webkitExitFullscreen']) {
  //       document['webkitExitFullscreen']();
  //   }
  //   else if (document['msExitFullscreen']) {
  //       document['msExitFullscreen']();
  //   }
  // }

  GetPayment(autoId: number) {
    this.paymentService.GetPayment(autoId).subscribe(
      (res) => {
        // debugger;
        if (res && res?.status == StatusType.Success && res.data != null) {
          this.totaldebit = res.data.debitAmount;
          this.totalcredit = res.data.creditAmount;
          this.paymentDetails = res.data.paymentDetails;
          //console.log(this.paymentDetails);
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

  LoadSideMenu() {
    let isArchive =
      <any>this.showArchive == true || this.showArchive == 1 ? 1 : 0;
    // let search = (this.autoService.search != null) ? this.autoService.search : "";
    // const userId = localStorage.getItem('userId');
    this.autoService.GetSideMenuByUser(isArchive).subscribe(
      (res) => {
        if (res) {
          this.sideMenuList = [];
          this.sideMenuList.push({
            label: 'All',
            labeltext: 'All',
            boughtNew: res.all.boughtNew,
            loaded: res.all.loaded,
            arrived: res.all.arrived,
            show:true
          });
          for (let i = 0; i < res.filteredAutos.length; i++) {
            this.sideMenuList.push({
              label: res.filteredAutos[i].loadPort,
              labeltext: res.filteredAutos[i].loadPort.replace(/\s/g, ""),
              loadPortId: res.filteredAutos[i].loadPortId,
              boughtNew: res.filteredAutos[i].boughtNew,
              loaded: res.filteredAutos[i].loaded,
              arrived: res.filteredAutos[i].arrived,
              show:true

            });
          }
        }
      },
      (err) => {}
    );
  }

  onSideItemClick(item: any, status: any) {
    let search = new SearchAuto();
    search.Status = status;
    if (item != null) {
      if (item.label == 'All') {
        this.LoadAutos(false, search);
      } else {
        search.loadPort = item.loadPortId;
        this.LoadAutos(false, search);
      }
    } else {
      this.LoadAutos(false, search);
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
    if (this.ngForm.value.brandId == '') {
      console.log('Brand selection changed:', this.ngForm.value.brandId);
      this.brandIdValidation = true;
    }
    if (this.ngForm.value.color == '') {
      console.log('Color selection changed:', this.ngForm.value.color);
      this.colorIdValidation = true;
    }
    if (this.ngForm.value.displayStatus == '') {
      this.displayStatusValidation = true;
    }
    if (this.ngForm.value.model == '') {
      this.modelValidation = true;
    }
    if (
      this.ngForm.value.buyerId == '' ||
      this.ngForm.value.buyerId == undefined
    ) {
      this.buyerIdValidation = true;
    }
    if (this.ngForm.value.auctionId == '') {
      this.auctionIdValidation = true;
    }
    if (this.ngForm.value.cityId == '') {
      this.cityIdValidation = true;
    }
    if (this.ngForm.value.loadPortId == '') {
      this.loadPortIdValidation = true;
    }
    if (this.ngForm.value.destinationId == '') {
      this.destinationIdValidation = true;
    }
    if (this.ngForm.value.buyDate?.toString().includes('GMT')) {
      this.buyDateValidation = true;
    }
  }

  onChangeBrand(event: any) {
    if ((this.model.brandId == null) || (this.model.brandId == 0)){
    this.brandIdValidation = true;
  } else this.brandIdValidation = false;
  }

  onChangeColor(event: any) {
    //console.log('Color selection changed:', event);
    //console.log('colorId:', this.model.colorId);
    if ((this.model.colorId == null) || (this.model.colorId == 0)){
      this.colorIdValidation = true;
    } else this.colorIdValidation = false;
  }

  onChangeDisplayStatus(event: any) {
    if (event.target.value == '') {
      this.displayStatusValidation = true;
    } else this.displayStatusValidation = false;
  }

  onChangeModel(event: any) {
    if (this.model.model == null){
      this.modelValidation = true;
    } else this.modelValidation = false;
  }

  onChangeBuyer(event: any) {
    if ((this.model.buyerId == null) || (this.model.buyerId == 0)){
      this.buyerIdValidation = true;
    } else this.buyerIdValidation = false;
  }

  onChangeAuction(event: any) {
    if ((this.model.auctionId == null) || (this.model.auctionId == 0)){
      this.auctionIdValidation = true;
    } else this.auctionIdValidation = false;
  }

  onChangeCityId(event: any) {
    if ((this.model.cityId == null) || (this.model.cityId == 0)){
      this.cityIdValidation = true;
    } else this.cityIdValidation = false;
  }

  onChangeloadPortId(event: any) {
    if ((this.model.loadPortId == null) || (this.model.loadPortId == 0)){
      this.loadPortIdValidation = true;
    } else this.loadPortIdValidation = false;
  }

  onChangedestinationId(event: any) {
    if (event.value == null) {
      this.destinationIdValidation = true;
    } else this.destinationIdValidation = false;
  }

  onChangeBuyDate(event: any) {
    if (event.target.value == '') {
      this.buyDateValidation = true;
    } else this.buyDateValidation = false;
  }

  async print() {
    const documentDefinition = await this.getDocumentDefinition();
    pdfMake.createPdf(documentDefinition).open();
  }

  async getDocumentDefinition() {
    return {
      content: [
        {
          text: '',
          bold: true,
          fontSize: 20,
          alignment: 'center',
          margin: [0, 0, 0, 20],
        },
        {
          image: await this.getBase64ImageFromURL(
            '../../assets/images/headerphoto.jpg'
          ),
          fit: [600, 500],
          absolutePosition: { x: 0, y: 0 },
        },
        {
          absolutePosition: { x: 20, y: 200 },
          columns: [
            [
              {
                text: 'To : ' + this.selectAuto.buyerName,
              },
              {
                text: 'Vin No : ' + this.selectAuto.vinNo,
              },
              {
                text: 'Car Name : ' + (this.selectAuto.name ? this.selectAuto.name : 'N/A'),
              },
              {
                text:
                  'Date : ' + this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
               // style: 'rightdate',
              },
              {
                text: 'Total Amount : ' + this.totaldebit,
                style: 'righttotal',
              },
              {
                text: 'Paid Amount : ' + this.totalcredit,
                style: 'rightdate',
              },
              {
                text: 'Required Amount : ' + this.required,
                style: 'rightdate',
              },
            ],
          ],
        },
        this.tabless(),
        // {
        //   //absolutePosition: { x: 50, y: 578 },
        //   style:'footer',
        //   columns: [
        //     [
        //       {
        //         text: 'Total Amount : ' + this.totaldebit + '        ' + 'Paid Amount : ' + this.totalcredit + '        ' + 'Required Amount : ' + this.required,
        //       }
        //     ],
        //   ],
        // },
        {
          image: await this.getBase64ImageFromURL(
            '../../assets/images/footerphoto.jpg'
          ),
          fit: [612, 700],
          absolutePosition: { x: 0, y: 592 },
        },        
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [20, 120, 0, 10],
          decoration: 'underline',
        },
        name: {
          fontSize: 16,
          bold: true,
        },
        jobTitle: {
          fontSize: 14,
          bold: true,
          italics: true,
        },
        sign: {
          margin: [0, 50, 0, 10],
          alignment: 'right',
          italics: true,
        },
        tableHeader: {
          bold: true,
		      background: '#17214b',
          color: '#fff',		  
        },
        righttotal: {
          margin: [400, -45, 0, 0],
        },
        rightdate: {
          margin: [400, 0, 0, 0],
        },
        table: {
          margin: [0, 200, 0, 0],
        },
        footer:{
          margin: [50, 100, 0, 0],
        }
      },
    };
  }

  getBase64ImageFromURL(url: any) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');

      img.onload = () => {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        var ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        var dataURL = canvas.toDataURL('image/png');

        resolve(dataURL);
      };

      img.onerror = (error) => {
        reject(error);
      };

      img.src = url;
    });
  }

  tabless() {
    return {
      style: 'table',
      table: {
        widths: ['*', '*', '*', '*', '*'],
        headerRows: 1,
        body: this.getPaymentDetailsAsTable(),
      },
    };
  }
  getPaymentDetailsAsTable() {
    var body = [];
    let columns = [
      'buyTypeStr',
      'cashTypeStr',
      'payDate',
      'paymentType',
      'amount',
    ];
    let columnsDisplayed = ['Type', 'Payment Method', 'Date', 'Payment Type', 'Amount'];
    body.push(columnsDisplayed);

    this.paymentDetails.forEach((row: any) => {
      var dataRow: any = [];
        columns.forEach((column) => {
          if(column == 'paymentType')
          {
            if(row[column] == 1) dataRow.push('Credit');
            if(row[column] == 2) dataRow.push('Debit');
          }
          else if (column == 'payDate') {
            dataRow.push(this.datePipe.transform(row[column], 'dd/MM/yyyy'));
          } else if (column == 'buyTypeStr') {
            switch (row[column]) {
              case 'purchaseprice':
                dataRow.push('Purchase price');
                break;
              case 'seafreight':
                dataRow.push('Sea freight');
                break;
              case 'innerfreight':
                dataRow.push('Inner freight');
                break;
              case 'fees':
                dataRow.push('Fees');
                break;
              case 'purchaseorder':
                dataRow.push('Purchase order');
                break;
              case 'customsclearance':
                dataRow.push('Customs clearance');
                break;
              case 'storagefees':
                dataRow.push('Storage fees');
                break;
              case 'other':
                dataRow.push('Other');
                break;
              default:
                dataRow.push(row[column]);
                break;
            }
          } else {
            dataRow.push(row[column]);
          }
        });

        body.push(dataRow);
      });

    return body;
  }


  DownlaodAll(){
    const zip = new JSZip();
    const name = this.selectAuto.vinNo + '.zip';  
    
    let count = 0;
    

    this.images.forEach((url) => {
      // i put the imagetitle as a file name insted of title because the title appeared above the image on the slider
      //const filename = url['title'];
      const filename = url['imagetitle'];
      //console.log('Images:', this.images);
      //console.log('Title:', filename);
      //console.log('Preview Image URL:', url['image']); // Print preview image URL
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
}
