package com.luv2code.ecommerce.config;

import com.luv2code.ecommerce.enitity.Country;
import com.luv2code.ecommerce.enitity.Product;
import com.luv2code.ecommerce.enitity.ProductcCategory;
import com.luv2code.ecommerce.enitity.Region;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

import javax.persistence.EntityManager;
import javax.persistence.metamodel.EntityType;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Configuration
public class MyDataRestConfig implements RepositoryRestConfigurer {

    private EntityManager entityManager;

    @Autowired
    public MyDataRestConfig(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {

        HttpMethod[] theUnsupportedAcctions = {HttpMethod.DELETE, HttpMethod.POST, HttpMethod.PUT};

        //disable the HTTP methods for Product:PUT, POT and DELETE
        disableHttpMethods(Product.class,config, theUnsupportedAcctions);

        //disable the HTTP methods for ProductCategory:PUT, POT and DELETE
        disableHttpMethods(ProductcCategory.class,config, theUnsupportedAcctions);

        disableHttpMethods(Country.class,config, theUnsupportedAcctions);
        disableHttpMethods(Region.class,config, theUnsupportedAcctions);

        exposeId(config);
    }

    private void disableHttpMethods(Class theClass,RepositoryRestConfiguration config, HttpMethod[] theUnsupportedAcctions) {
        config.getExposureConfiguration()
                .forDomainType(theClass)
                .withItemExposure(((metdata, httpMethods) -> httpMethods.disable(theUnsupportedAcctions)))
                .withCollectionExposure(((metdata, httpMethods) -> httpMethods.disable(theUnsupportedAcctions)));
    }


    //call an internal helper method
    private void exposeId(RepositoryRestConfiguration config) {

        //expose entity ids

        //get a list of all entity classes from the entity manager
        Set<EntityType<?>> entities= entityManager.getMetamodel().getEntities();

        //create an array of the entity type
        List<Class> entityClasses= new ArrayList<>();

        //get the entity types for the entities
        for (EntityType tempEntityType: entities){
            entityClasses.add(tempEntityType.getJavaType());
        }

        //expose the entity ids for the array of entity/domain types
        Class[] domainTypes= entityClasses.toArray(new Class[0]);
        config.exposeIdsFor(domainTypes);
    }
}