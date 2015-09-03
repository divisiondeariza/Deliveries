'''
Created on 19/08/2015

@author: emmanuel
'''
from DeliverySpiderProject.spiders.Restaurant import RestaurantSpider
from DeliverySpiderProject.RestaurantSelector import RestaurantSelector
from DeliverySpiderProject.items import RestaurantCsv

class RestaurantCsvSpider(RestaurantSpider):
    name = "RestaurantCsvSpider"
    
    def parseRestaurants(self, response):
        categoriesList = ["Comida Colombiana", 
            "Comida Vegetariana", 
            "Ensaladas", 
            "Sanduches", 
            "Sopas", 
            "Comida Saludable"]              
        sel = RestaurantSelector(response)
        restaurant = RestaurantCsv()
        restaurant["nombre"] = sel.getName()   
        restaurant["id"] = self.restaurantIDsGetter.getID("/" + response.url.split("/")[-1])
        restaurant["pedido_minimo"] = sel.getMinOrderPrice() 
        restaurant["tiempo_de_entrega"] = sel.getDeliveryTimeInMinutes()    
        restaurant["numero_categorias"] = len(sel.getMenuCategories())
        restaurant["promedio_productos_por_menu"] = sel.getMeanProductsPerCategory()
        restaurant["total_productos"] = sel.getNumberOfProducts()
        restaurant["menor_precio"] =sel.getCheapestPriceForProduct()
        restaurant["mayor_precio"] =sel.getMostExpensivePriceForProduct()
        restaurant["mediana_precios"] =sel.getMedianOfPrices()
        restaurant["promedio_precios"] =sel.getMeanOfPrices()
        restaurant["numero_comentarios"] = sel.getQuantityOfComments()
        restaurant["puntuacion"] = sel.getAveragePunctuation()
        restaurant["costo_domicilio"] = sel.getDeliveryCost()
        restaurant["acepta_efectivo"] = sel.acceptsCash() 
        restaurant["acepta_credito"] = sel.acceptsCredit()
        restaurant["acepta_debito"] = sel.acceptsDebit()
        restaurant["acepta_sodexo"] = sel.acceptsSodexo()
        restaurant["posee_tags_buscados"] = sel.hasTagsFromList(categoriesList)                      
        return  restaurant
    
    