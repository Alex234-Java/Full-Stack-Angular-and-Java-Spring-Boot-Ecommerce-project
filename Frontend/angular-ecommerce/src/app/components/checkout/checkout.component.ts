import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { Region as Region } from 'src/app/common/region';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { ShopFormService } from 'src/app/services/shop-form.service';
import { Luv2ShopValidators } from 'src/app/validators/luv2-shop-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup;
  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];

  shippingAddressRegions: Region[] = [];
  billingAddressRegions: Region[] = [];

  storage: Storage = sessionStorage;


  constructor(private formBuilder: FormBuilder,
              private shopForm: ShopFormService,
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router) { }

  ngOnInit(): void {

    this.reviewCartDetails();

    this.checkoutFormGroup=this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required,Validators.minLength(2),Luv2ShopValidators.notOnlyWhitespace]),
        lastName: new FormControl('', [Validators.required,Validators.minLength(2),Luv2ShopValidators.notOnlyWhitespace]),
        email: new FormControl(JSON.parse(this.storage.getItem('userEmail')!), [Validators.required,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required,Validators.minLength(2),Luv2ShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required,Validators.minLength(2),Luv2ShopValidators.notOnlyWhitespace]),
        region: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required,Validators.minLength(2),Luv2ShopValidators.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required,Validators.minLength(2),Luv2ShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required,Validators.minLength(2),Luv2ShopValidators.notOnlyWhitespace]),
        region:  new FormControl('', [Validators.required]),
        country:  new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required,Validators.minLength(2),Luv2ShopValidators.notOnlyWhitespace])
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        cardOwner: new FormControl('', [Validators.required,Validators.minLength(2),Luv2ShopValidators.notOnlyWhitespace]),
        cardNumber: new FormControl('', [Validators.pattern('[0-9]{16}'),Validators.required]),
        securityCode: new FormControl('', [Validators.pattern('[0-9]{3}'),Validators.required]),
        expirationMonth: [''],
        expirationYear: ['']
      })
    });

    //populate credit card months
    const startMonth: number = new Date().getMonth() + 1;
    console.log("startMonth: "+ startMonth);

    this.shopForm.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrived credit card months: "+ JSON.stringify(data))
        this.creditCardMonths = data;
      }
    );

    //populate credit card years
    this.shopForm.getCreditCardYears().subscribe(
      data =>{
        this.creditCardYears = data;
      }
    )

    //populate countries
    this.shopForm.getCountries().subscribe(
      data =>{
        console.log(JSON.stringify(data));
        this.countries = data;
      }
    )
  }

  reviewCartDetails() {
   
    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );

    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );
  }

  get firstName(){return this.checkoutFormGroup.get('customer.firstName'); }

  get lastName(){return this.checkoutFormGroup.get('customer.lastName'); }

  get email(){return this.checkoutFormGroup.get('customer.email'); }

  get shippingAddressStreet(){return this.checkoutFormGroup.get('shippingAddress.street'); }

  get shippingAddressCity(){return this.checkoutFormGroup.get('shippingAddress.city'); }

  get shippingAddressRegion(){return this.checkoutFormGroup.get('shippingAddress.region'); }

  get shippingAddressCountry(){return this.checkoutFormGroup.get('shippingAddress.country'); }

  get shippingAddressZipCode(){return this.checkoutFormGroup.get('shippingAddress.zipCode'); }

  get billingAddressStreet(){return this.checkoutFormGroup.get('billingAddress.street'); }

  get billingAddressCity(){return this.checkoutFormGroup.get('billingAddress.city'); }

  get billingAddressRegion(){return this.checkoutFormGroup.get('billingAddress.region'); }

  get billingAddressCountry(){return this.checkoutFormGroup.get('billingAddress.country'); }

  get billingAddressZipCode(){return this.checkoutFormGroup.get('billingAddress.zipCode'); }

  get creditCardType(){return this.checkoutFormGroup.get('creditCard.cardType'); }

  get creditCardOwner(){return this.checkoutFormGroup.get('creditCard.cardOwner'); }

  get creditCardNumber(){return this.checkoutFormGroup.get('creditCard.cardNumber'); }

  get creditCardSecurityCode(){return this.checkoutFormGroup.get('creditCard.securityCode'); }





  onSubmit(){
    console.log("Handling the submit button");

    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    let order = new Order();
    order.totalPrice = this.totalPrice
    order.totalQuantity = this.totalQuantity;

    const cartItems = this.cartService.cartItems;
    let orderItems: OrderItem[] = cartItems.map(tempCartItems => new OrderItem(tempCartItems));

    let purchase = new Purchase();

    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingRegion: Region = JSON.parse(JSON.stringify(purchase.shippingAddress.region));
    const shippingCountry: Region = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.region = shippingRegion.name;
    purchase.shippingAddress.country = shippingCountry.name;

    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingRegion: Region = JSON.parse(JSON.stringify(purchase.billingAddress.region));
    const billingCountry: Region = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.region = billingRegion.name;
    purchase.billingAddress.country = billingCountry.name;

    purchase.order = order;
    purchase.orderItems = orderItems;

    this.checkoutService.placeOrder(purchase).subscribe(
      {
        next: response => {
          alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);

          this.resetCart();
        },
        error: err =>{
          alert(`There was an error: ${err.message}`);
        }
      }
    );

    this.cartService.storage.clear();


  }

  resetCart(){
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    this.checkoutFormGroup.reset;

    this.router.navigateByUrl("/products");
  }

  handleMonthsAndYears(){
    
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear);
    
    let startMonth: number;

    if(currentYear === selectedYear){
      startMonth = new Date().getMonth() + 1;
    }
    else{
      startMonth=1;
    }

    this.shopForm.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrived credit card months: "+ JSON.stringify(data))
        this.creditCardMonths = data;
      }
    );
  }

  copyShippingToBillingAddress(event: any){
    
    if(event.target.checked){
      this.checkoutFormGroup.controls.billingAddress
            .setValue(this.checkoutFormGroup.controls.shippingAddress.value);

      this.billingAddressRegions = this.shippingAddressRegions;      
    }
    else{
      this.checkoutFormGroup.controls.billingAddress.reset();

      this.billingAddressRegions = []
    }
  }

  getRegions(formGroupName: string){

    const formGroup = this.checkoutFormGroup.get(formGroupName);
    
    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;

    console.log(`${formGroupName} countryCode: ${countryCode}`);
    console.log(`${formGroupName} countryName: ${countryName}`);

    this.shopForm.getRegions(countryCode).subscribe(
      data => {

        if(formGroupName === "shippingAddress"){
          this.shippingAddressRegions = data;
        }
        else{
          this.billingAddressRegions = data;
        }

        formGroup?.get('region')?.setValue(data[0]);
      }
    );
  }
}
