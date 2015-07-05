# -*- coding: utf-8 -*-
import scrapy
from scrapy.contrib.spiders import CrawlSpider, Rule
from DeliverySpiderProject.items import Product
import json
from scrapy.contrib.linkextractors.sgml import SgmlLinkExtractor
from DeliverySpiderProject.ProductLinkGetter import ProductLinkGetter


class ProductSpider(CrawlSpider):
    name = 'Product'
    allowed_domains = ['domiciliosbogota.com']
    start_urls = ['http://www.domiciliosbogota.com/']
    productLinkGetter = ProductLinkGetter()
    rules = (
        Rule(SgmlLinkExtractor(allow=())),
        Rule(SgmlLinkExtractor(allow=(),
                               tags = "li",
                               attrs = ("id",), 
                               process_value = productLinkGetter.getLink), 
             callback='parseProduct', follow=True),
    )
    
    def parseProduct(self, response):
        product = Product()
        product["product"] = json.loads(response.body)
        return product
