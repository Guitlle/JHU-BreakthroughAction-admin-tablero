import {
    buildCollection,
    EntityReference,
    // @ts-ignore
} from "firecms";


type BKJHDatabaseRow = {
    Departamento: string;
    Municipio: string;
    Tipo_Dato: string;
    Tipo_Indicador: string;
    Codigo_Unico: string;
    Indicador: string;
    Indicador_Des: string;
    Fuente: string;
    Descripcion_corta: string;
    Valor: number;
    Cod_Dep: number;
    Codigo_Mun: number;
    Latitude: number;
    Longitude: number;
    edicion: EntityReference;
    published: boolean;
}

const rowsCollection = buildCollection<BKJHDatabaseRow>({
    name: "Database Rows",
    singularName: "Row",
    path: "dbrows",
    permissions: ({
                      entity,
                      path,
                      user,
                      authController,
                      context
                  }: {
                    entity: any,
                    path: any,
                    user: any,
                    authController: any,
                    context: any
                  }) => {
        const isAdmin = authController.extra?.roles.includes("admin");
        return ({
            edit: isAdmin,
            create: isAdmin,
            delete: isAdmin
        });
    },
    icon: "TableView",
    inlineEditing: false,
    properties: {
        Departamento: {
            name: "Departamento",
            validation: { required: true },
            dataType: "string"
        },
        Municipio: {
            name: "Municipio",
            validation: { required: true },
            dataType: "string"
        },
        Tipo_Dato: {
            name: "Tipo_Dato",
            validation: { required: true },
            dataType: "string"
        },
        Tipo_Indicador: {
            name: "Tipo_Indicador",
            validation: { required: true },
            dataType: "string"
        },
        Indicador: {
            name: "Indicador",
            validation: { required: true },
            dataType: "string"
        },
        Valor: {
            name: "Valor",
            validation: {
                required: true,
            },
            dataType: "number"
        },
        Cod_Dep: {
            name: "Codigo Depto",
            validation: {
                required: true,
            },
            dataType: "number"
        },
        Codigo_Mun: {
            name: "Codigo Municipio",
            validation: {
                required: true,
            },
            dataType: "number"
        },
        Latitud: {
            name: "Latitud",
            validation: {
                required: true,
            },
            dataType: "number"
        },
        Longitude: {
            name: "Longitude",
            validation: {
                required: true,
            },
            dataType: "number"
        }
    }
});

export default rowsCollection;
