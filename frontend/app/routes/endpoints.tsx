// import 

export default function Endpoints() {
  return (
    <div className="w-screen h-screen gap-[4px] grid grid-cols-3">
        <div className="col-span-2 bg-black">
            <div>
                <label for="url">URL</label>
                <input type="text" name="url" id="url"/>
            </div>
            <div>
                <label for="url">Inputs</label>
                <input type="text" name="url" id="url"/>
            </div>

            <div>
                <div className="flex items-center justify-center">
                    <div>Function Stack</div>
                    <div> + </div>
                </div>
                <div className="border-2 rounded">
                    
                </div>
            </div>
        </div>

        <div className="p-[24px] col-span-1 bg-red">
            <div>
                <label for="component">Component</label>
                <select name="component" id="component" className="w-full p-3 border border-gray-100 rounded">
                    <option value="Endpoint">Endpoint</option>
                </select>
            </div>
        </div>
    </div>
  );
}
