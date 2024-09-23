import {
  Controller,
  Post,
  Route,
  Tags,
  Request,
  SuccessResponse,
  Response,
  Res,
  TsoaResponse,
} from "tsoa";
import { upload } from "../middlewares/uploadMiddleware";
import { Request as ExpressRequest } from "express";
import productCreateSchema from "@/schema/product-create-schema";
import Products, { ProductType } from "@/database/models/products"; // Import the Product model

@Route("upload")
@Tags("Upload")
export class UploadController extends Controller {
  @Post("/")
  @SuccessResponse("201", "Product created successfully")
  @Response("400", "Bad Request")
  public async uploadFile(
    @Request() request: ExpressRequest,
    @Res() badRequest: TsoaResponse<400, { message: string }>,
    @Res()
    successResponse: TsoaResponse<
      201,
      { message: string; product: ProductType }
    >
  ): Promise<void> {
    try {
      await new Promise<void>((resolve, reject) => {
        upload.single("image")(request, {} as any, (error: any) => {
          if (error) {
            return reject(error);
          }
          resolve();
        });
      });

      // Validate form data using Joi
      const { error: validationError, value } = productCreateSchema.validate(
        request.body,
        {
          abortEarly: false,
          convert: true,
        }
      );

      if (validationError) {
        const errorMessages = validationError.details
          .map((detail) => detail.message)
          .join(", ");
        return badRequest(400, {
          message: `Validation error: ${errorMessages}`,
        });
      }

      const file = request.file as Express.MulterS3.File;

      // Create a new product document
      const newProduct = new Products({
        name: value.name,
        price: value.price,
        category: value.category,
        stock: value.stock,
        fileLocation: file.location, // S3 file URL
      });

      // Save the product to MongoDB
      const savedProduct = await newProduct.save();

      return successResponse(201, {
        message: "Product created successfully",
        product: savedProduct,
      });
    } catch (error: any) {
      return badRequest(400, { message: error.message });
    }
  }
}
