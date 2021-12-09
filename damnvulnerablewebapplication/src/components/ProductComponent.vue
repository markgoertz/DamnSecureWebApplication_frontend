<template>
  <v-card>
    <v-data-table
        :headers="headers"
        :items="info"
        :search="search"
        loading-text="Loading... Please wait"
        :items-per-page="15"
        class="font-weight-bold text--black"
    >
      <template v-slot:top>
        <v-app-bar
            class="text-uppercase"
        >


          <v-toolbar-title  class="mx-4 text-uppercase">Product-Range</v-toolbar-title>
          <v-divider
              class="mx-4"
              inset
              vertical
          ></v-divider>

          <v-spacer></v-spacer>

          <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
          ></v-text-field>

          <v-spacer></v-spacer>

          <v-dialog
              v-model="dialog"
              max-width="500px"
          >
            <template v-slot:activator="{on,attrs}">
              <v-btn
                  color="secondary"
                  dark
                  class="mb-2"
                  v-bind="attrs"
                  v-on="on"
              >
                Add new Product
              </v-btn>
            </template>

            <!--Start of the user update and delete part.-->
            <v-card>
              <v-card-title>
                <span class="headline">{{formTitle}}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <form v-on:submit.prevent = "save">
                    <v-row>
                      <v-col
                          cols="12"
                      >
                        <v-text-field
                            v-model="editedItem.brand"
                            label="brand name"
                        >
                        </v-text-field>
                      </v-col>

                      <v-col
                          cols="12"
                      >
                        <v-text-field
                            v-model="editedItem.name"
                            label="Product name"
                        ></v-text-field>
                      </v-col>

                      <v-col
                          cols="12"
                      >
                        <v-text-field
                            v-model="editedItem.price"
                            label="Price in € euro"
                        ></v-text-field>
                      </v-col>

                      <v-col
                          cols="12"

                      >
                        <v-text-field
                            v-model="editedItem.stock"
                            label="stock levels"
                        >
                        </v-text-field>
                      </v-col>

                      <v-col
                          cols="12"

                      >
                        <v-text-field
                            v-model="editedItem.contents"
                            label="content levels"
                        ></v-text-field>
                      </v-col>

                      <v-col
                          cols="12"

                      >

                        <v-text-field
                            v-model="editedItem.measurement"
                            label="measurements"
                        ></v-text-field>



                      </v-col>
                      <v-col
                          cols="12"

                      >
                        <v-select
                            v-model="editedItem.category"
                            :items="categories"
                            item-text="name"
                            item-value="id"
                            dense
                            return-object
                            label="Category"
                        ></v-select>
                      </v-col>
                    </v-row>
                  </form>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="blue darken-1"
                    text
                    @click="close"
                >
                  Cancel
                </v-btn>
                <v-btn

                    color="blue darken-1"
                    text
                    v-if="formTitle === 'Add new Product'"
                    v-on:click="save"
                >
                  Save
                </v-btn>
                <v-btn
                    color="blue darken-1"
                    text
                    v-else
                    v-on:click="update(editedItem.productID)"
                >
                  Update
                </v-btn>

              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="headline">Are you sure you want to delete this item?</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
                <v-btn color="blue darken-1" text v-on:click="deleteItemConfirm(editedItem.productID)">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-app-bar>

        <hr/>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-icon
            small
            class="mr-2"
            @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
            small
            @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
      </template>

      <template v-slot:no-data>
        <v-btn
            color="primary"
            @click="initialize"
        >
          Reset
        </v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import ProductMethods from "@/router/Methods/ProductMethods";
import CategoryMethods from "@/router/Methods/CategoryMethods";
import router from "@/router";
import GeneralMethods from "@/router/Methods/GeneralMethods";
export default {
  name: 'App',
  data() {
    return {
      search: '',
      dialog: false,
      dialogDelete: false,
      headers: [
        {text: 'ID', value: 'productID'},
        {text: 'brand', value: 'brand'},
        {text: 'product', value: 'name'},
        {text: 'stock levels', value: 'stock'},
        {text: 'category', value: 'category.name'},
        {text: 'Actions', value: 'actions', sortable: false}
      ],

      info: [],
      categories:[],

      editedIndex: -1,

      editedItem: {
        productID:'',
        brand: '',
        name: '',
        price:'',
        stock: '',
        contents:'',
        measurement: '',
        category:{
          id:'',
          code:'',
          name:''
        }
      },

      defaultItem: {
        productID: '',
        brand: '',
        name: '',
        price:'',
        stock: '',
        contents:0,
        measurement: '',
        category:{
          id:'',
          code:'',
          name:''
        }
      },

    }
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Add new Product' : 'Edit Product '
    },
  },

  watch: {
    dialog(val) {
      val || this.close()
    },
    dialogDelete(val) {
      val || this.closeDelete()
    },
  },

  created() {
    this.initialize()
  },

  mounted() {
      ProductMethods.GetAllProducts()
          .then(response => {
          this.info = response.data
        })
       .catch(function (error) {
             console.log(error.status);
             if (error.response.status == 401) {
               router.push("/login")
             }
           }),

      CategoryMethods.getAllCategories()
          .then(response => {
          this.categories = response.data
        })
        .catch(function (error) {
          console.log(error.status);
          if (error.response.status == 401) {
            router.push("/login")
          }
        })
  },
  methods: {
    getColor(role) {
      if (role === 'Admin') return 'red'
      else if (role === "Store manager") return 'orange'
      else if (role == "User") return 'green'
      else return 'blue'
    },

    initialize() {
      this.info = []
      this.categories = []
    },

    editItem(item) {
      this.editedIndex = this.info.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    deleteItem(item) {
      this.editedIndex = this.info.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    deleteItemConfirm(id) {
     ProductMethods.DeleteProduct(id)
          .then(function (response) {
            console.log(response)
           GeneralMethods.SuccessNotificationWithSwal();
            })
         .catch(function (error) {
           console.log(error);
           if(error.response.status==(403)){
            GeneralMethods.ThrowUnauthenticatedException();
           }
           else if(error.response.status == 401){
             router.push("/product")
           }
           else{
             GeneralMethods.FailedExceptionWithSwal();
           }
         })
    },

    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.info[this.editedIndex], this.editedItem)
      } else {
        // this.info.push(this.editedItem)
        ProductMethods.CreateProduct(this.editedItem)
            .then(function (response) {
              console.log(response)
              GeneralMethods.SuccessNotificationWithSwal();
              window.setTimeout(function(){
                location.reload();
              } ,500);
            })
            .catch(function (error) {
              console.log(error);
              if(error.response.status==(403)){
                GeneralMethods.ThrowUnauthenticatedException();
              }
              else if (error.response.status == 401){
                router.push("/product")
              }
              else{
                GeneralMethods.FailedExceptionWithSwal();
              }
            })
      }
      this.close()
    },

    update(id) {
      if (this.editedIndex > -1) {
        ProductMethods.UpdateProduct(id,this.editedItem)
            .then(function (response) {
              console.log(response)
              GeneralMethods.SuccessNotificationWithSwal();
              window.setTimeout(function(){
                location.reload();
              } ,500);
            })
            .catch(function (error) {
              console.log(error.status);
              if(error.response.status==(403)){
                GeneralMethods.ThrowUnauthenticatedException();
              }
              else{
                router.push("/product")
              }
            })
      }

      else
      {
        Object.assign(this.info[this.editedIndex], this.editedItem)
      }
    }
  }
};
</script>
