'''
Created on 25/08/2015

@author: emmanuel
'''
from DeliverySpiderProject.spiders.Location import LocationSpider
from scrapy.selector.unified import Selector
from DeliverySpiderProject.items import LocationCsv

class LocationCsvSpider(LocationSpider):
    name = "LocationCsvSpider"
    '''
    classdocs
    '''
    def parse(self, response):
        sel = Selector(response)
        restaurants = sel.xpath('//a[contains(@id, "establecimiento")]')
        for restaurant in restaurants:
            locationCsv = LocationCsv()
            locationCsv["id_restaurante"] = restaurant.css("a::attr(data-id)").extract()
            locationCsv["nombre_restaurante"] = restaurant.css("a .result-info h4::text").extract()
            locationCsv["latitud"] = self.coordinatesURLTranslator.getLatitude(response.url)
            locationCsv["longitud"] = self.coordinatesURLTranslator.getLongitude(response.url)
            yield locationCsv
