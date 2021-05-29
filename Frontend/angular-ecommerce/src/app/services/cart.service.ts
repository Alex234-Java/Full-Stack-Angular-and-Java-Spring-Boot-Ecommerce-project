import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];

  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  constructor() { }

  addToCart(theCartItem: CartItem){

    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem = undefined!;

    if(this.cartItems.length > 0){

      existingCartItem = this.cartItems.find(tempCartItem => tempCartItem.id === theCartItem.id)!;

      alreadyExistsInCart= (existingCartItem != undefined);
    }

    if(alreadyExistsInCart){

      existingCartItem.quantity++;
    }
    else{
      this.cartItems.push(theCartItem);
    }

    this.computeCartTotals();
  }

  computeCartTotals() {
   
    let totalPriceVaule: number = 0;
    let totalQuantityValue: number = 0;

    for(let currentCartItem of this.cartItems){
      totalPriceVaule += currentCartItem.quantity * currentCartItem.unitPrice;
      totalQuantityValue +=currentCartItem.quantity;
    }

    this.totalPrice.next(totalPriceVaule);
    this.totalQuantity.next(totalQuantityValue);

    //for debugging puroposes
    this.logCartData(totalPriceVaule, totalQuantityValue);
  }

  logCartData(totalPriceVaule: number, totalQuantityValue: number) {
    console.log("Contents of the cart");
    for(let tempCartItem of this.cartItems){
      const subTotalPrice= tempCartItem.quantity * tempCartItem.unitPrice;
      console.log(`name: ${tempCartItem.name}, quantity: ${tempCartItem.quantity}, unitPrice: ${tempCartItem.unitPrice}, subTotalPrice= ${subTotalPrice}`);
    }

    console.log(`totalPrice: ${totalPriceVaule.toFixed(2)}, totalQuantity: ${totalQuantityValue}`);
  }

  decrementQuantity(theCartItem: CartItem) {
   theCartItem.quantity--;

   if(theCartItem.quantity === 0){
     this.remove(theCartItem);
   }
   else{
     this.computeCartTotals();
   }

  }

  remove(theCartItem: CartItem) {
    
    const itemIndex = this.cartItems.findIndex( tempCartItem => tempCartItem.id === theCartItem.id);

    if(itemIndex > -1){
      this.cartItems.splice(itemIndex, 1);
      this.computeCartTotals();
    }
  }


}
