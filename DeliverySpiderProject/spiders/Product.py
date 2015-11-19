# -*- coding: utf-8 -*-
from scrapy.spiders import CrawlSpider, Rule
from DeliverySpiderProject.items import Product
import json
from scrapy.linkextractors import LinkExtractor
from DeliverySpiderProject.ProductLinkGetter import ProductLinkGetter


class ProductSpider(CrawlSpider):
    name = 'Product'
    allowed_domains = ['domiciliosbogota.com']
    start_urls = ['http://www.domiciliosbogota.com/']
    productLinkGetter = ProductLinkGetter()
    rules = (
        Rule(LinkExtractor(allow=()), follow=True),
        Rule(LinkExtractor(allow=(),
                               canonicalize = False,
                               tags = "li",
                               attrs = ("id",), 
                               process_value = productLinkGetter.getLink), 
             callback='parseProduct', follow=True),
    )
    
    def parseProduct(self, response):
        product = Product()
        product["product"] = json.loads(response.body)
        return product
