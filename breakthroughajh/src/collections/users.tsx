import {
    buildCollection,
    EntityReference,
    // @ts-ignore
} from "firecms";


type User = {
  active: boolean;
  roles: string[];
}

const usersCollection = buildCollection<User>({
    name: "Users",
    singularName: "User",
    path: "users",
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
    icon: "AccountCircle",
    inlineEditing: false,
    customId: true,
    properties: {
        active: {
          dataType: "boolean",
          name: "Active User"
        },
        roles: {
          dataType: "array",
          name: "Roles",
          of: {
              dataType: "string",
              previewAsTag: true
          },
          expaned: true
        }
    }
});

export default usersCollection;
