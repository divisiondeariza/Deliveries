'''
Created on 23/08/2015

@author: emmanuel
'''
from DeliverySpiderProject.spiders.Product import ProductSpider
from DeliverySpiderProject.items import ProductCsv
from DeliverySpiderProject.ProductDataExtractor import ProductDataExtractor

class ProductCsvSpider(ProductSpider):
    name = "ProductCsvSpider"
    tagList = ["Comida Colombiana", 
       "Comida Vegetariana", 
       "Ensaladas", 
       "Sanduches",
       "Comida Colombiana", 
       "Comida Saludable"]
    
    
    def parseProduct(self, response):
        product = ProductCsv()
        dataExtractor= ProductDataExtractor(response)
        product["restaurante"] = dataExtractor.getRestaurant()
        product["categoria_producto"] = dataExtractor.getProductCategory()
        product["nombre"] = dataExtractor.getName()
        product["descripcion"] = dataExtractor.getDescription()
        product["precio"] = dataExtractor.getPrice()
        product["comida_colombiana"] = dataExtractor.restaurantBelongsToTag("Comida Colombiana", "restaurants.json")
        product["comida_vegetariana"] = dataExtractor.restaurantBelongsToTag("Comida Vegetariana", "restaurants.json")
        product["ensaladas"] = dataExtractor.restaurantBelongsToTag("Ensaladas", "restaurants.json")
        product["sanduches"] = dataExtractor.restaurantBelongsToTag("Sanduches", "restaurants.json")
        product["sopas"] = dataExtractor.restaurantBelongsToTag("Sopas", "restaurants.json")
        product["comida_saludable"] = dataExtractor.restaurantBelongsToTag("Comida Saludable", "restaurants.json")
        product["otros_tags"] = dataExtractor.getRestaurantCategories("restaurants.json")
        if dataExtractor.restaurantBelongsToTagList(self.tagList, "restaurants.json"):            
            return product
        else:
            return None