# -*- coding: utf-8 -*-
from scrapy import signals
from DeliverySpiderProject.itemExporters import CsvOrderedItemExporter

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: http://doc.scrapy.org/en/latest/topics/item-pipeline.html


class MyprojectPipeline(object):
    def process_item(self, item, spider):
        return item
    
class SaveOrderedCsv(object):
    
    FIELDS_LISTS = {'LocationCsvSpider': ['id_restaurante',
                                          'nombre_restaurante',
                                          'latitud',
                                          'longitud'
                                          ],
                    'ProductCsvSpider':['restaurante',
                                        'tags_del_restaurante', 
                                        'categoria_producto',
                                        'nombre',
                                        'descripcion',
                                        'precio',
                                        'comida_colombiana',
                                        'comida_vegetariana',
                                        'ensaladas',
                                        'sanduches',
                                        'sopas',
                                        'comida_saludable'
                                        ],
                    'RestaurantCsvSpider':['nombre',
                                            'id',
                                            'pedido_minimo',
                                            'tiempo_de_entrega',
                                            'numero_categorias',
                                            'promedio_productos_por_menu',
                                            'total_productos',
                                            'menor_precio',
                                            'mayor_precio',
                                            'mediana_precios',
                                            'promedio_precios',
                                            'numero_comentarios',
                                            'puntuacion',
                                            'costo_domicilio',
                                            'acepta_efectivo',
                                            'acepta_credito',
                                            'acepta_debito',
                                            'acepta_sodexo',
                                            'posee_tags_buscados'
                                           
                                           ]
                    }
    
    def __init__(self):
        self.files = {}

    @classmethod
    def from_crawler(cls, crawler):
        pipeline = cls()
        crawler.signals.connect(pipeline.spider_opened, signals.spider_opened)
        crawler.signals.connect(pipeline.spider_closed, signals.spider_closed)
        return pipeline
    
    def spider_opened(self, spider):
        filename = spider.name.split("Csv")[0]
        file = open('%s.csv' % filename, 'w+b')
        self.files[spider] = file
        self.exporter = CsvOrderedItemExporter(file, fields_to_export = self.FIELDS_LISTS[spider.name])
        self.exporter.start_exporting()
    
    def spider_closed(self, spider):
        self.exporter.finish_exporting()
        file = self.files.pop(spider)
        file.close()
    
    def process_item(self, item, spider):
        self.exporter.export_item(item)
        return item