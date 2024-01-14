/**
 * @class SceneNode
 * @desc A SceneNode is a node in the scene graph.
 * @property {MeshDrawer} meshDrawer - The MeshDrawer object to draw
 * @property {TRS} trs - The TRS object to transform the MeshDrawer
 * @property {SceneNode} parent - The parent node
 * @property {Array} children - The children nodes
 */



class SceneNode {
    constructor(meshDrawer, trs, parent = null) {
        this.meshDrawer = meshDrawer;
        this.trs = trs;
        this.parent = parent;
        this.children = [];

        if (parent) {
            this.parent.__addChild(this);
        }
    }

    __addChild(node) {
        this.children.push(node);
    }

    MatrixMult( A, B )
    {
        var C = [];
        for ( var i=0; i<4; ++i ) {
            for ( var j=0; j<4; ++j ) {
                var v = 0;
                for ( var k=0; k<4; ++k ) {
                    v += A[j+4*k] * B[k+4*i];
                }
                C.push(v);
            }
        }
        return C;
    }

    transposeMatrix(matrix) {
        var result = new Array(16);
        for (var row = 0; row < 4; row++) {
            for (var col = 0; col < 4; col++) {
                result[col * 4 + row] = matrix[row * 4 + col];
            }
        }
        return result;
    }

    createTransformationMatrix(translation, rotation, scale) {
        // Create the translation matrix
        var translateMat = [
            1, 0, 0, translation[0],
            0, 1, 0, translation[1],
            0, 0, 1, translation[2],
            0, 0, 0, 1
        ];
    
        // Assuming rotation is in radians and around the z-axis
        // For simplicity, only a rotation around the z-axis is considered here
        var angle = rotation[2]; // Assuming rotation[2] is the angle in radians
        var cosA = Math.cos(angle);
        var sinA = Math.sin(angle);
        var rotateMat = [
            cosA, -sinA, 0, 0,
            sinA,  cosA, 0, 0,
            0,       0, 1, 0,
            0,       0, 0, 1
        ];
    
        // Create the scale matrix
        var scaleMat = [
            scale[0],       0,       0, 0,
                  0, scale[1],       0, 0,
                  0,       0, scale[2], 0,
                  0,       0,       0, 1
        ];
    
        // Combine the transformations by multiplying the matrices
        var transformMat = this.MatrixMult(rotateMat, this.MatrixMult(scaleMat, translateMat));
        return transformMat;
    }

    draw(mvp, modelView, normalMatrix, modelMatrix) {
        
        var incompleteMatrix = this.createTransformationMatrix(this.trs['translation'],this.trs['rotation'],this.trs['scale']);
        var transformationMatrix = this.transposeMatrix(incompleteMatrix);

        var transformedMvp = this.MatrixMult(mvp, transformationMatrix);
		var transformedModelView = this.MatrixMult(modelView, transformationMatrix);
        var transformedNormals = this.MatrixMult(normalMatrix, transformationMatrix);
        var transformedModel = this.MatrixMult(modelMatrix, transformationMatrix);

        // Draw the MeshDrawer
        if (this.meshDrawer) {
            this.meshDrawer.draw(transformedMvp, transformedModelView, transformedNormals, transformedModel);
        }

        // Draw all child nodes
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].draw(transformedMvp, transformedModelView, transformedNormals, transformedModel);
        }
    }



}