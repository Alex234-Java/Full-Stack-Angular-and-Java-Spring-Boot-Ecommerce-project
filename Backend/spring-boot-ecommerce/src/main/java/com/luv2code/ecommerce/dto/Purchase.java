package com.luv2code.ecommerce.dto;

import com.luv2code.ecommerce.enitity.Address;
import com.luv2code.ecommerce.enitity.Customer;
import com.luv2code.ecommerce.enitity.Order;
import com.luv2code.ecommerce.enitity.OrderItem;
import lombok.Data;

import java.util.Set;

@Data
public class Purchase {

    private Customer customer;
    private Address shippingAddress;
    private Address billingAddress;
    private Order order;
    private Set<OrderItem> orderItems;
}
