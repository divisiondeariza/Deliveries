# -*- coding: utf-8 -*-
import scrapy
from DeliverySpiderProject.CoordinatesURLTranslator import CoordinatesURLTranslator
from DeliverySpiderProject.items import Locations
from scrapy.selector.unified import Selector

class LocationSpider(scrapy.Spider):
    name = "LocationSpider"
    allowed_domains = ["domiciliosbogota.com"]
    coordinatesURLTranslator = CoordinatesURLTranslator()
    start_urls = coordinatesURLTranslator.getURLsFromCoordinatesCSV("coordinates.csv")

    def parse(self, response):
        sel = Selector(response)
        locations = Locations()
        locations["restaurantIDs"] = sel.xpath('//a/@data-id').extract()
        locations["coordinates"] = {}
        locations["coordinates"]["longitude"] = self.coordinatesURLTranslator.getLongitude(response.url)
        locations["coordinates"]["latitude"] = self.coordinatesURLTranslator.getLatitude(response.url)
        return locations
