import React from "react";
const Comment = (props) => {
   return (
         <>
           <div className="container">
               <div className="row justify-content-center">
                   <div 
                      className="col col-xl-11 col-lg-11 col-md-10 col-sm-8 col-xs-8">
                      <div 
                         className="card" 
                         style={{ 'width': '80%' }}>
                            
                        <div 
                           className="card-body" 
                           style={{ 'backgroundColor': '#edf0ed' }}>
                                
                                <b>{props.name} says</b>
                                <p>{props.description}</p>
                            
                          </div>
                      </div>
                    </div>
                </div>
            </div>
            <br />
        </>
)}
export default Comment;