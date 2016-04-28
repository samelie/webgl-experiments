import Mesh from './mesh'

export default function(size, numSegments, withNormals=false, isInvert=false, drawType=4) {
	let positions = [];
	let coords    = [];
	let indices   = [];
	let normals   = [];
	let index     = 0;
	let gapUV     = 1/numSegments;

	let getPosition = function(i, j, isNormal=false) {	//	rx : -90 ~ 90 , ry : 0 ~ 360
		let rx        = i/numSegments * Math.PI - Math.PI * 0.5;
		let ry        = j/numSegments * Math.PI * 2;
		let r         = isNormal ? 1 : size;
		let pos       = [];
		pos[1]        = Math.sin(rx) * r;
		let t         = Math.cos(rx) * r;
		pos[0]        = Math.cos(ry) * t;
		pos[2]        = Math.sin(ry) * t;
		
		let precision = 10000;
		pos[0]        = Math.floor(pos[0] * precision) / precision;
		pos[1]        = Math.floor(pos[1] * precision) / precision;
		pos[2]        = Math.floor(pos[2] * precision) / precision;

		return pos;
	};

	
	for(let i=0; i<numSegments; i++) {
		for(let j=0; j<numSegments; j++) {
			positions.push(getPosition(i, j));
			positions.push(getPosition(i+1, j));
			positions.push(getPosition(i+1, j+1));
			positions.push(getPosition(i, j+1));

			if(withNormals) {
				normals.push(getPosition(i, j, true));
				normals.push(getPosition(i+1, j, true));
				normals.push(getPosition(i+1, j+1, true));
				normals.push(getPosition(i, j+1, true));	
			}
			

			let u = j/numSegments;
			let v = i/numSegments;
			
			
			coords.push([1.0 - u, v]);
			coords.push([1.0 - u, v+gapUV]);
			coords.push([1.0 - u - gapUV, v+gapUV]);
			coords.push([1.0 - u - gapUV, v]);

			indices.push(index*4 + 0);
			indices.push(index*4 + 1);
			indices.push(index*4 + 2);
			indices.push(index*4 + 0);
			indices.push(index*4 + 2);
			indices.push(index*4 + 3);

			index++;
		}
	}


	if(isInvert) {
		indices.reverse();
	}

	let mesh = new Mesh(drawType);
	mesh.bufferVertex(positions);
	mesh.bufferTexCoords(coords);
	mesh.bufferIndices(indices);
	if(withNormals) {
		mesh.bufferNormal(normals);
	}

	return mesh
};